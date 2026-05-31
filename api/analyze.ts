import { createClient } from '@supabase/supabase-js';

const AI_LIMIT = 100;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // クライアントIPを取得
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    'unknown';

  const host = (req.headers['host'] as string) || 'unknown';
  const key = `${host}:${ip}`;

  try {
    // 使用回数チェック
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('count, first_used')
      .eq('key', key)
      .single();

    const currentCount: number = (usage as { count: number } | null)?.count ?? 0;

    if (currentCount >= AI_LIMIT) {
      return res.status(429).json({
        error: `AI読み取り上限（${AI_LIMIT}枚）に達しました。正式プランへのお申し込みをお願いします。`,
      });
    }

    // Anthropic API呼び出し
    const { base64Image, mimeType, dxfHint } = req.body as {
      base64Image: string;
      mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
      dxfHint?: { boundingBoxX: number; boundingBoxY: number; holeCount: number; bendLineCount: number };
    };

    const dxfContext = dxfHint
      ? `DXF解析結果（参考）: バウンディングボックス ${dxfHint.boundingBoxX}×${dxfHint.boundingBoxY}mm, 円・穴数 ${dxfHint.holeCount}個, 曲げ線 ${dxfHint.bendLineCount}本`
      : '';

    const prompt = `You are a sheet metal manufacturing expert. Analyze this engineering drawing and return JSON only (no markdown, no explanation).

${dxfContext}

## STEP 0 — READ ALL PAGES FIRST:
- Check for "PAGE X/Y", "P.X/Y", "Sheet X of Y" in title block or border.
- If multiple pages exist, read ALL pages before deciding any values.
- Holes shown with "対面同加工" or "×2" → multiply that hole count by 2.

## STEP 1 — CHECK MATERIAL REVISION:
- If a REVISIONS table (改訂欄) exists, find the LATEST revision (highest letter/number).
- Latest revision material overrides the main title block material field.

## STEP 2 — FIND FLAT BLANK DIMENSIONS:

**Case A – Explicit flat/expanded view exists (テンカイズ / 展開図 / BLANK label):**
- Read the overall outer rectangle of that view → prodX and prodY.
- A floating note "NNN.N × NNN.N" in the drawing body = blank size → use directly.
  Example: "490.5 × 103.9" written centrally = prodX=490.5, prodY=103.9

**Case B – No expanded view, bent part:**
Identify faces from END VIEW / CROSS-SECTION, sum face widths + bend allowances (t×0.4 per 90° bend).
- 2-face L-bracket: sum 2 faces + 1 allowance
- 3-face U/C-channel: sum 3 faces + 2 allowances
- 5-face hat: sum 5 faces + 4 allowances
- 6+ face frame: sum ALL faces + (n-1) allowances
⚠ WHEN NO EXPANDED VIEW EXISTS: NEVER use the front-view outer envelope directly for a bent part — calculate from face widths.
⚠ Stacked dimensions containing "0" = cumulative HOLE POSITIONS → do NOT sum as face widths.

**Case C – Flat plate (truly no bends):**
- Read the overall outer envelope from the plan view.
- Single long dimension arrow spanning the entire part = use that value directly.
- "N×P=Total" pitch notation is NOT the plate length.
- Largest value in a cumulative dimension chain = overall plate length.

**Case D – Tray with flanges on multiple edges:**
- prodX = main width + left flange + right flange
- prodY = main height + top flange + bottom flange

## STEP 3 — COUNT BENDS:

A bend = ANY fold in the sheet metal, regardless of angle (90°, 45°, 25°, 40°, or any other angle). Count ONLY bends supported by visual evidence:

**Evidence 1 – Cross-section or END VIEW shows a profile with steps/angles:**
- Each corner/junction in the profile = 1 bend
- L-shape = 1, U-shape = 2, hat = 4, complex staircase = count each step
- Angled flanges (e.g. 25°, 40°) shown in cross-section = count each as 1 bend

**Evidence 2 – Dashed lines (破線) in the TOP VIEW or FRONT VIEW:**
- A dashed line parallel to an edge spanning the full part width/length = a fold line = 1 bend
- Count each distinct dashed fold line

**Evidence 3 – Flange dimension visible in orthographic views:**
- A labeled dimension showing a tab/flange at the edge of the part in any view = 1 bend per flange
- Even small 5–20mm flanges count if they are labeled

**Evidence 4 – Isometric / 3D pictorial view:**
- If the drawing includes a 3D or isometric view showing the part shape, use it to confirm bends
- A visible angled face or bent flange in the 3D view = 1 bend, even if the angle is not 90°

**Evidence 5 – Angle annotation on drawing:**
- An explicit angle annotation (e.g. "25°", "40°", "R bend") near an edge = 1 bend at that location

**Rules:**
- Count ONLY bends you can visually confirm. Do NOT add bends just because of the part name.
- "4-φX" = 4 holes, NOT 4 bends. Never infer bends from hole notation.
- If the cross-section shows a flat rectangle with no steps → 0 bends.
- If you see an L-profile in the END VIEW with a small flange at bottom, that is 1 bend even if small.
- Non-90° bends still count as bends and require 曲げ加工.

When bendCount > 0: add {"name":"曲げ加工","qty":bendCount,"unit":"回"} to suggestedProcesses.

## STEP 4 — COUNT HOLES:
Count EVERY through-feature:
- Round holes: "φ10", "4-φ5.6", "3-φ10H7" → the prefix number is the count
- Taps (ALL sizes including M3): "2-M3", "4-M4", "M5タップ", "バーリングM4" → count each; add タップ加工
- Slots / 長丸穴: each slot = 1 hole
- Rectangular holes / 角穴: each = 1 hole
- "R3", "2-R5" = corner radii → NOT holes
- "対面同加工" or "×2" on a callout → multiply that group by 2
- Count holes across ALL pages

## STEP 5 — READ THICKNESS:
Priority order:
1. "t=X.X" or "板厚X.X" in the drawing notes or material field
2. Dimension on cross-section edge shown in brackets [X.XX]
3. Material line format "SPCC t1.6" or "SUS304 2.0" → thickness after "t" or the number
⚠ "12.5√", "3.2√", "▽▽" = surface roughness → NEVER thickness
⚠ Snap to nearest standard: Steel: 0.5,0.6,0.8,1.0,1.2,1.6,2.0,2.3,2.6,3.2,4.0,4.5,5.0,6.0,8.0,9.0; SUS: 0.6,0.8,1.0,1.2,1.5,2.0,2.5,3.0,4.0,5.0,6.0

## STEP 6 — DRAWING NUMBER (drawingNo):
Read from the **bottom-right title block** cell labeled "PART CODE" / "図番" / "DRAWING NO.".

VALID format: digits + hyphens + a few uppercase letters. Examples: 802-2-3302-966-XX-0, T180401-ST-01.

PERMANENTLY BANNED (never use as drawingNo):
- Any string containing "×" (multiplication) — e.g. "490.5×103.9" is a blank dimension
- Material specs: SEHC, SGHC, SECC, SPCC, SUS304, A5052 + thickness → material info
- Pure English words: FRAME, LEG, PANEL, BRACKET, COVER, SUPPORT
- Stamp text near seals: 受領, APPROVED, 製作図面
- Dimension-only strings like "490.5" or "103.9"

If the PART CODE cell is partially obscured by hatching, read each character individually from the grid.

## STEP 7 — PART NAME (partName):
Read from **bottom-right title block** cell labeled "NAME" / "品名" / "部品名".
- Part names are SHORT ALPHABET WORDS or JAPANESE: LEG, FRAME, BRACKET, コンベアプレート, 側板B
- NOT material specs (SEHC 20/20 = material)
- NOT dimensions (490.5×103.9 = dimension)
- NOT assembly references near stamps (PANEL A-SY near a seal = model name, not part name)
- When both a short word and a material-spec appear in the title block area, the short word is the part name.

## STEP 8 — MATERIAL:
SPC/SPCC/SGHC/SGCC/SPHC/SS400/SAPH440→"SPC", SECC/EG→"SECC",
SUS/SUS304→"SUS304", SUS316→"SUS316", SUS430→"SUS430",
A5052→"A5052", A1100→"A1100", A1050→"A1100", A6063→"A6063", Cu/銅→"Cu", unknown→"SPC"

## STEP 9 — FINAL CHECK BEFORE OUTPUT:
1. **prodX ≥ prodY rule**: If prodX < prodY → SWAP them. Always output the longer dimension as prodX.
2. **Anti-doubling check**: If the drawing shows a complete part view (not a half-view), do NOT multiply any dimension by 2. Only double a dimension if the drawing explicitly shows only half the part with a centerline axis of symmetry marked (中心線, SYMM, or ←→ axis indicator), AND a "2×" or "MIRROR" note.
3. **Y dimension check**: For bent parts (L-bracket, U-channel etc.), prodY must be the SUM of all face widths in the Y direction — not just the largest single face. If you calculated prodY from only one face, revisit and add the other face(s).
4. cornerCount = number of sharp outer vertices of the flat blank profile (rectangle=4, L-shape=6, each additional rectangular notch adds 2)

## Return this JSON:
{
  "drawingNo": "",
  "partName": "",
  "materialName": "",
  "thickness": 1.0,
  "prodX": 0,
  "prodY": 0,
  "matX": 0,
  "matY": 0,
  "holeCount": 0,
  "bendCount": 0,
  "cornerCount": 4,
  "suggestedProcesses": [
    {"name":"レーザー切断","qty":1,"unit":"枚"},
    {"name":"バリ取り","qty":1,"unit":"枚"}
  ],
  "confidence": 0.0,
  "notes": "explain your calculation"
}`;

    const fetchHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    };
    if (mimeType === 'application/pdf') {
      fetchHeaders['anthropic-beta'] = 'pdfs-2024-09-25';
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: mimeType === 'application/pdf'
            ? [
                { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Image } },
                { type: 'text', text: prompt },
              ]
            : [
                { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Image } },
                { type: 'text', text: prompt },
              ],
        }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(500).json({ error: `Anthropic API エラー: ${anthropicRes.status} ${err}` });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await anthropicRes.json() as { content: { type: string; text: string }[] };
    const text = data.content.find(c => c.type === 'text')?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    // 使用回数をインクリメント
    const now = new Date().toISOString();
    await supabase.from('ai_usage').upsert({
      key,
      ip,
      host,
      count: currentCount + 1,
      last_used: now,
      ...(currentCount === 0 ? { first_used: now } : {}),
    });

    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : '解析中にエラーが発生しました',
    });
  }
}

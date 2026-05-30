import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export async function pdfToBase64Image(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // 長辺が1600px以内になるようにスケールを自動調整（大きすぎるとブラウザでCanvas描画が失敗する）
  const MAX_PX = 1600;
  const baseViewport = page.getViewport({ scale: 1.0 });
  const baseLong = Math.max(baseViewport.width, baseViewport.height);
  const scale = Math.min(1.8, MAX_PX / baseLong);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  const ctx = canvas.getContext('2d')!;

  // ① 白背景を塗ってから通常レンダリング（透明PDF対策）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, canvas, viewport }).promise;

  function isBlank(): boolean {
    const checkPoints = [
      [Math.floor(canvas.width / 2), Math.floor(canvas.height / 2)],
      [Math.floor(canvas.width * 0.25), Math.floor(canvas.height * 0.25)],
      [Math.floor(canvas.width * 0.75), Math.floor(canvas.height * 0.25)],
      [Math.floor(canvas.width * 0.25), Math.floor(canvas.height * 0.75)],
      [Math.floor(canvas.width * 0.75), Math.floor(canvas.height * 0.75)],
    ];
    const blankCount = checkPoints.filter(([x, y]) => {
      const d = ctx.getImageData(x, y, 4, 4).data;
      return [...d].every((v, i) => i % 4 === 3 || v > 245);
    }).length;
    return blankCount >= 4;
  }

  // ② まだ白紙なら intent:'print' で再試行
  if (isBlank()) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      canvas,
      viewport,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      intent: 'print' as any,
    }).promise;
  }

  // ③ それでも白紙なら縮小スケールで最終試行
  if (isBlank()) {
    const smallScale = Math.min(scale, 1.0);
    const smallVp = page.getViewport({ scale: smallScale });
    canvas.width  = Math.round(smallVp.width);
    canvas.height = Math.round(smallVp.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      canvas,
      viewport: smallVp,
    }).promise;
  }

  if (isBlank()) {
    throw new Error('PDFの描画に失敗しました。このPDFはJPG/PNGに変換してから再アップロードしてください。');
  }

  return canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

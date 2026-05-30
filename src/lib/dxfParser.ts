import DxfParser from 'dxf-parser';
import type { DxfExtracted } from '../types';

const PAPER_SIZES = [
  [297, 210], [210, 297], [420, 297], [297, 420],
  [594, 420], [420, 594], [841, 594], [594, 841],
  [1189, 841], [841, 1189],
];
const PAPER_TOL = 8;
const SNAP = 0.5; // mm — endpoint snapping tolerance

function isPaperSize(w: number, h: number): boolean {
  return PAPER_SIZES.some(([pw, ph]) =>
    Math.abs(w - pw) <= PAPER_TOL && Math.abs(h - ph) <= PAPER_TOL
  );
}

function snapKey(x: number, y: number): string {
  return `${Math.round(x / SNAP)},${Math.round(y / SNAP)}`;
}

const NON_GEOM_TYPES = new Set([
  'DIMENSION', 'TEXT', 'MTEXT', 'INSERT', 'ATTDEF', 'ATTRIB',
  'VIEWPORT', 'LEADER', 'QLEADER', 'TOLERANCE',
]);
const NON_GEOM_LAYER_RE = /dim|寸法|text|文字|anno|note|注記|title|表題|frame|border|枠|datum|hatch|ハッチ/i;

export async function parseDxfFile(file: File): Promise<DxfExtracted> {
  const text = await file.text();
  const parser = new DxfParser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dxf = (parser as any).parseSync(text);

  // ---- Pass 1: per-layer bbox to detect border layers ----
  const layerBbox: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const entity of (dxf.entities as any[])) {
    if (NON_GEOM_TYPES.has(entity.type)) continue;
    const layer = String(entity.layer ?? '0');
    if (!layerBbox[layer]) layerBbox[layer] = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const bb = layerBbox[layer];
    for (const p of collectPoints(entity)) {
      bb.minX = Math.min(bb.minX, p.x); bb.maxX = Math.max(bb.maxX, p.x);
      bb.minY = Math.min(bb.minY, p.y); bb.maxY = Math.max(bb.maxY, p.y);
    }
  }

  const borderLayers = new Set<string>();
  for (const [layer, bb] of Object.entries(layerBbox)) {
    if (!isFinite(bb.maxX)) continue;
    const w = bb.maxX - bb.minX;
    const h = bb.maxY - bb.minY;
    console.log(`[dxfParser] layer "${layer}": ${w.toFixed(1)}×${h.toFixed(1)}`);
    if (isPaperSize(w, h)) {
      borderLayers.add(layer);
      console.log(`[dxfParser]   → border layer excluded`);
    }
  }

  // ---- Pass 2: find shared endpoints of LINE/ARC entities (= part outline corners) ----
  // Dimension extension lines touch the part edge but their far ends have count=1.
  // Part outline corners are shared by 2+ line segments → count >= 2.
  const pointCount = new Map<string, { x: number; y: number; n: number }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const entity of (dxf.entities as any[])) {
    if (!['LINE', 'ARC', 'LWPOLYLINE', 'POLYLINE'].includes(entity.type)) continue;
    const layer = String(entity.layer ?? '0');
    if (NON_GEOM_TYPES.has(entity.type) || NON_GEOM_LAYER_RE.test(layer) || borderLayers.has(layer)) continue;

    const pts: { x: number; y: number }[] = [];
    if (entity.startPoint) pts.push(entity.startPoint);
    if (entity.endPoint) pts.push(entity.endPoint);
    if (entity.vertices) for (const v of entity.vertices) pts.push(v);
    if (entity.center && entity.radius) {
      // arc endpoints from angles
      const r = entity.radius;
      const cx = entity.center.x, cy = entity.center.y;
      const sa = (entity.startAngle ?? 0) * Math.PI / 180;
      const ea = (entity.endAngle ?? 0) * Math.PI / 180;
      pts.push({ x: cx + r * Math.cos(sa), y: cy + r * Math.sin(sa) });
      pts.push({ x: cx + r * Math.cos(ea), y: cy + r * Math.sin(ea) });
    }

    for (const p of pts) {
      const key = snapKey(p.x, p.y);
      const existing = pointCount.get(key);
      if (existing) { existing.n++; } else { pointCount.set(key, { x: p.x, y: p.y, n: 1 }); }
    }
  }

  // Shared endpoints (count >= 2) = part outline points
  const sharedPts = [...pointCount.values()].filter(p => p.n >= 2);
  console.log(`[dxfParser] shared endpoints: ${sharedPts.length}`);

  let outlineMinX = Infinity, outlineMaxX = -Infinity;
  let outlineMinY = Infinity, outlineMaxY = -Infinity;
  for (const p of sharedPts) {
    outlineMinX = Math.min(outlineMinX, p.x); outlineMaxX = Math.max(outlineMaxX, p.x);
    outlineMinY = Math.min(outlineMinY, p.y); outlineMaxY = Math.max(outlineMaxY, p.y);
  }

  const useSharedBbox = sharedPts.length >= 4 && isFinite(outlineMaxX)
    && (outlineMaxX - outlineMinX) > 5 && (outlineMaxY - outlineMinY) > 5;

  if (useSharedBbox) {
    console.log(`[dxfParser] shared-endpoint bbox: ${(outlineMaxX - outlineMinX).toFixed(1)}×${(outlineMaxY - outlineMinY).toFixed(1)}`);
  }

  // ---- Pass 3: counts and final bbox ----
  let minX = useSharedBbox ? outlineMinX : Infinity;
  let maxX = useSharedBbox ? outlineMaxX : -Infinity;
  let minY = useSharedBbox ? outlineMinY : Infinity;
  let maxY = useSharedBbox ? outlineMaxY : -Infinity;
  let holeCount = 0;
  let bendLineCount = 0;
  const entityCounts: Record<string, number> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const entity of (dxf.entities as any[])) {
    entityCounts[entity.type] = (entityCounts[entity.type] || 0) + 1;

    const layer = String(entity.layer ?? '0');
    const skip = NON_GEOM_TYPES.has(entity.type) || NON_GEOM_LAYER_RE.test(layer) || borderLayers.has(layer);

    if (!useSharedBbox && !skip) {
      for (const p of collectPoints(entity)) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      }
    }

    if ((entity.type === 'CIRCLE' || entity.type === 'ELLIPSE') && !skip) {
      const r: number = entity.radius ?? 1;
      const cx: number = entity.center?.x ?? 0;
      const cy2: number = entity.center?.y ?? 0;
      const margin = 5;
      const insidePart = cx >= minX - margin && cx <= maxX + margin
        && cy2 >= minY - margin && cy2 <= maxY + margin;
      console.log(`[dxfParser] CIRCLE layer="${layer}" r=${r.toFixed(2)} insidePart=${insidePart}`);
      if (r >= 0.8 && r <= 80 && insidePart) holeCount++;
    }

    if (/bend|曲げ|fold/i.test(layer)) bendLineCount++;
  }

  const bbX = isFinite(maxX - minX) ? Math.round((maxX - minX) * 10) / 10 : 0;
  const bbY = isFinite(maxY - minY) ? Math.round((maxY - minY) * 10) / 10 : 0;
  console.log(`[dxfParser] result: bbox=${bbX}×${bbY}, holes=${holeCount}, bends=${bendLineCount}`);

  return {
    boundingBoxX: bbX,
    boundingBoxY: bbY,
    holeCount,
    bendLineCount,
    entities: Object.entries(entityCounts).map(([type, count]) => ({ type, count })),
    rawEntities: dxf.entities,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectPoints(entity: any): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  if (entity.vertices) for (const v of entity.vertices) pts.push({ x: v.x, y: v.y });
  if (entity.startPoint) pts.push(entity.startPoint);
  if (entity.endPoint) pts.push(entity.endPoint);
  if (entity.center) {
    const r = entity.radius || 0;
    pts.push({ x: entity.center.x - r, y: entity.center.y - r });
    pts.push({ x: entity.center.x + r, y: entity.center.y + r });
  }
  if (entity.position) pts.push(entity.position);
  return pts;
}

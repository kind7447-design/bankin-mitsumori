import type { AiExtracted, DxfExtracted } from '../types';

export async function analyzeDrawingImage(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'application/pdf',
  dxfHint?: DxfExtracted,
): Promise<AiExtracted> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType, dxfHint }),
  });

  const data = await response.json() as { error?: string } & AiExtracted;

  if (!response.ok) {
    throw new Error(data.error || '解析中にエラーが発生しました');
  }

  return data as AiExtracted;
}

export function mergeExtracted(ai: AiExtracted, dxf: DxfExtracted): AiExtracted {
  return {
    ...ai,
    prodX: dxf.boundingBoxX > 0 ? dxf.boundingBoxX : ai.prodX,
    prodY: dxf.boundingBoxY > 0 ? dxf.boundingBoxY : ai.prodY,
    holeCount: dxf.holeCount > 0 ? dxf.holeCount : ai.holeCount,
    bendCount: dxf.bendLineCount > 0 ? dxf.bendLineCount : ai.bendCount,
  };
}

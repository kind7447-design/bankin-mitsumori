export interface Material {
  name: string;
  thickness: number | null;
  density: number;
  unitPrice: number;
  matX?: number;   // 素材サイズX (mm)
  matY?: number;   // 素材サイズY (mm)
}

export interface ProcessItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  setupCost: number;        // 段取費（ロット按分）
  calcType?: 'perimeter' | 'perimeter_raw';   // perimeter=係数付き周長, perimeter_raw=実周長
  enabled: boolean;
}

export interface PartSpec {
  drawingNo: string;
  partName: string;
  customer: string;
  lotNo: number;
  qty: number;
  memo: string;
  materialName: string;
  thickness: number;
  density: number;
  matX: number;
  matY: number;
  prodX: number;
  prodY: number;
  cornerCount: number;
  matUnitPrice: number;
  scrapUnitPrice: number;
  includeScrap: boolean;  // スクラップ代金を材料費から差し引くか
}

export interface CalcResult {
  nestX: number;
  nestY: number;
  nesting: number;
  matWeight: number;
  reqWeight: number;
  prodWeight: number;
  scrapWeight: number;
  yieldRate: number;
  scrapValue: number;
  matCostPerPart: number;
  processCostPerPart: number;
  costPerPart: number;
  costTotal: number;
  marginAmount: number;
  subtotal: number;
  tax: number;
  totalWithTax: number;
  unitPriceExTax: number;
  // 周長計算（レーザー等）
  perimeter: number;
  thickCoeff: number;
  adjPerimeter: number;
}

export interface QuoteRow {
  spec: PartSpec;
  processes: ProcessItem[];
  marginRate: number;
  adjustment: number;
  result: CalcResult;
}

export interface Quote {
  id: string;
  createdAt: string;
  createdBy?: string;
  spec: PartSpec;
  processes: ProcessItem[];
  marginRate: number;
  adjustment: number;
  result: CalcResult;
  status: 'draft' | 'sent' | 'approved';
  rows: QuoteRow[];
}

export interface DxfExtracted {
  boundingBoxX: number;
  boundingBoxY: number;
  holeCount: number;
  bendLineCount: number;
  entities: { type: string; count: number }[];
  rawEntities: object[];
}

export interface AiExtracted {
  drawingNo: string;
  partName: string;
  materialName: string;
  thickness: number;
  prodX: number;
  prodY: number;
  matX: number;
  matY: number;
  holeCount: number;
  bendCount: number;
  cornerCount: number;
  suggestedProcesses: { name: string; qty: number; unit: string }[];
  confidence: number;
  notes: string;
}

export type AiProgressState = 'idle' | 'reading' | 'converting' | 'analyzing' | 'done' | 'error';

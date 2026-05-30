import type { Material, ProcessItem } from '../types';

export const INITIAL_MATERIALS: Material[] = [
  { name: 'SPC',         thickness: null, density: 7.85,  unitPrice: 180,   matX: 1000, matY: 2000 },
  { name: 'SPH',         thickness: null, density: 7.85,  unitPrice: 180,   matX: 1000, matY: 2000 },
  { name: 'SS400',       thickness: null, density: 7.85,  unitPrice: 200,   matX: 1000, matY: 2000 },
  { name: 'SECC',        thickness: null, density: 7.85,  unitPrice: 300,   matX: 1000, matY: 2000 },
  { name: 'NSDC0.6',     thickness: 0.6,  density: 8.256, unitPrice: 179.4, matX: 1000, matY: 2000 },
  { name: 'NSDC0.7',     thickness: 0.7,  density: 8.198, unitPrice: 0,     matX: 1000, matY: 2000 },
  { name: 'NSDC0.8',     thickness: 0.8,  density: 8.155, unitPrice: 176.4, matX: 1000, matY: 2000 },
  { name: 'NSDC1.0',     thickness: 1.0,  density: 8.094, unitPrice: 173.9, matX: 1000, matY: 2000 },
  { name: 'NSDC1.2',     thickness: 1.2,  density: 8.053, unitPrice: 173.9, matX: 1000, matY: 2000 },
  { name: 'NSDC1.6',     thickness: 1.6,  density: 8.0,   unitPrice: 169.4, matX: 1000, matY: 2000 },
  { name: 'NSDC2.0',     thickness: 2.0,  density: 7.97,  unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'NSDC2.3',     thickness: 2.3,  density: 7.957, unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'NSDC2.6',     thickness: 2.6,  density: 7.946, unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'NSDC3.2',     thickness: 3.2,  density: 7.925, unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'ZMO0.6',      thickness: 0.6,  density: 8.155, unitPrice: 0,     matX: 1000, matY: 2000 },
  { name: 'ZMO0.7',      thickness: 0.7,  density: 8.111, unitPrice: 166.1, matX: 1000, matY: 2000 },
  { name: 'ZMO0.8',      thickness: 0.8,  density: 8.078, unitPrice: 166.1, matX: 1000, matY: 2000 },
  { name: 'ZMO1.0',      thickness: 1.0,  density: 8.033, unitPrice: 163.1, matX: 1000, matY: 2000 },
  { name: 'ZMO1.2',      thickness: 1.2,  density: 8.003, unitPrice: 163.1, matX: 1000, matY: 2000 },
  { name: 'ZMO1.6',      thickness: 1.6,  density: 7.963, unitPrice: 158.6, matX: 1000, matY: 2000 },
  { name: 'ZMO2.0',      thickness: 2.0,  density: 7.94,  unitPrice: 157.1, matX: 1000, matY: 2000 },
  { name: 'ZMO2.3',      thickness: 2.3,  density: 7.93,  unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'ZMO2.6',      thickness: 2.6,  density: 7.923, unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'ZMO3.2',      thickness: 3.2,  density: 7.906, unitPrice: 167.9, matX: 1000, matY: 2000 },
  { name: 'A1100',       thickness: null, density: 2.71,  unitPrice: 1500,  matX: 1000, matY: 2000 },
  { name: 'A5052',       thickness: null, density: 2.68,  unitPrice: 1600,  matX: 1000, matY: 2000 },
  { name: 'SUS304',      thickness: null, density: 7.93,  unitPrice: 800,   matX: 1000, matY: 2000 },
  { name: 'SUS316',      thickness: null, density: 7.98,  unitPrice: 1200,  matX: 1000, matY: 2000 },
  { name: 'SUS430',      thickness: null, density: 7.7,   unitPrice: 600,   matX: 1000, matY: 2000 },
  { name: 'SUS430-KD',   thickness: null, density: 7.7,   unitPrice: 480,   matX: 1000, matY: 2000 },
  { name: '銅C1100',     thickness: null, density: 8.89,  unitPrice: 2200,  matX: 1000, matY: 2000 },
  { name: 'リン青銅',    thickness: null, density: 8.89,  unitPrice: 1900,  matX: 1000, matY: 2000 },
  { name: '真鍮(C2801)', thickness: null, density: 8.43,  unitPrice: 1400,  matX: 1000, matY: 2000 },
];

// Omit<ProcessItem, 'id' | 'qty' | 'enabled'> — qty は makeProcesses で設定
// ※ 加工費は参考値です。実際のチャージに合わせて「加工マスタ」から変更してください
export const INITIAL_PROCESSES: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[] = [
  // 周長ベース（板厚・サイズ自動計算）
  { name: 'レーザー切断', unit: 'mm', unitPrice: 0.48, setupCost: 1600, calcType: 'perimeter' },
  { name: '複合機',       unit: 'mm', unitPrice: 0.48, setupCost: 1600, calcType: 'perimeter' },
  { name: 'タレパン',     unit: 'mm', unitPrice: 0.16, setupCost: 1600, calcType: 'perimeter' },
  // 標準（段取費 ÷ ロット + 数量 × 単価）
  { name: 'タップ加工',         unit: '箇所', unitPrice: 8,    setupCost: 480 },
  { name: '曲げ加工',           unit: '回',   unitPrice: 20,   setupCost: 640 },
  { name: 'バリ取り',           unit: 'mm',   unitPrice: 0.064, setupCost: 0, calcType: 'perimeter_raw' },
  { name: 'スポット溶接',       unit: '点',   unitPrice: 16,   setupCost: 640 },
  { name: 'TIG溶接',            unit: '分',   unitPrice: 48,   setupCost: 640 },
  { name: '表面処理(メッキ)',   unit: '枚',   unitPrice: 320,  setupCost: 240 },
  { name: '塗装',               unit: '枚',   unitPrice: 480,  setupCost: 240 },
  { name: 'ザグリ加工',         unit: '箇所', unitPrice: 8,    setupCost: 320 },
  { name: 'スタッドボルト挿入', unit: '箇所', unitPrice: 12,   setupCost: 320 },
];

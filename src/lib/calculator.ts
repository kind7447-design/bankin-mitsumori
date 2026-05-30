import type { PartSpec, ProcessItem, CalcResult } from '../types';

export function calculate(
  spec: PartSpec,
  processes: ProcessItem[],
  marginRate: number,
  adjustment: number,
): CalcResult {
  const matXm  = spec.matX  / 1000;
  const matYm  = spec.matY  / 1000;
  const prodXm = spec.prodX / 1000;
  const prodYm = spec.prodY / 1000;
  const thickM = spec.thickness / 1000;
  const densityKg = spec.density * 1000;

  // 取り数X = floor((素材X - 40) / (製品X + 15))
  // 取り数Y = floor((素材Y - 100) / (製品Y + 15))
  const nestX = prodXm > 0 ? Math.floor((matXm - 0.04) / (prodXm + 0.015)) : 0;
  const nestY = prodYm > 0 ? Math.floor((matYm - 0.10) / (prodYm + 0.015)) : 0;
  const nesting = nestX * nestY;

  const matWeight  = matXm * matYm * thickM * densityKg;
  const reqWeight  = nesting > 0 ? matWeight / nesting : 0;
  const prodWeight = prodXm * prodYm * thickM * densityKg;
  const scrapWeight = Math.max(0, reqWeight - prodWeight);

  const yieldRate  = reqWeight > 0 ? prodWeight / reqWeight : 0;
  const scrapValue = scrapWeight * spec.scrapUnitPrice;
  // スクラップ代金を含める場合のみ差し引く（デフォルトは含めない）
  const matCostPerPart = reqWeight * spec.matUnitPrice - (spec.includeScrap ? scrapValue : 0);

  // ---- 周長計算（レーザー・複合機・タレパン共通）----
  // 外周長さ (mm)
  const perimeter = spec.prodX > 0 && spec.prodY > 0
    ? (spec.prodX + spec.prodY) * 2
    : 0;
  // 板厚係数: ≤1.2mm→板厚×1.0、≥1.3mm→板厚×0.75
  const thickCoeff = spec.thickness <= 1.2
    ? spec.thickness * 1.0
    : spec.thickness * 0.75;
  // 係数付き周長 = ROUNDUP(周長 × 板厚係数 / 2, 0)
  const adjPerimeter = Math.ceil(perimeter * thickCoeff / 2);

  const lot = spec.qty > 0 ? spec.qty : 1;

  // ---- 加工費計算 ----
  const processCostPerPart = processes
    .filter(p => p.enabled)
    .reduce((sum, p) => {
      const setupPerPart = (p.setupCost ?? 0) / lot;
      let variableCost: number;
      if (p.calcType === 'perimeter') {
        variableCost = p.unitPrice * adjPerimeter;
      } else if (p.calcType === 'perimeter_raw') {
        // 実周長（板厚係数なし）× 単価
        variableCost = p.unitPrice * perimeter;
      } else {
        variableCost = p.qty * p.unitPrice;
      }
      return sum + Math.ceil(setupPerPart + variableCost);
    }, 0);

  const costPerPart  = matCostPerPart + processCostPerPart;
  const costTotal    = costPerPart * spec.qty;
  const marginAmount = costTotal * marginRate;
  const subtotal     = costTotal + marginAmount + adjustment;
  const tax          = Math.round(subtotal * 0.1);
  const totalWithTax = subtotal + tax;
  const unitPriceExTax = spec.qty > 0 ? subtotal / spec.qty : 0;

  return {
    nestX, nestY, nesting,
    matWeight, reqWeight, prodWeight, scrapWeight,
    yieldRate, scrapValue, matCostPerPart,
    processCostPerPart, costPerPart, costTotal,
    marginAmount, subtotal, tax, totalWithTax, unitPriceExTax,
    perimeter, thickCoeff, adjPerimeter,
  };
}

/** 1工程の実際の計算コスト（ProcessTable表示用） */
export function calcProcessCost(
  p: ProcessItem,
  lot: number,
  adjPerimeter: number,
  perimeter: number = 0,
): number {
  if (!p.enabled) return 0;
  const setupPerPart = (p.setupCost ?? 0) / (lot > 0 ? lot : 1);
  const variable = p.calcType === 'perimeter'
    ? p.unitPrice * adjPerimeter
    : p.calcType === 'perimeter_raw'
    ? p.unitPrice * perimeter
    : p.qty * p.unitPrice;
  return Math.ceil(setupPerPart + variable);
}

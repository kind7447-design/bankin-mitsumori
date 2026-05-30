import type { CalcResult } from '../../types';

interface Props {
  result: CalcResult;
  qty: number;
}

const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString()}`;

export default function QuoteSummary({ result }: Props) {
  const unitPrice    = result.unitPriceExTax;
  const unitTax      = Math.round(unitPrice * 0.1);
  const unitWithTax  = Math.round(unitPrice + unitTax);
  // 諸経費/個 = 単価 - 材料費 - 加工費
  const miscPerPart  = unitPrice - result.matCostPerPart - result.processCostPerPart;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-gray-700">金額サマリ（1個あたり）</h3>
      </div>
      <div className="p-4 space-y-2 text-sm">
        <Row label="材料費"   value={fmtYen(result.matCostPerPart)} />
        <Row label="加工費"   value={fmtYen(result.processCostPerPart)} />
        <Row label="原価"     value={fmtYen(result.costPerPart)} />
        <Row label="諸経費"   value={fmtYen(miscPerPart)} />
        <div className="border-t pt-2 mt-2">
          <Row label="小計（税抜）" value={fmtYen(unitPrice)} bold />
          <Row label="消費税（10%）" value={fmtYen(unitTax)} />
          <Row label="合計（税込）" value={fmtYen(unitWithTax)} bold highlight />
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}

function Row({ label, value, bold, highlight }: RowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${highlight ? 'text-blue-700 text-base' : ''}`}>
        {value}
      </span>
    </div>
  );
}

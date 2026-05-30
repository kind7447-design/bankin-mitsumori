import type { CalcResult } from '../../types';

interface Props {
  result: CalcResult;
  qty: number;
}

const fmt = (n: number) => n.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
const fmtYen = (n: number) => `¥${Math.round(n).toLocaleString()}`;

export default function MaterialSummary({ result, qty }: Props) {
  const sheetsNeeded = result.nesting > 0
    ? (qty / result.nesting).toFixed(1)
    : '—';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">材料費サマリ</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
        <Row label="取数 X×Y" value={`${result.nestX} × ${result.nestY} = ${result.nesting}枚`} />
        <Row label="素材重量" value={`${fmt(result.matWeight)} kg`} />
        <Row label="所要重量/枚" value={`${fmt(result.reqWeight)} kg`} />
        <Row label="製品重量" value={`${fmt(result.prodWeight)} kg`} />
        <Row label="スクラップ重量" value={`${fmt(result.scrapWeight)} kg`} />
        <Row label="歩留り" value={`${(result.yieldRate * 100).toFixed(1)}%`} />
        <Row label="スクラップ代" value={fmtYen(result.scrapValue)} />
        <Row label="材料費/枚" value={fmtYen(result.matCostPerPart)} highlight />
        <Row label={`必要素材枚数（${qty}個ロット）`} value={`${sheetsNeeded} 枚`} highlight />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? 'font-semibold text-blue-700' : 'text-gray-700'}>{value}</span>
    </>
  );
}

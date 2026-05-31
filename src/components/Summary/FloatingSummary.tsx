import { useEffect, useRef, useState } from 'react';
import type { CalcResult } from '../../types';

interface Props {
  result: CalcResult;
  qty: number;
  marginRate: number;
}

function AnimatedValue({ value, color = 'text-gray-900' }: { value: string; color?: string }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`text-base font-bold tabular-nums transition-colors duration-300 ${flash ? 'text-blue-500' : color}`}>
      {value}
    </span>
  );
}

export default function FloatingSummary({ result, qty, marginRate }: Props) {
  const mat   = Math.round(result.matCostPerPart);
  const proc  = Math.round(result.processCostPerPart);
  const cost  = Math.round(result.costPerPart);
  const unit  = Math.round(result.unitPriceExTax);
  const total = Math.round(result.totalWithTax);

  const rows = [
    { label: '材料費 / 枚', value: mat,  bg: 'bg-orange-50',  labelColor: 'text-orange-800', valueColor: 'text-orange-700' },
    { label: '加工費 / 枚', value: proc, bg: 'bg-teal-50',    labelColor: 'text-teal-800',   valueColor: 'text-teal-700'   },
    { label: '原　価 / 枚', value: cost, bg: 'bg-gray-50',    labelColor: 'text-gray-700',   valueColor: 'text-gray-900'   },
  ];

  return (
    <div className="hidden xl:block fixed top-48 right-4 w-60 z-30">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-blue-600 px-4 py-2.5">
          <p className="text-white text-base font-semibold tracking-wide">金額サマリ</p>
        </div>

        {/* 明細 */}
        <div className="divide-y divide-gray-200">
          {rows.map(r => (
            <div key={r.label} className={`flex justify-between items-center px-4 py-2.5 ${r.bg}`}>
              <span className={`text-sm font-medium ${r.labelColor}`}>{r.label}</span>
              <AnimatedValue value={`¥${r.value.toLocaleString()}`} color={r.valueColor} />
            </div>
          ))}

          {/* 粗利率 */}
          <div className="flex justify-between items-center px-4 py-2.5 bg-white">
            <span className="text-sm font-medium text-gray-700">粗利率</span>
            <AnimatedValue value={`${Math.round(marginRate * 100)}%`} color="text-gray-900" />
          </div>
        </div>

        {/* 単価 */}
        <div className="px-4 py-3 bg-blue-50 border-t-2 border-blue-200">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-blue-800">単価（税抜）</span>
            <span className="text-xl font-extrabold text-blue-700 tabular-nums">¥{unit.toLocaleString()}</span>
          </div>
          {qty > 1 && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-500">× {qty}枚</span>
              <span className="text-gray-700 font-medium tabular-nums">¥{(unit * qty).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 合計 */}
        <div className="px-4 py-3 bg-blue-600">
          <span className="text-blue-100 text-sm font-medium">合計（税込）</span>
          <div className="text-right">
            <span className="text-xl font-extrabold text-white tabular-nums">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

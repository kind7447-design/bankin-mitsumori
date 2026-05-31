import type { ProcessItem } from '../../types';
import { calcProcessCost } from '../../lib/calculator';

interface Props {
  processes: ProcessItem[];
  lot: number;
  adjPerimeter: number;
  perimeter: number;
  onUpdate: (id: string, partial: Partial<ProcessItem>) => void;
  onRemove: (id: string) => void;
}

export default function ProcessTable({ processes, lot, adjPerimeter, perimeter, onUpdate, onRemove }: Props) {

  return (
    <div>
      <h3 className="font-semibold text-gray-700 border-b pb-1 mb-3">加工工程</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b text-xs">
              <th className="pb-2 w-8 text-center text-base">☑</th>
              <th className="pb-2">工程名</th>
              <th className="pb-2 w-20 text-right">数量</th>
              <th className="pb-2 w-12">単位</th>
              <th className="pb-2 w-20 text-right">レート(円)</th>
              <th className="pb-2 w-20 text-right">段取費(円)</th>
              <th className="pb-2 w-24 text-right">金額(円)</th>
              <th className="pb-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map(p => {
              const cost = calcProcessCost(p, lot, adjPerimeter, perimeter);
              const isPerimeter = p.calcType === 'perimeter' || p.calcType === 'perimeter_raw';
              const displayPerimeter = p.calcType === 'perimeter_raw' ? perimeter : adjPerimeter;
              return (
                <tr key={p.id} className={`border-b ${p.enabled ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={!!p.enabled}
                      onChange={(e) => onUpdate(p.id, { enabled: e.target.checked })}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-1">
                    <input
                      className={`input py-0.5 text-sm ${p.enabled ? 'text-gray-800 font-medium' : 'text-gray-500'}`}
                      value={p.name}
                      onChange={e => onUpdate(p.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="py-1">
                    {isPerimeter ? (
                      <span className="block text-right text-gray-400 text-xs pr-1"
                            title={p.calcType === 'perimeter_raw' ? `実周長: ${perimeter}mm` : `係数付き周長: ${adjPerimeter}mm`}>
                        {displayPerimeter}mm
                      </span>
                    ) : (
                      <input
                        className="input py-0.5 text-sm text-right w-20"
                        type="number"
                        min={0}
                        value={p.qty === 0 ? '' : p.qty}
                        onChange={e => onUpdate(p.id, { qty: e.target.value === '' ? 0 : Number(e.target.value) })}
                      />
                    )}
                  </td>
                  <td className="py-1 px-1 text-gray-500 text-xs">
                    {isPerimeter ? 'mm' : (
                      <input
                        className="input py-0.5 text-sm w-12"
                        value={p.unit}
                        onChange={e => onUpdate(p.id, { unit: e.target.value })}
                      />
                    )}
                  </td>
                  <td className="py-1">
                    <input
                      className="input py-0.5 text-sm text-right w-20"
                      type="number"
                      min={0}
                      step={isPerimeter ? 0.01 : 1}
                      value={p.unitPrice === 0 ? '' : p.unitPrice}
                      onChange={e => onUpdate(p.id, { unitPrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                  </td>
                  <td className="py-1">
                    <input
                      className="input py-0.5 text-sm text-right w-20"
                      type="number"
                      min={0}
                      value={(p.setupCost ?? 0) === 0 ? '' : p.setupCost}
                      onChange={e => onUpdate(p.id, { setupCost: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                  </td>
                  <td className={`py-1 text-right pr-1 ${p.enabled ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>
                    {p.enabled ? cost.toLocaleString() : '—'}
                  </td>
                  <td className="py-1">
                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-red-400 hover:text-red-600 px-1"
                      title="削除"
                    >×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import type { ProcessItem } from '../../types';

type MasterProcess = Omit<ProcessItem, 'id' | 'qty' | 'enabled'>;

interface Props {
  processes: MasterProcess[];
  onChange: (processes: MasterProcess[]) => void;
}

export default function ProcessMaster({ processes, onChange }: Props) {
  function update(idx: number, partial: Partial<MasterProcess>) {
    onChange(processes.map((p, i) => i === idx ? { ...p, ...partial } : p));
  }

  function remove(idx: number) {
    onChange(processes.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...processes, { name: '', unit: '枚', unitPrice: 0, setupCost: 0 }]);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">加工マスタ</h3>
        <button
          onClick={addRow}
          className="text-sm text-blue-600 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50"
        >
          ＋ 追加
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b text-xs">
              <th className="pb-2">工程名</th>
              <th className="pb-2">単位</th>
              <th className="pb-2">単価(円)</th>
              <th className="pb-2">段取費(円)</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm"
                    value={p.name}
                    onChange={e => update(i, { name: e.target.value })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-16"
                    value={p.unit}
                    onChange={e => update(i, { unit: e.target.value })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-24"
                    type="number"
                    value={p.unitPrice}
                    onChange={e => update(i, { unitPrice: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-24"
                    type="number"
                    value={p.setupCost ?? 0}
                    onChange={e => update(i, { setupCost: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1">
                  <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

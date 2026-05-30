import type { Material } from '../../types';

interface Props {
  materials: Material[];
  onChange: (materials: Material[]) => void;
}

export default function MaterialMaster({ materials, onChange }: Props) {
  function update(idx: number, partial: Partial<Material>) {
    const updated = materials.map((m, i) => i === idx ? { ...m, ...partial } : m);
    onChange(updated);
  }

  function remove(idx: number) {
    onChange(materials.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...materials, { name: '', thickness: null, density: 7.85, unitPrice: 0, matX: undefined, matY: undefined }]);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">材料マスタ</h3>
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
              <th className="pb-2">材質名</th>
              <th className="pb-2">板厚(mm)</th>
              <th className="pb-2">比重(g/cm³)</th>
              <th className="pb-2">単価(円/kg)</th>
              <th className="pb-2">素材X(mm)</th>
              <th className="pb-2">素材Y(mm)</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={i} className="border-b">
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm"
                    value={m.name}
                    onChange={e => update(i, { name: e.target.value })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-20"
                    type="number"
                    step="0.1"
                    placeholder="null"
                    value={m.thickness ?? ''}
                    onChange={e => update(i, { thickness: e.target.value ? Number(e.target.value) : null })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-24"
                    type="number"
                    step="0.001"
                    value={m.density}
                    onChange={e => update(i, { density: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-24"
                    type="number"
                    value={m.unitPrice}
                    onChange={e => update(i, { unitPrice: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-20"
                    type="number"
                    placeholder="—"
                    value={m.matX ?? ''}
                    onChange={e => update(i, { matX: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className="input py-0.5 text-sm w-20"
                    type="number"
                    placeholder="—"
                    value={m.matY ?? ''}
                    onChange={e => update(i, { matY: e.target.value ? Number(e.target.value) : undefined })}
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

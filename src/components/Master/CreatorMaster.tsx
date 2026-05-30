interface Props {
  creators: string[];
  onChange: (creators: string[]) => void;
}

export default function CreatorMaster({ creators, onChange }: Props) {
  function update(idx: number, value: string) {
    onChange(creators.map((c, i) => (i === idx ? value : c)));
  }

  function remove(idx: number) {
    onChange(creators.filter((_, i) => i !== idx));
  }

  function addRow() {
    onChange([...creators, '']);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">作成者マスタ</h3>
        <button
          onClick={addRow}
          className="text-sm text-blue-600 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50"
        >
          ＋ 追加
        </button>
      </div>
      <div className="space-y-2">
        {creators.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input py-1 text-sm flex-1"
              value={name}
              placeholder="担当者名"
              onChange={e => update(i, e.target.value)}
            />
            <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-sm">×</button>
          </div>
        ))}
        {creators.length === 0 && (
          <p className="text-xs text-gray-400">作成者が登録されていません</p>
        )}
      </div>
    </div>
  );
}

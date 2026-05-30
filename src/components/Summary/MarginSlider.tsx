interface Props {
  marginRate: number;
  adjustment: number;
  onMarginChange: (v: number) => void;
  onAdjustChange: (v: number) => void;
}

const DEFAULT_MARGIN_PCT = 20;

export default function MarginSlider({ marginRate, adjustment, onMarginChange, onAdjustChange }: Props) {
  const pct = Math.round(marginRate * 100);
  const delta = pct - DEFAULT_MARGIN_PCT;

  function step(diff: number) {
    const next = Math.min(50, Math.max(0, pct + diff));
    onMarginChange(next / 100);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">利益率</label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => step(-1)}
            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center"
          >−</button>
          <input
            type="number"
            min={0}
            max={50}
            step={1}
            value={pct}
            onChange={e => onMarginChange(Math.min(50, Math.max(0, Number(e.target.value))) / 100)}
            className="input text-sm text-center w-16"
          />
          <span className="text-sm text-gray-500">%</span>
          <button
            onClick={() => step(1)}
            className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center"
          >＋</button>
        </div>
        <span className="text-xs text-gray-400">基本: {DEFAULT_MARGIN_PCT}%</span>
        {delta !== 0 && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">調整額</label>
        <input
          type="number"
          value={adjustment}
          onChange={e => onAdjustChange(Number(e.target.value))}
          className="input text-sm flex-1"
          placeholder="0"
        />
        <span className="text-sm text-gray-500">円</span>
      </div>
    </div>
  );
}

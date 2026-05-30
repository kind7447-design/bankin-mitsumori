import { useState, useEffect } from 'react';
import type { PartSpec } from '../../types';

interface Props {
  spec: PartSpec;
  aiFields?: Set<string>;
  onChange: (partial: Partial<PartSpec>) => void;
}

export default function SizeInputs({ spec, aiFields, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 border-b pb-1">サイズ (mm)</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SizeField
          label="素材 X"
          value={spec.matX}
          aiHint={aiFields?.has('matX')}
          onChange={v => onChange({ matX: v })}
        />
        <SizeField
          label="素材 Y"
          value={spec.matY}
          aiHint={aiFields?.has('matY')}
          onChange={v => onChange({ matY: v })}
        />
        <SizeField
          label="製品 X"
          value={spec.prodX}
          aiHint={aiFields?.has('prodX')}
          onChange={v => onChange({ prodX: v })}
        />
        <SizeField
          label="製品 Y"
          value={spec.prodY}
          aiHint={aiFields?.has('prodY')}
          onChange={v => onChange({ prodY: v })}
        />
        <SizeField
          label="角部の数"
          value={spec.cornerCount}
          aiHint={aiFields?.has('cornerCount')}
          onChange={v => onChange({ cornerCount: Math.round(v) })}
        />
      </div>
    </div>
  );
}

interface SizeFieldProps {
  label: string;
  value: number;
  aiHint?: boolean;
  onChange: (v: number) => void;
}

function SizeField({ label, value, aiHint, onChange }: SizeFieldProps) {
  const [local, setLocal] = useState(value === 0 ? '' : String(value));

  // 外部から値が変わったとき（AI入力・材質選択など）は同期
  useEffect(() => {
    setLocal(value === 0 ? '' : String(value));
  }, [value]);

  function commit(str: string) {
    const n = parseFloat(str);
    if (!isNaN(n) && n >= 0) {
      onChange(n);
    } else {
      // 無効値はリセット
      setLocal(value === 0 ? '' : String(value));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
        {label}
        {aiHint && <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">AI</span>}
      </label>
      <input
        className="input"
        inputMode="decimal"
        value={local}
        placeholder="0"
        onChange={e => setLocal(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
}

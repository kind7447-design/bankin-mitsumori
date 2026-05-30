import { useState, useEffect } from 'react';
import type { PartSpec, Material } from '../../types';

interface Props {
  spec: PartSpec;
  materials: Material[];
  aiFields?: Set<string>;
  onChange: (partial: Partial<PartSpec>) => void;
}

// 数値入力フィールド（onBlurで確定）
function NumField({
  value, min, step, onChange
}: {
  value: number; min?: number; step?: number; onChange: (n: number) => void;
}) {
  const [local, setLocal] = useState(value === 0 ? '' : String(value));
  useEffect(() => { setLocal(value === 0 ? '' : String(value)); }, [value]);

  function commit(str: string) {
    const n = parseFloat(str);
    if (!isNaN(n) && (min === undefined || n >= min)) onChange(n);
    else setLocal(value === 0 ? '' : String(value));
  }

  return (
    <input
      className="input"
      type="number"
      min={min}
      step={step}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
    />
  );
}

export default function MaterialForm({ spec, materials, aiFields, onChange }: Props) {
  // 材質名またはマスタが変わったとき、素材サイズ・比重・単価を自動反映
  useEffect(() => {
    if (!spec.materialName) return;
    const mat = materials.find(m => m.name === spec.materialName);
    if (!mat) return;
    const updates: Partial<PartSpec> = {
      density: mat.density,
      matUnitPrice: mat.unitPrice,
    };
    if (mat.thickness !== null) updates.thickness = mat.thickness;
    if (mat.matX != null && mat.matX > 0) updates.matX = mat.matX;
    if (mat.matY != null && mat.matY > 0) updates.matY = mat.matY;
    onChange(updates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.materialName, materials]);

  function handleMaterial(name: string) {
    const mat = materials.find(m => m.name === name);
    if (!mat) return;
    onChange({
      materialName: mat.name,
      density: mat.density,
      matUnitPrice: mat.unitPrice,
      ...(mat.thickness !== null ? { thickness: mat.thickness } : {}),
      ...(mat.matX != null && mat.matX > 0 ? { matX: mat.matX } : {}),
      ...(mat.matY != null && mat.matY > 0 ? { matY: mat.matY } : {}),
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 border-b pb-1">基本情報</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="図番" aiHint={aiFields?.has('drawingNo')}>
          <input
            className="input"
            value={spec.drawingNo}
            onChange={e => onChange({ drawingNo: e.target.value })}
            placeholder="例: ABC-001"
          />
        </Field>
        <Field label="部品名" aiHint={aiFields?.has('partName')}>
          <input
            className="input"
            value={spec.partName}
            onChange={e => onChange({ partName: e.target.value })}
            placeholder="例: ブラケット"
          />
        </Field>
        <Field label="客先">
          <input
            className="input"
            value={spec.customer}
            onChange={e => onChange({ customer: e.target.value })}
            placeholder="例: ○○工業"
          />
        </Field>
        <Field label="ロットNo">
          <NumField value={spec.lotNo} min={1} onChange={n => onChange({ lotNo: n })} />
        </Field>
        <Field label="数量">
          <NumField value={spec.qty} min={1} onChange={n => onChange({ qty: n })} />
        </Field>
        <Field label="備考">
          <input
            className="input"
            value={spec.memo}
            onChange={e => onChange({ memo: e.target.value })}
          />
        </Field>
      </div>

      <h3 className="font-semibold text-gray-700 border-b pb-1 mt-4">材質</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="材質" aiHint={aiFields?.has('materialName')} className="sm:col-span-2">
          <select
            className="input"
            value={spec.materialName}
            onChange={e => handleMaterial(e.target.value)}
          >
            {materials.map(m => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </Field>
        <Field label="板厚 (mm)" aiHint={aiFields?.has('thickness')}>
          <NumField value={spec.thickness} min={0} step={0.1} onChange={n => onChange({ thickness: n })} />
        </Field>
        <Field label="比重 (g/cm³)">
          <NumField value={spec.density} min={0} step={0.001} onChange={n => onChange({ density: n })} />
        </Field>
        <Field label="材料単価 (円/kg)">
          <NumField value={spec.matUnitPrice} min={0} onChange={n => onChange({ matUnitPrice: n })} />
        </Field>
        <Field label="スクラップ価格 (円/kg)">
          <NumField value={spec.scrapUnitPrice} min={0} onChange={n => onChange({ scrapUnitPrice: n })} />
        </Field>
        <Field label="" className="sm:col-span-2 flex justify-start items-end">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-blue-600"
              checked={spec.includeScrap ?? false}
              onChange={e => onChange({ includeScrap: e.target.checked })}
            />
            スクラップ代金を材料費から差し引く
          </label>
        </Field>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  aiHint?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, aiHint, className = '', children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
        {label}
        {aiHint && (
          <span className="bg-blue-100 text-blue-600 text-xs px-1 rounded">AI</span>
        )}
      </label>
      {children}
    </div>
  );
}

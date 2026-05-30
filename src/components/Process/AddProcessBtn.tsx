import { useState } from 'react';
import type { ProcessItem } from '../../types';

interface Props {
  processMaster: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[];
  onAdd: (p: ProcessItem) => void;
}

export default function AddProcessBtn({ processMaster, onAdd }: Props) {
  const [open, setOpen] = useState(false);

  function addFromMaster(master: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>) {
    onAdd({
      ...master,
      id: crypto.randomUUID(),
      qty: 1,
      enabled: true,
    });
    setOpen(false);
  }

  function addCustom() {
    onAdd({
      id: crypto.randomUUID(),
      name: '新規工程',
      unit: '枚',
      qty: 1,
      unitPrice: 0,
      setupCost: 0,
      enabled: true,
    });
    setOpen(false);
  }

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50"
      >
        ＋ 工程を追加
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-48">
          {processMaster.map(m => (
            <button
              key={m.name}
              onClick={() => addFromMaster(m)}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              {m.name}
            </button>
          ))}
          <div className="border-t my-1" />
          <button
            onClick={addCustom}
            className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
          >
            カスタム工程を追加
          </button>
        </div>
      )}
    </div>
  );
}

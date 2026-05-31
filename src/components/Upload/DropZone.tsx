import { useRef, useState } from 'react';
import type { AiProgressState } from '../../types';
import AiProgressBar from './AiProgressBar';

interface Props {
  onFile: (file: File) => void;
  onManual: () => void;
  progress: AiProgressState;
  progressError?: string;
  confidence?: number;
  note?: string;
}

export default function DropZone({ onFile, onManual, progress, progressError, confidence, note }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  return (
    <div className="p-4">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="text-4xl mb-3">📂</div>
        <p className="text-gray-700 font-medium">図面ファイルをドロップ</p>
        <p className="text-gray-400 text-sm mt-1">DXF / PDF / PNG / JPEG 対応</p>
        <p className="text-blue-500 text-sm mt-2 underline">またはクリックして選択</p>
        <input
          ref={inputRef}
          type="file"
          accept=".dxf,.pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      <AiProgressBar state={progress} error={progressError} confidence={confidence} note={note} />

      <div className="mt-3 text-center">
        <button
          onClick={onManual}
          className="text-sm text-gray-500 hover:text-blue-600 underline"
        >
          手動入力で続ける
        </button>
      </div>
    </div>
  );
}

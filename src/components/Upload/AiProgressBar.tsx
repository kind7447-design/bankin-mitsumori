import type { AiProgressState } from '../../types';

interface Props {
  state: AiProgressState;
  error?: string;
  confidence?: number;
  note?: string;
}

const STEPS: { id: AiProgressState; label: string }[] = [
  { id: 'reading',   label: '読込中' },
  { id: 'converting', label: '変換中' },
  { id: 'analyzing', label: 'AI解析中' },
  { id: 'done',      label: '完了' },
];

const ORDER = ['reading', 'converting', 'analyzing', 'done'];

export default function AiProgressBar({ state, error, confidence, note }: Props) {
  if (state === 'idle') return null;

  const currentIdx = ORDER.indexOf(state);

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      {error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            {state !== 'done' && (
              <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            )}
            <span className="text-sm font-medium text-blue-700">
              {state === 'done' ? '解析完了' : '図面を解析しています…'}
            </span>
            {state === 'done' && confidence !== undefined && (
              <span className="text-sm text-green-600 font-medium">
                信頼度: {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
          {state === 'done' && note && (
            <details className="mt-1">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none list-none flex items-center gap-1">
                <span>▶ AI判断根拠を確認</span>
              </summary>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed border-t border-blue-200 pt-2">
                {note}
              </p>
            </details>
          )}
          <div className="flex gap-1">
            {STEPS.filter(s => s.id !== 'converting' || state === 'converting').map((step, i) => {
              const stepIdx = ORDER.indexOf(step.id);
              const done = stepIdx < currentIdx || state === 'done';
              const active = stepIdx === currentIdx;
              return (
                <div key={step.id} className="flex items-center gap-1 text-xs">
                  {i > 0 && <span className="text-gray-400">›</span>}
                  <span className={done ? 'text-green-600 font-medium' : active ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

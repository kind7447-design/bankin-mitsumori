import { useEffect, useState } from 'react';

const STEPS = [
  { id: 'step1', label: '図面アップロード', short: '図面' },
  { id: 'step2', label: '仕様確認',         short: '仕様' },
  { id: 'step3', label: '加工工程',         short: '加工' },
  { id: 'step4', label: '金額確認・出力',   short: '出力' },
];

export default function StepProgressBar() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = STEPS.findIndex(s => s.id === entry.target.id);
            if (idx !== -1) setActiveStep(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    STEPS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              {/* ステップボタン */}
              <button
                onClick={() => scrollTo(step.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  i === activeStep
                    ? 'bg-blue-600 text-white shadow-sm'
                    : i < activeStep
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === activeStep
                    ? 'bg-white text-blue-600'
                    : i < activeStep
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < activeStep ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </button>
              {/* 矢印 */}
              {i < STEPS.length - 1 && (
                <span className={`mx-1 text-xs ${i < activeStep ? 'text-blue-300' : 'text-gray-200'}`}>▶</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

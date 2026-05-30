import { getTrialDaysLeft, isTrialExpired, getAiReadCount, AI_LIMIT } from '../../lib/trial';

export default function Header() {
  const daysLeft = getTrialDaysLeft();
  const expired = isTrialExpired();
  const aiCount = getAiReadCount();
  const aiRemain = AI_LIMIT - aiCount;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-bold text-lg">🔧 板金見積システム</span>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">トライアル版</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
          {expired ? (
            <span className="text-red-600 font-medium">⚠ トライアル期間終了</span>
          ) : (
            <span>残り <strong className="text-blue-600">{daysLeft}日</strong></span>
          )}
          <span>AI読み取り: <strong className={aiRemain <= 10 ? 'text-orange-600' : 'text-blue-600'}>{aiCount}/{AI_LIMIT}枚</strong></span>
        </div>
      </div>
    </header>
  );
}

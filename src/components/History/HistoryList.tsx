import { useState, useMemo } from 'react';
import type { Quote } from '../../types';
import HistoryRow from './HistoryRow';

interface Props {
  quotes: Quote[];
  onSelect: (q: Quote) => void;
  onDelete: (id: string) => void;
  onDuplicate: (q: Quote) => void;
}

export default function HistoryList({ quotes, onSelect, onDelete, onDuplicate }: Props) {
  const [keyword, setKeyword] = useState('');
  const [creator, setCreator] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 作成者リスト（重複排除）
  const creatorOptions = useMemo(() => {
    const names = quotes.map(q => q.createdBy ?? '').filter(Boolean);
    return [...new Set(names)].sort();
  }, [quotes]);

  const filtered = useMemo(() => {
    return quotes.filter(q => {
      // キーワード
      if (keyword) {
        const kw = keyword.toLowerCase();
        const hit = [q.spec.drawingNo, q.spec.partName, q.spec.customer]
          .some(v => v?.toLowerCase().includes(kw));
        if (!hit) return false;
      }
      // 作成者
      if (creator && (q.createdBy ?? '') !== creator) return false;
      // 日付（from）
      if (dateFrom && q.createdAt < dateFrom) return false;
      // 日付（to）
      if (dateTo && q.createdAt > dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [quotes, keyword, creator, dateFrom, dateTo]);

  const hasFilter = keyword || creator || dateFrom || dateTo;

  function clearFilters() {
    setKeyword('');
    setCreator('');
    setDateFrom('');
    setDateTo('');
  }

  return (
    <div>
      {/* フィルタエリア */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          {/* キーワード */}
          <input
            type="text"
            placeholder="図番・部品名・客先で検索"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="input text-sm flex-1 min-w-48"
          />
          {/* 作成者 */}
          <select
            value={creator}
            onChange={e => setCreator(e.target.value)}
            className="input text-sm w-36"
          >
            <option value="">作成者：すべて</option>
            {creatorOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 whitespace-nowrap">期間</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="input text-sm w-36"
          />
          <span className="text-xs text-gray-400">〜</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="input text-sm w-36"
          />
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 ml-1"
            >
              ✕ クリア
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} / {quotes.length} 件
          </span>
        </div>
      </div>

      {/* 一覧 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>{quotes.length === 0 ? '見積履歴がありません' : '条件に一致する履歴がありません'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b bg-gray-50">
                <th className="py-2 px-3">日付</th>
                <th className="py-2 px-3">図番</th>
                <th className="py-2 px-3">部品名</th>
                <th className="py-2 px-3">客先</th>
                <th className="py-2 px-3 text-right">合計(税込)</th>
                <th className="py-2 px-3">状態</th>
                <th className="py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <HistoryRow
                  key={q.id}
                  quote={q}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

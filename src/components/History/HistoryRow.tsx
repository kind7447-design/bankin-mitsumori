import type { Quote } from '../../types';

interface Props {
  quote: Quote;
  onSelect: (q: Quote) => void;
  onDelete: (id: string) => void;
  onDuplicate: (q: Quote) => void;
}

const STATUS_LABEL: Record<Quote['status'], string> = {
  draft: '下書き',
  sent: '送付済',
  approved: '承認済',
};
const STATUS_COLOR: Record<Quote['status'], string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
};

export default function HistoryRow({ quote, onSelect, onDelete, onDuplicate }: Props) {
  return (
    <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(quote)}>
      <td className="py-2 px-3 text-sm">{new Date(quote.createdAt).toLocaleDateString('ja-JP')}</td>
      <td className="py-2 px-3 text-sm">{quote.spec.drawingNo}</td>
      <td className="py-2 px-3 text-sm font-medium">{quote.spec.partName}</td>
      <td className="py-2 px-3 text-sm text-gray-500">{quote.spec.customer}</td>
      <td className="py-2 px-3 text-sm text-right">
        ¥{Math.round(quote.result.totalWithTax).toLocaleString()}
      </td>
      <td className="py-2 px-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[quote.status]}`}>
          {STATUS_LABEL[quote.status]}
        </span>
      </td>
      <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(quote)}
            className="text-xs text-blue-600 hover:underline"
          >複製</button>
          <button
            onClick={() => onDelete(quote.id)}
            className="text-xs text-red-500 hover:underline ml-1"
          >削除</button>
        </div>
      </td>
    </tr>
  );
}

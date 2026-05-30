import type { Quote } from '../../types';
import { exportQuoteToExcel } from '../../lib/excelExport';

interface Props {
  quote: Quote;
}

export default function ExcelExportBtn({ quote }: Props) {
  return (
    <button
      onClick={() => exportQuoteToExcel(quote).catch(console.error)}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      <span>📊</span> Excel出力
    </button>
  );
}

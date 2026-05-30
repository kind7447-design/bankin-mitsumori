import type { Quote } from '../../types';
import { exportQuoteToPdf } from '../../lib/pdfExport';

interface Props {
  quote: Quote;
}

export default function PdfExportBtn({ quote }: Props) {
  return (
    <button
      onClick={() => exportQuoteToPdf(quote)}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      <span>📄</span> PDF出力
    </button>
  );
}

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-4">
        <img src="/logo.jpg" alt="株式会社 林製作所" className="h-10 object-contain" />
        <p className="text-gray-500 text-xs">精密板金 見積もりシステム</p>
        <div className="ml-auto">
          <a
            href="/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 border border-blue-300 rounded px-3 py-1 hover:bg-blue-50 transition-colors"
          >
            📋 マニュアル
          </a>
        </div>
      </div>
    </header>
  );
}

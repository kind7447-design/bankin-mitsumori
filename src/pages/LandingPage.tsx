export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      {/* ナビ */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <img src="/logo-web.png" alt="板金見積.com" className="h-10 w-auto" />
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            無料トライアルを始める →
          </a>
        </div>
      </nav>

      {/* ヒーロー */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-blue-50 to-white text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
            板金製造業向け AI見積システム
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            図面をアップするだけで<br />
            <span className="text-blue-600">見積が1分で完成</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10">
            AIが材質・サイズ・加工費を自動計算。誰でも・すぐに・正確な見積書を作れます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-md transition"
            >
              14日間 無料で試す
            </a>
            <a
              href="#demo"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-4 rounded-xl text-lg transition"
            >
              デモを見る ▼
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">初期費用なし・インストール不要・クレジットカード不要</p>
        </div>
      </section>

      {/* 課題 */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
            こんなお悩みはありませんか？
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⏱', title: '見積に時間がかかる', desc: '1件あたり20〜30分。急な依頼に対応できない。' },
              { icon: '👤', title: '担当者によってブレる', desc: 'ベテランが休むと見積が止まる。属人化が深刻。' },
              { icon: '📂', title: '履歴管理が煩雑', desc: 'ExcelやPDFが散在し、過去の見積が見つからない。' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解決策 */}
      <section className="py-20 px-6 bg-white" id="demo">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
            板金見積.comが解決します
          </h2>
          <p className="text-center text-gray-500 mb-12">図面をドロップするだけ。あとはAIにお任せ。</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { step: '01', title: '図面をアップロード', desc: 'PDF・画像・DXFをドラッグ＆ドロップ。AIが材質・板厚・製品サイズを自動読み取り。' },
              { step: '02', title: '仕様を確認・修正', desc: 'AIの読み取り結果をその場で修正。黄色いハイライトで推定箇所が一目でわかる。' },
              { step: '03', title: '加工工程を選択', desc: 'レーザー・曲げ・バリ取りなど必要な工程にチェックを入れるだけ。単価は自社マスタで管理。' },
              { step: '04', title: 'Excel・PDFで出力', desc: '粗利調整後にボタン1つで見積書を出力。クラウドに自動保存され、いつでも呼び出せる。' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 p-6 bg-blue-50 rounded-2xl">
                <div className="text-3xl font-extrabold text-blue-200 shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サンプル見積結果 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-800">
            出力サンプル
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">SPC 2.3mm／200×150mm／レーザー切断＋曲げ加工（数量10枚）</p>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <span className="text-white font-bold text-lg">見積計算結果</span>
              <span className="bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">数量：10枚</span>
            </div>
            {/* 明細 */}
            <div className="divide-y divide-gray-100">
              {[
                { label: '材料費（1枚）', value: '¥1,250', sub: 'SPC 2.3mm｜歩留り 68%', highlight: false },
                { label: '加工費（1枚）', value: '¥2,800', sub: 'レーザー切断＋曲げ2回＋バリ取り', highlight: false },
                { label: '原　価（1枚）', value: '¥4,050', sub: '', highlight: false },
                { label: '諸経費（粗利20%）', value: '¥810', sub: '', highlight: false },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{row.label}</div>
                    {row.sub && <div className="text-xs text-gray-400 mt-0.5">{row.sub}</div>}
                  </div>
                  <div className="text-base font-semibold text-gray-800">{row.value}</div>
                </div>
              ))}
              {/* 小計 */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div className="text-sm font-bold text-gray-700">単価（税抜）</div>
                <div className="text-lg font-bold text-blue-600">¥4,860</div>
              </div>
              <div className="flex items-center justify-between px-6 py-3">
                <div className="text-sm text-gray-500">消費税（10%）</div>
                <div className="text-sm text-gray-500">¥486</div>
              </div>
              <div className="flex items-center justify-between px-6 py-5 bg-blue-50">
                <div className="font-bold text-gray-800">合計（10枚・税込）</div>
                <div className="text-2xl font-extrabold text-blue-700">¥53,460</div>
              </div>
            </div>
            {/* フッター */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-3 py-1">📊 Excel出力</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-3 py-1">📄 PDF出力</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-3 py-1">💾 クラウド保存</span>
            </div>
          </div>
        </div>
      </section>

      {/* 比較表 */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800">
            導入前・後の比較
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-gray-100 text-left text-gray-600 font-semibold w-1/3"></th>
                  <th className="py-4 px-6 bg-gray-100 text-center text-gray-500 font-semibold w-1/3">導入前</th>
                  <th className="py-4 px-6 bg-blue-600 text-center text-white font-semibold w-1/3">板金見積.com</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['見積時間', '20〜30分', '約1分'],
                  ['必要スキル', '熟練者のみ', '誰でも'],
                  ['金額のブレ', 'あり', 'なし（マスタ統一）'],
                  ['履歴管理', '紙・Excel', 'クラウド自動保存'],
                  ['出力形式', '手作成', 'Excel・PDF即出力'],
                ].map(([label, before, after]) => (
                  <tr key={label} className="bg-white">
                    <td className="py-4 px-6 font-medium text-gray-700">{label}</td>
                    <td className="py-4 px-6 text-center text-gray-400">{before}</td>
                    <td className="py-4 px-6 text-center text-blue-600 font-bold">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">シンプルな料金体系</h2>
          <p className="text-gray-500 mb-10">まずは無料でお試しください</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-2xl p-8 text-left">
              <div className="text-sm font-semibold text-gray-500 mb-2">無料トライアル</div>
              <div className="text-4xl font-extrabold mb-1">¥0</div>
              <div className="text-gray-400 text-sm mb-6">14日間</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ 全機能が使える</li>
                <li>✅ AI図面解析</li>
                <li>✅ Excel・PDF出力</li>
                <li>✅ クラウド保存</li>
              </ul>
            </div>
            <div className="bg-blue-600 rounded-2xl p-8 text-left text-white">
              <div className="text-sm font-semibold text-blue-200 mb-2">正式プラン</div>
              <div className="text-4xl font-extrabold mb-1">お問い合わせ</div>
              <div className="text-blue-200 text-sm mb-6">社数・規模に応じてご提案</div>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>✅ 全機能が使える</li>
                <li>✅ 単価マスタのカスタマイズ</li>
                <li>✅ 複数ユーザー対応</li>
                <li>✅ 導入サポート付き</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">まず14日間、無料でお試しください</h2>
          <p className="text-blue-100 mb-8">初期費用なし・インストール不要・今すぐ使えます</p>
          <a
            href="/"
            className="inline-block bg-white text-blue-600 font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-blue-50 transition"
          >
            無料トライアルを始める →
          </a>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-8 px-6 bg-gray-900 text-center text-gray-500 text-sm">
        <p>© 2026 板金見積.com　|　お問い合わせ：</p>
      </footer>

    </div>
  );
}

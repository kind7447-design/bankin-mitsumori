import { useState, useCallback, useEffect } from 'react';
import type { PartSpec, ProcessItem, Quote, QuoteRow, Material, AiProgressState } from './types';
import type { Tab } from './components/Layout/TabBar';
import { INITIAL_MATERIALS, INITIAL_PROCESSES } from './data/masterData';
import { calculate } from './lib/calculator';
import { parseDxfFile } from './lib/dxfParser';
import { fileToBase64 } from './lib/pdfExtract';
import { analyzeDrawingImage } from './lib/aiAnalyzer';
import { saveQuote, loadQuotes, deleteQuote, saveMaterials, loadMaterials, saveProcessMaster, loadProcessMaster, loadCreators, saveCreators } from './lib/storage';
import { initTrial, isTrialExpired } from './lib/trial';
import { exportQuoteToExcel } from './lib/excelExport';
import { exportQuoteToPdf } from './lib/pdfExport';

import Header from './components/Layout/Header';
import TabBar from './components/Layout/TabBar';
import DropZone from './components/Upload/DropZone';
import MaterialForm from './components/Spec/MaterialForm';
import SizeInputs from './components/Spec/SizeInputs';
import MaterialSummary from './components/Spec/MaterialSummary';
import ProcessTable from './components/Process/ProcessTable';
import AddProcessBtn from './components/Process/AddProcessBtn';
import QuoteSummary from './components/Summary/QuoteSummary';
import MarginSlider from './components/Summary/MarginSlider';
import HistoryList from './components/History/HistoryList';
import MaterialMaster from './components/Master/MaterialMaster';
import ProcessMaster from './components/Master/ProcessMaster';
import CreatorMaster from './components/Master/CreatorMaster';

const DEFAULT_SPEC: PartSpec = {
  drawingNo: '', partName: '', customer: '', lotNo: 1, qty: 1, memo: '',
  materialName: 'SPC', thickness: 1.0, density: 7.85,
  matX: 600, matY: 600, prodX: 100, prodY: 100, cornerCount: 4,
  matUnitPrice: 180, scrapUnitPrice: 30, includeScrap: false,
};

function makeProcesses(master: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[]): ProcessItem[] {
  return master.map(m => ({
    ...m,
    id: `proc_${m.name}`,
    qty: 1,
    enabled: false,
  }));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('quote');
  const [materials, setMaterials] = useState<Material[]>(() => loadMaterials() ?? INITIAL_MATERIALS);
  const [processMaster, setProcessMaster] = useState<Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[]>(
    () => loadProcessMaster() ?? INITIAL_PROCESSES
  );
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [creators, setCreators] = useState<string[]>([]);

  const [spec, setSpec] = useState<PartSpec>(DEFAULT_SPEC);
  const [processes, setProcesses] = useState<ProcessItem[]>(() => makeProcesses(loadProcessMaster() ?? INITIAL_PROCESSES));
  const [marginRate, setMarginRate] = useState(0.2);
  const [adjustment, setAdjustment] = useState(0);
  const [createdBy, setCreatedBy] = useState('');
  const [aiProgress, setAiProgress] = useState<AiProgressState>('idle');
  const [aiError, setAiError] = useState<string>();
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());
  const [quoteStatus, setQuoteStatus] = useState<Quote['status']>('draft');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [extraRows, setExtraRows] = useState<QuoteRow[]>([]);
  const [breakdownCost, setBreakdownCost] = useState(false);

  const result = calculate(spec, processes, marginRate, adjustment);

  // トライアル初期化
  useEffect(() => {
    initTrial();
  }, []);

  // アクセスログ送信（セッションごとに1回）
  useEffect(() => {
    if (!sessionStorage.getItem('_logged')) {
      fetch('/api/log-access', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('_logged', '1');
    }
  }, []);

  // Supabaseから見積・作成者を初期ロード
  useEffect(() => {
    loadQuotes().then(setQuotes);
    loadCreators().then(setCreators);
  }, []);

  const updateSpec = useCallback((partial: Partial<PartSpec>) => {
    setSpec(prev => ({ ...prev, ...partial }));
  }, []);

  function handleMaterialsChange(updated: Material[]) {
    setMaterials(updated);
    saveMaterials(updated);
  }

  function handleProcessMasterChange(updated: Omit<ProcessItem, 'id' | 'qty' | 'enabled'>[]) {
    setProcessMaster(updated);
    saveProcessMaster(updated);
  }

  async function handleCreatorsChange(updated: string[]) {
    setCreators(updated);
    await saveCreators(updated);
  }

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    setAiError(undefined);
    setAiProgress('reading');

    try {
      if (ext === 'dxf') {
        const dxf = await parseDxfFile(file);
        setAiProgress('done');
        setAiFields(new Set());
        {
          const toEnable = new Set(['レーザー切断', 'バリ取り']);
          if (dxf.holeCount > 0) toEnable.add('タップ加工');
          if (dxf.bendLineCount > 0) toEnable.add('曲げ加工');
          const updated = processes.map(p => ({
            ...p,
            enabled: toEnable.has(p.name),
            qty: p.name === 'タップ加工' && dxf.holeCount > 0 ? dxf.holeCount
               : p.name === '曲げ加工' && dxf.bendLineCount > 0 ? dxf.bendLineCount
               : p.qty,
          }));
          setProcesses(updated);
        }
        setAiError('DXF読み込み完了。製品サイズ・材質・板厚を確認・入力してください。');
        return;
      }

      let base64: string;
      let mime: 'image/jpeg' | 'image/png' | 'application/pdf';

      if (ext === 'pdf') {
        // PDFはそのままbase64化してClaude APIに直接送信（canvas変換不要）
        setAiProgress('analyzing');
        base64 = await fileToBase64(file);
        mime = 'application/pdf';
      } else {
        base64 = await fileToBase64(file);
        mime = file.type.includes('png') ? 'image/png' : 'image/jpeg';
      }

      // トライアル期間チェック（期間のみ、枚数はサーバー管理）
      if (isTrialExpired()) {
        setAiProgress('error');
        setAiError('トライアル期間（14日間）が終了しました。正式プランへのお申し込みをお願いします。');
        return;
      }

      setAiProgress('analyzing');
      const ai = await analyzeDrawingImage(base64, mime);
      setAiProgress('done');

      const mat = materials.find(m => m.name === ai.materialName);
      setAiFields(new Set(['drawingNo', 'partName', 'materialName', 'thickness', 'prodX', 'prodY', 'cornerCount']));

      updateSpec({
        drawingNo: ai.drawingNo,
        partName: ai.partName,
        materialName: ai.materialName,
        thickness: ai.thickness,
        density: mat?.density ?? spec.density,
        matUnitPrice: mat?.unitPrice ?? spec.matUnitPrice,
        prodX: ai.prodX,
        prodY: ai.prodY,
        cornerCount: ai.cornerCount ?? 4,
      });

      if (ai.notes) {
        setAiError(`📐 AI推定根拠: ${ai.notes}（信頼度: ${Math.round((ai.confidence ?? 0) * 100)}%）`);
      }

      if (ai.suggestedProcesses?.length > 0) {
        const updated = processes.map(p => {
          const suggested = ai.suggestedProcesses.find(s => s.name === p.name);
          return suggested ? { ...p, qty: suggested.qty, enabled: true } : { ...p, enabled: false };
        });
        setProcesses(updated);
      }
    } catch (e) {
      setAiProgress('error');
      setAiError(e instanceof Error ? e.message : '解析中にエラーが発生しました');
    }
  }

  function handleManual() {
    setAiProgress('idle');
    setAiFields(new Set());
  }

  async function saveCurrentQuote() {
    const quote: Quote = {
      id: editingId ?? crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy,
      spec, processes, marginRate, adjustment, result, status: quoteStatus,
      rows: extraRows,
    };
    await saveQuote(quote);
    const updated = await loadQuotes();
    setQuotes(updated);
    setEditingId(quote.id);
    alert('見積を保存しました');
    return quote;
  }

  // Excel出力と同時に自動保存（アラートなし・同一IDなら上書き）
  async function exportExcelWithSave() {
    const id = editingId ?? crypto.randomUUID();
    const quote: Quote = {
      id,
      createdAt: new Date().toISOString(),
      createdBy,
      spec, processes, marginRate, adjustment, result, status: quoteStatus,
      rows: extraRows,
    };
    await saveQuote(quote);
    const updated = await loadQuotes();
    setQuotes(updated);
    setEditingId(id);
    await exportQuoteToExcel(quote, breakdownCost);
  }

  function loadHistoryQuote(q: Quote) {
    setSpec(q.spec);
    setProcesses(q.processes);
    setMarginRate(q.marginRate);
    setAdjustment(q.adjustment);
    setQuoteStatus(q.status);
    setEditingId(q.id);
    setCreatedBy(q.createdBy ?? '');
    setExtraRows(q.rows ?? []);
    setAiFields(new Set());
    setAiProgress('idle');
    setTab('quote');
  }

  async function handleDelete(id: string) {
    if (!confirm('この見積を削除しますか？')) return;
    await deleteQuote(id);
    const updated = await loadQuotes();
    setQuotes(updated);
  }

  async function handleDuplicate(q: Quote) {
    const newQ: Quote = {
      ...q,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    await saveQuote(newQ);
    const updated = await loadQuotes();
    setQuotes(updated);
  }

  function addCurrentAsRow() {
    setExtraRows(prev => [...prev, { spec, processes, marginRate, adjustment, result }]);
    setSpec({ ...DEFAULT_SPEC, customer: spec.customer });
    setProcesses(makeProcesses(processMaster));
    setMarginRate(0.2);
    setAdjustment(0);
    setAiProgress('idle');
    setAiFields(new Set());
    setAiError(undefined);
  }

  function removeExtraRow(index: number) {
    setExtraRows(prev => prev.filter((_, i) => i !== index));
  }

  function resetQuote() {
    setSpec(DEFAULT_SPEC);
    setProcesses(makeProcesses(processMaster));
    setMarginRate(0.2);
    setAdjustment(0);
    setEditingId(null);
    setExtraRows([]);
    setCreatedBy('');
    setAiProgress('idle');
    setAiFields(new Set());
    setAiError(undefined);
    setQuoteStatus('draft');
  }

  const currentQuote: Quote = {
    id: editingId ?? 'preview',
    createdAt: new Date().toISOString(),
    createdBy,
    spec, processes, marginRate, adjustment, result, status: quoteStatus,
    rows: extraRows,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <TabBar active={tab} onChange={setTab} />

      <main className="max-w-5xl mx-auto px-4 py-6">

        {tab === 'quote' && (
          <div className="space-y-4">
            <Section title="Step 1 — 図面アップロード">
              <DropZone
                onFile={handleFile}
                onManual={handleManual}
                progress={aiProgress}
                progressError={aiError}
              />
            </Section>

            <Section title="Step 2 — 仕様確認・修正">
              <div className="space-y-5">
                <MaterialForm
                  spec={spec}
                  materials={materials}
                  aiFields={aiFields}
                  onChange={updateSpec}
                />
                <SizeInputs spec={spec} aiFields={aiFields} onChange={updateSpec} />
                <MaterialSummary result={result} qty={spec.qty} />
              </div>
            </Section>

            <Section title="Step 3 — 加工工程">
              <ProcessTable
                processes={processes}
                lot={spec.qty}
                adjPerimeter={result.adjPerimeter}
                perimeter={result.perimeter}
                onUpdate={(id, partial) => {
                  setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
                }}
                onRemove={(id) => setProcesses(prev => prev.filter(p => p.id !== id))}
              />
              <QuoteSummary result={result} qty={spec.qty} />
              <AddProcessBtn
                processMaster={processMaster}
                onAdd={p => setProcesses(prev => [...prev, p])}
              />
            </Section>

            <Section title="Step 4 — 金額確認・出力">
              <div className="space-y-4">
                <MarginSlider
                  marginRate={marginRate}
                  adjustment={adjustment}
                  onMarginChange={setMarginRate}
                  onAdjustChange={setAdjustment}
                />

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">作成者</label>
                  <select
                    className="input text-sm"
                    value={createdBy}
                    onChange={e => setCreatedBy(e.target.value)}
                  >
                    <option value="">-- 選択 --</option>
                    {creators.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">ステータス</label>
                  <select
                    className="input text-sm"
                    value={quoteStatus}
                    onChange={e => setQuoteStatus(e.target.value as Quote['status'])}
                  >
                    <option value="draft">下書き</option>
                    <option value="sent">送付済</option>
                    <option value="approved">承認済</option>
                  </select>
                </div>

                <QuoteSummary result={result} qty={spec.qty} />

                {/* 追加行リスト */}
                {extraRows.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-3 py-2 text-center w-10">No</th>
                          <th className="px-3 py-2 text-left">図番</th>
                          <th className="px-3 py-2 text-left">部品名</th>
                          <th className="px-3 py-2 text-right">数量</th>
                          <th className="px-3 py-2 text-right">単価(税抜)</th>
                          <th className="px-3 py-2 text-right">合計</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {extraRows.map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-center text-gray-500">{i + 1}</td>
                            <td className="px-3 py-2">{row.spec.drawingNo || '—'}</td>
                            <td className="px-3 py-2">{row.spec.partName || '—'}</td>
                            <td className="px-3 py-2 text-right">{row.spec.qty}</td>
                            <td className="px-3 py-2 text-right">¥{Math.round(row.result.unitPriceExTax).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">¥{(row.spec.qty * Math.round(row.result.unitPriceExTax)).toLocaleString()}</td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => removeExtraRow(i)} className="text-red-400 hover:text-red-600 text-xs">×</button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50">
                          <td className="px-3 py-2 text-center text-blue-700 font-medium">{extraRows.length + 1}</td>
                          <td className="px-3 py-2">{spec.drawingNo || '—'}</td>
                          <td className="px-3 py-2">{spec.partName || '—'}</td>
                          <td className="px-3 py-2 text-right">{spec.qty}</td>
                          <td className="px-3 py-2 text-right">¥{Math.round(result.unitPriceExTax).toLocaleString()}</td>
                          <td className="px-3 py-2 text-right">¥{(spec.qty * Math.round(result.unitPriceExTax)).toLocaleString()}</td>
                          <td className="px-3 py-2 text-center text-xs text-blue-500">現在</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={addCurrentAsRow}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    ＋ 行を追加
                  </button>
                  <button
                    onClick={saveCurrentQuote}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    💾 保存
                  </button>
                  <button
                    onClick={() => exportExcelWithSave().catch(console.error)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    📊 Excel出力
                  </button>
                  <button
                    onClick={() => exportQuoteToPdf(currentQuote, breakdownCost)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    📄 PDF出力
                  </button>
                  <button
                    onClick={resetQuote}
                    className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm"
                  >
                    🔄 新規作成
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700 pt-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-blue-600"
                    checked={breakdownCost}
                    onChange={e => setBreakdownCost(e.target.checked)}
                  />
                  材料費・加工費を別枠で記載する（Excel/PDF）
                </label>
              </div>
            </Section>
          </div>
        )}

        {tab === 'history' && (
          <Section title="見積履歴">
            <HistoryList
              quotes={quotes}
              onSelect={loadHistoryQuote}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </Section>
        )}

        {tab === 'master' && (
          <div className="space-y-6">
            <Section title="作成者マスタ">
              <CreatorMaster creators={creators} onChange={handleCreatorsChange} />
            </Section>
            <Section title="材料マスタ">
              <MaterialMaster materials={materials} onChange={handleMaterialsChange} />
            </Section>
            <Section title="加工マスタ">
              <ProcessMaster processes={processMaster} onChange={handleProcessMasterChange} />
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b px-5 py-3">
        <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

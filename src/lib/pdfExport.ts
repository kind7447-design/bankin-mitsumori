import type { Quote } from '../types';

export function exportQuoteToPdf(quote: Quote, breakdownCost = false): void {
  const { spec, result } = quote;
  const today = new Date().toLocaleDateString('ja-JP');
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const fileName = `${spec.drawingNo}_${spec.partName}_${dateStr}`;

  const allItems = [
    ...(quote.rows ?? []).map(r => ({ spec: r.spec, result: r.result })),
    { spec, result },
  ];

  const subtotalResult = allItems.reduce(
    (acc, it) => acc + it.spec.qty * Math.round(it.result.unitPriceExTax), 0
  );

  let tableHead: string;
  let dataRows: string;
  let blankRows: string;
  let sumRow: string;

  if (breakdownCost) {
    tableHead = `
    <tr>
      <th style="width:4%">No</th>
      <th style="width:10%">図番</th>
      <th style="width:13%">部品名</th>
      <th style="width:6%">ロット</th>
      <th style="width:5%">数量</th>
      <th style="width:9%">材料費</th>
      <th style="width:9%">加工費</th>
      <th style="width:9%">諸経費</th>
      <th style="width:9%">合計単価</th>
      <th style="width:10%">合計金額</th>
      <th>備考</th>
    </tr>`;

    dataRows = allItems.map((item, i) => {
      const misc = Math.round(item.result.unitPriceExTax)
        - Math.round(item.result.matCostPerPart)
        - Math.round(item.result.processCostPerPart);
      return `
    <tr>
      <td class="center">${i + 1}</td>
      <td>${item.spec.drawingNo}</td>
      <td>${item.spec.partName}</td>
      <td class="center">${item.spec.lotNo}</td>
      <td class="right">${item.spec.qty.toLocaleString()}</td>
      <td class="right">${Math.round(item.result.matCostPerPart).toLocaleString()}</td>
      <td class="right">${Math.round(item.result.processCostPerPart).toLocaleString()}</td>
      <td class="right">${misc.toLocaleString()}</td>
      <td class="right">${Math.round(item.result.unitPriceExTax).toLocaleString()}</td>
      <td class="right">${(item.spec.qty * Math.round(item.result.unitPriceExTax)).toLocaleString()}</td>
      <td>${item.spec.memo ?? ''}</td>
    </tr>`;
    }).join('');

    const emptyRows = Math.max(0, 12 - allItems.length);
    blankRows = Array.from({ length: emptyRows }, (_, i) => `
    <tr>
      <td class="center">${allItems.length + i + 1}</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
  `).join('');

    sumRow = `
    <tr class="sum-row">
      <td colspan="9" class="sum-label">合　計（税抜）</td>
      <td class="sum-value">${subtotalResult.toLocaleString()}</td>
      <td style="border:none"></td>
    </tr>`;
  } else {
    tableHead = `
    <tr>
      <th style="width:4%">No</th>
      <th style="width:13%">図番</th>
      <th style="width:17%">部品名</th>
      <th style="width:7%">ロット</th>
      <th style="width:6%">数量</th>
      <th style="width:11%">単価</th>
      <th style="width:12%">合計金額</th>
      <th>備考</th>
    </tr>`;

    dataRows = allItems.map((item, i) => `
    <tr>
      <td class="center">${i + 1}</td>
      <td>${item.spec.drawingNo}</td>
      <td>${item.spec.partName}</td>
      <td class="center">${item.spec.lotNo}</td>
      <td class="right">${item.spec.qty.toLocaleString()}</td>
      <td class="right">${Math.round(item.result.unitPriceExTax).toLocaleString()}</td>
      <td class="right">${(item.spec.qty * Math.round(item.result.unitPriceExTax)).toLocaleString()}</td>
      <td>${item.spec.memo ?? ''}</td>
    </tr>
  `).join('');

    const emptyRows = Math.max(0, 12 - allItems.length);
    blankRows = Array.from({ length: emptyRows }, (_, i) => `
    <tr>
      <td class="center">${allItems.length + i + 1}</td>
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>
  `).join('');

    sumRow = `
    <tr class="sum-row">
      <td colspan="6" class="sum-label">合　計（税抜）</td>
      <td class="sum-value">${subtotalResult.toLocaleString()}</td>
      <td style="border:none"></td>
    </tr>`;
  }

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${fileName}</title>
<style>
  @page { size: A4 landscape; margin: 8mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Meiryo", "MS Gothic", "Hiragino Kaku Gothic ProN", sans-serif; font-size: 11pt; color: #000; }

  .header-area { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4pt; }
  .customer { font-size: 14pt; font-weight: bold; padding-top: 2pt; }
  .date-right { text-align: right; font-size: 11pt; }

  .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5pt; }
  .title { font-size: 20pt; font-weight: bold; flex: 1; text-align: center; letter-spacing: 10pt; padding-left: 10pt; }
  .company-info { font-size: 10pt; line-height: 1.6; text-align: left; min-width: 220pt; }

  .greeting { font-size: 10pt; margin-bottom: 2pt; }
  .part-name { font-size: 12pt; margin-bottom: 5pt; }

  table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  th, td { border: 0.5pt solid #333; padding: 3pt 5pt; }
  th { background: #d9e1f2; font-weight: bold; text-align: center; }
  td.center { text-align: center; }
  td.right { text-align: right; }
  tr td { height: 18pt; }

  .sum-row td { border: none; }
  .sum-label { text-align: right; font-weight: bold; padding-right: 4pt; font-size: 11pt; }
  .sum-value { border: 0.5pt solid #333 !important; text-align: right; font-weight: bold; font-size: 11pt; min-width: 90pt; }

  .notes { text-align: right; font-size: 9pt; color: #595959; margin-top: 5pt; line-height: 1.8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header-area">
  <div class="customer">${spec.customer}　御中</div>
  <div class="date-right">${today}</div>
</div>

<div class="title-row">
  <div class="title">見　　積　　書</div>
  <div class="company-info">
    株式会社　林製作所<br>
    群馬県高崎市沖町368-1<br>
    Tel&nbsp;&nbsp;027-343-1211&nbsp;&nbsp;&nbsp;Fax&nbsp;&nbsp;027-343-1213<br>
    担当：${quote.createdBy ?? ''}
  </div>
</div>

<div class="greeting">　貴社益々ご盛栄の段お慶び申し上げます。下記の通りお見積もりをご報告申し上げます。</div>
<div class="greeting">　尚、価格は数量・品質等変更の場合は別途ご相談させていただきます。</div>
<div class="part-name" style="margin-top:4pt">　機名称：${spec.partName}</div>

<table>
  <thead>
    ${tableHead}
  </thead>
  <tbody>
    ${dataRows}
    ${blankRows}
    ${sumRow}
  </tbody>
</table>

<div class="notes">
  価格は税抜きとなります<br>
  請求時に別途消費税を頂戴致します<br>
  見積もり有効期限：次回単価見直しまで
</div>

<script>window.onload = function(){ window.print(); };<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
    return;
  }
  win.document.write(html);
  win.document.close();
}

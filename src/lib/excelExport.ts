import ExcelJS from 'exceljs';
import type { Quote } from '../types';

async function loadSealBuffer(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch('/seal.gif');
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function exportQuoteToExcel(quote: Quote, breakdownCost = false): Promise<void> {
  const { spec, result } = quote;
  const today = new Date().toLocaleDateString('ja-JP');

  const wb = new ExcelJS.Workbook();
  wb.creator = '板金見積システム';

  // ===== 見積書シート =====
  const ws = wb.addWorksheet('見積書');

  // ---- レイアウト設定 ----
  // 通常モード: A-H (8列)、内訳モード: A-K (11列)
  // 内訳: F=材料費/枚, G=加工費/枚, H=諸経費/枚, I=合計単価, J=合計金額, K=備考
  const infoCol    = breakdownCost ? 'K' : 'H';
  const sumAmtCol  = breakdownCost ? 'J' : 'G';
  const lastDataCol = breakdownCost ? 'K' : 'H';

  if (breakdownCost) {
    ws.columns = [
      { key: 'A', width: 4  },
      { key: 'B', width: 18 },
      { key: 'C', width: 20 },
      { key: 'D', width: 8  },
      { key: 'E', width: 8  },
      { key: 'F', width: 13 },
      { key: 'G', width: 13 },
      { key: 'H', width: 13 },
      { key: 'I', width: 13 },
      { key: 'J', width: 13 },
      { key: 'K', width: 35 },
    ];
  } else {
    ws.columns = [
      { key: 'A', width: 6  },
      { key: 'B', width: 22 },
      { key: 'C', width: 26 },
      { key: 'D', width: 8  },
      { key: 'E', width: 8  },
      { key: 'F', width: 16 },
      { key: 'G', width: 14 },
      { key: 'H', width: 45 },
    ];
  }

  // ---- 行1: 客先名 ----
  ws.getRow(1).height = 22;
  const c1A = ws.getCell('A1');
  c1A.value = `${spec.customer}　御中`;
  c1A.font = { size: 12 };

  // ---- 行2: 日付 ----
  ws.getRow(2).height = 18;
  const c2 = ws.getCell(`${infoCol}2`);
  c2.value = today;
  c2.alignment = { horizontal: 'right' };

  // ---- 行3: タイトル ----
  ws.getRow(3).height = 26;
  ws.mergeCells('B3:F3');
  const c3B = ws.getCell('B3');
  c3B.value = '見　　積　　書';
  c3B.font = { size: 16, bold: true };
  c3B.alignment = { horizontal: 'center', vertical: 'middle' };

  // ---- 行4〜7: 会社情報（右側）----
  const companyInfo = [
    '株式会社　林製作所',
    '群馬県高崎市沖町368-1',
    'Tel  027-343-1211   Fax  027-343-1213',
    `担当：${quote.createdBy ?? ''}`,
  ];
  companyInfo.forEach((text, i) => {
    const row = 4 + i;
    ws.getRow(row).height = 16;
    const cell = ws.getCell(`${infoCol}${row}`);
    cell.value = text;
    cell.alignment = { horizontal: 'left' };
    cell.font = { size: 9 };
  });

  // ---- 会社印 ----
  const sealBuf = await loadSealBuffer();
  if (sealBuf) {
    const imageId = wb.addImage({ buffer: sealBuf, extension: 'gif' });
    // 通常: H列 nativeCol=7, 内訳: K列 nativeCol=10
    const sealCol = breakdownCost ? 10 : 7;
    const sealOff = breakdownCost ? 1571625 : 1857375;
    ws.addImage(imageId, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tl: { nativeCol: sealCol, nativeColOff: sealOff, nativeRow: 2, nativeRowOff: 63754 } as any,
      ext: { width: 80, height: 80 },
      editAs: 'absolute',
    });
  }

  // ---- 行8: 空 ----
  ws.getRow(8).height = 6;

  // ---- 行9〜10: 挨拶文 ----
  ws.getRow(9).height = 16;
  ws.mergeCells(`A9:${lastDataCol}9`);
  ws.getCell('A9').value =
    '　貴社益々ご盛栄の段お慶び申し上げます。下記の通りお見積もりをご報告申し上げます。';
  ws.getCell('A9').font = { size: 9 };

  ws.getRow(10).height = 16;
  ws.mergeCells(`A10:${lastDataCol}10`);
  ws.getCell('A10').value =
    '　尚、価格は数量・品質等変更の場合は別途ご相談させていただきます。';
  ws.getCell('A10').font = { size: 9 };

  // ---- 行11: 空 ----
  ws.getRow(11).height = 6;

  // ---- 行12: 機名称 ----
  ws.getRow(12).height = 16;
  ws.mergeCells(`A12:${lastDataCol}12`);
  ws.getCell('A12').value = `　機名称：${spec.partName}`;
  ws.getCell('A12').font = { size: 10 };

  // ---- 行13: 空 ----
  ws.getRow(13).height = 6;

  // ---- 行14: ヘッダー ----
  ws.getRow(14).height = 18;
  const headers = breakdownCost
    ? ['No', '図番', '部品名', 'ロット', '数量', '材料費', '加工費', '諸経費', '合計単価', '合計金額', '備考']
    : ['No', '図番', '部品名', 'ロット', '数量', '単価', '合計金額', '備考'];
  const hdrCols = breakdownCost
    ? ['A','B','C','D','E','F','G','H','I','J','K']
    : ['A','B','C','D','E','F','G','H'];

  headers.forEach((h, i) => {
    const cell = ws.getCell(`${hdrCols[i]}14`);
    cell.value = h;
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right:  { style: 'thin' },
    };
  });

  // ---- データ行 ----
  const allItems = [
    ...(quote.rows ?? []).map(r => ({ spec: r.spec, result: r.result })),
    { spec, result },
  ];
  const numDataRows = Math.max(12, allItems.length);
  const lastDataRow = 14 + numDataRows;
  const sumRowNum   = lastDataRow + 1;
  const noteStartRow = sumRowNum + 2;

  // 数値フォーマット対象列
  const numCols = breakdownCost
    ? new Set(['E','F','G','H','I','J'])
    : new Set(['E','F','G']);

  Array.from({ length: numDataRows }, (_, i) => {
    const rowNum = 15 + i;
    const item = allItems[i];
    ws.getRow(rowNum).height = 16;

    hdrCols.forEach((col, ci) => {
      const cell = ws.getCell(`${col}${rowNum}`);

      if (breakdownCost) {
        // 内訳モード:
        // F=材料費/枚, G=加工費/枚, H=諸経費/枚(=I-F-G), I=合計単価, J=合計金額(=E*I), K=備考
        if (col === 'H' && item) {
          const misc = Math.round(item.result.unitPriceExTax)
            - Math.round(item.result.matCostPerPart)
            - Math.round(item.result.processCostPerPart);
          cell.value = {
            formula: `I${rowNum}-F${rowNum}-G${rowNum}`,
            result: misc,
          };
        } else if (col === 'H') {
          cell.value = null;
        } else if (col === 'J' && item) {
          cell.value = {
            formula: `E${rowNum}*I${rowNum}`,
            result: item.spec.qty * Math.round(item.result.unitPriceExTax),
          };
        } else if (col === 'J') {
          cell.value = null;
        } else if (item) {
          const vals = [
            i + 1,
            item.spec.drawingNo,
            item.spec.partName,
            item.spec.lotNo,
            item.spec.qty,
            Math.round(item.result.matCostPerPart),
            Math.round(item.result.processCostPerPart),
            0, // H: formula
            Math.round(item.result.unitPriceExTax),
            0, // J: formula
            item.spec.memo,
          ];
          cell.value = (vals[ci] === 0 && (col === 'H' || col === 'J')) ? null : vals[ci];
        } else {
          const vals = [i + 1, '','','','','','', 0,'', 0, ''];
          cell.value = vals[ci] === 0 ? null : vals[ci];
        }
      } else {
        // 通常モード: F=単価, G=合計金額(=E*F), H=備考
        if (col === 'G' && item) {
          cell.value = {
            formula: `E${rowNum}*F${rowNum}`,
            result: item.spec.qty * Math.round(item.result.unitPriceExTax),
          };
        } else if (col === 'G') {
          cell.value = null;
        } else if (item) {
          const vals = [i + 1, item.spec.drawingNo, item.spec.partName,
                        item.spec.lotNo, item.spec.qty,
                        Math.round(item.result.unitPriceExTax), 0, item.spec.memo];
          cell.value = vals[ci] === 0 ? null : vals[ci];
        } else {
          const vals = [i + 1, '', '', '', '', '', 0, ''];
          cell.value = vals[ci] === 0 ? null : vals[ci];
        }
      }

      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right:  { style: 'thin' },
      };
      if (numCols.has(col)) {
        cell.alignment = { horizontal: 'right' };
        if (typeof cell.value === 'number') cell.numFmt = '#,##0';
      }
    });
  });

  // ---- 合計(税抜) ----
  ws.getRow(sumRowNum).height = 18;
  const sumMergeEnd = breakdownCost ? `I${sumRowNum}` : `F${sumRowNum}`;
  ws.mergeCells(`A${sumRowNum}:${sumMergeEnd}`);
  const sumLabelCell = ws.getCell(`A${sumRowNum}`);
  sumLabelCell.value = '合　計（税抜）';
  sumLabelCell.font = { bold: true, size: 10 };
  sumLabelCell.alignment = { horizontal: 'right' };

  const subtotalResult = allItems.reduce(
    (acc, it) => acc + it.spec.qty * Math.round(it.result.unitPriceExTax), 0
  );
  const sumCell = ws.getCell(`${sumAmtCol}${sumRowNum}`);
  sumCell.value = {
    formula: `SUM(${sumAmtCol}15:${sumAmtCol}${lastDataRow})`,
    result: subtotalResult,
  };
  sumCell.numFmt = '#,##0';
  sumCell.font = { bold: true };
  sumCell.alignment = { horizontal: 'right' };
  sumCell.border = {
    top: { style: 'medium' }, bottom: { style: 'thin' },
    left: { style: 'thin' },  right:  { style: 'thin' },
  };

  // ---- 注記（右列・右寄せ）----
  ['価格は税抜きとなります',
   '請求時に別途消費税を頂戴致します',
   '見積もり有効期限：次回単価見直しまで'].forEach((note, i) => {
    const row = noteStartRow + i;
    ws.getRow(row).height = 14;
    const cell = ws.getCell(`${infoCol}${row}`);
    cell.value = note;
    cell.font = { size: 9, color: { argb: 'FF595959' } };
    cell.alignment = { horizontal: 'right' };
  });

  // ===== 素材計算表シート =====
  const ws2 = wb.addWorksheet('素材計算表');
  const matHeaders = [
    '通番', '部品コード', '部品名', '材質', '板厚(mm)', '素材X(mm)', '素材Y(mm)', '比重(g/cm³)',
    '材料重量(kg)', '製品X(mm)', '製品Y(mm)', '取数', '所要重量(kg)', 'スクラップ重量(kg)',
    'スクラップ価格(円/kg)', 'スクラップ代金(円)', '製品重量(kg)', '材料単価(円/kg)', '材料費(円)', '備考',
  ];
  ws2.columns = matHeaders.map(h => ({ header: h, width: 14 }));
  ws2.getRow(1).font = { bold: true };
  ws2.addRow([
    1, spec.drawingNo, spec.partName, spec.materialName,
    spec.thickness, spec.matX, spec.matY, spec.density,
    +result.matWeight.toFixed(4), spec.prodX, spec.prodY, result.nesting,
    +result.reqWeight.toFixed(4), +result.scrapWeight.toFixed(4),
    spec.scrapUnitPrice, +result.scrapValue.toFixed(1),
    +result.prodWeight.toFixed(4), spec.matUnitPrice,
    +result.matCostPerPart.toFixed(1), spec.memo,
  ]);

  // ===== ダウンロード =====
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${spec.drawingNo}_${spec.partName}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

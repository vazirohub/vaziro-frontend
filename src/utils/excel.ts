import * as XLSX from 'xlsx';

/**
 * Excel (.xlsx) and CSV Export Utility for Vaziro Admin Workbench
 * Supports formatted headers, type mapping, and auto-adjusted column widths.
 */

export interface ExcelColumn<T = any> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Export structured data items to genuine Microsoft Excel (.xlsx) file
 */
export const exportToExcel = <T extends Record<string, any>>(
  filename: string,
  sheetName: string,
  columns: ExcelColumn<T>[],
  data: T[]
): void => {
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const val = col.accessor(item);
      if (val === null || val === undefined) return '';
      return val;
    })
  );

  const aoa = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Auto column widths
  worksheet['!cols'] = columns.map((col, idx) => {
    let max = col.header.length;
    for (const r of rows) {
      const val = r[idx];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > max) max = Math.min(len, 50);
    }
    return { wch: Math.max(max + 3, 14) };
  });

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || 'Sheet1').slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`);
};

/**
 * Export raw headers and 2D row array to Microsoft Excel (.xlsx) file
 */
export const exportRawToExcel = (
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void => {
  const cleanRows = rows.map((r) =>
    r.map((val) => (val === null || val === undefined ? '' : val))
  );

  const aoa = [headers, ...cleanRows];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  worksheet['!cols'] = headers.map((h, idx) => {
    let max = h.length;
    for (const r of cleanRows) {
      const val = r[idx];
      const len = val !== null && val !== undefined ? String(val).length : 0;
      if (len > max) max = Math.min(len, 50);
    }
    return { wch: Math.max(max + 3, 14) };
  });

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || 'Sheet1').slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`);
};

/**
 * Fallback CSV Exporter
 */
export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void => {
  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [
      headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""';
            return `"${String(cell).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialSummary, Transaction, StockItem, Expense, MenuItem, DailyReport } from '../types';
import { calculatePerItemSales, formatRp, formatDateOnly } from './calculations';

/**
 * Export full business data to Excel (.xlsx) file
 */
export function exportToExcel({
  financialSummary,
  transactions,
  stockItems,
  expenses,
  menuItems,
}: {
  financialSummary: FinancialSummary;
  transactions: Transaction[];
  stockItems: StockItem[];
  expenses: Expense[];
  menuItems: MenuItem[];
}) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. RINGKASAN KEUANGAN SHEET
  const summaryData = [
    ['MOOD KUKUS MAMUJU - RINGKASAN KEUANGAN'],
    [`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`],
    [''],
    ['Metrik Keuangan', 'Nilai (Rp)'],
    ['Total Pemasukan (Revenue)', financialSummary.totalRevenue],
    ['Laba Kotor (Gross Profit)', financialSummary.grossProfit],
    ['Total Pengeluaran Operasional', financialSummary.totalExpenses],
    ['Pengeluaran Modal / Investasi', financialSummary.totalCapital],
    ['Laba Bersih (Net Profit)', financialSummary.netProfit],
    ['Margin Keuntungan (%)', `${financialSummary.profitMargin}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Keuangan');

  // 2. LAKU TERJUAL PER ITEM SHEET
  const perItemSales = calculatePerItemSales(menuItems, transactions);
  const perItemRows = perItemSales.map((item) => ({
    'Nama Item Bahan': item.itemName,
    'Kategori': item.category,
    'Harga per Unit (Rp)': item.pricePerUnit,
    'Disiapkan (Siap Jual)': item.preparedQty,
    'Laku Terjual': item.soldQty,
    'Sisa Stok Siap Jual': item.remainingQty,
    'Satuan': item.unitName,
    'Persentase Terjual (%)': `${item.sellRatePct}%`,
    'Total Omzet (Rp)': item.totalRevenue,
  }));
  const wsPerItem = XLSX.utils.json_to_sheet(perItemRows);
  XLSX.utils.book_append_sheet(wb, wsPerItem, 'Penjualan Per Item');

  // 3. LOG TRANSAKSI PENJUALAN SHEET
  const transactionRows = transactions.flatMap((tr) =>
    tr.items.map((it) => ({
      'ID Transaksi': tr.id,
      'Tanggal': formatDateOnly(tr.date),
      'Pelanggan': tr.customerName || 'Walk-In',
      'Item Terjual': it.menuName,
      'Jumlah Qty': it.quantity,
      'Satuan': it.unitName || 'biji',
      'Harga Satuan (Rp)': it.pricePerUnit,
      'Saus / Cocolan': it.sauceName || 'Tanpa Saus',
      'Ekstra Saus (Rp)': it.extraPrice || 0,
      'Kemasan': it.packagingType || 'Paper Box',
      'Subtotal (Rp)': (it.pricePerUnit + (it.extraPrice || 0)) * it.quantity,
      'Metode Bayar': tr.paymentMethod.toUpperCase(),
    }))
  );
  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Riwayat Transaksi');

  // 4. STOK BAHAN BAKU SHEET
  const stockRows = stockItems.map((stk) => ({
    'Kode Stok': stk.id,
    'Nama Bahan Baku / Kemasan': stk.name,
    'Kategori': stk.category,
    'Stok Saat Ini': stk.currentStock,
    'Batas Min. Restock': stk.minStock,
    'Satuan': stk.unit,
    'Harga Beli Satuan (Rp)': stk.unitCostPrice,
    'Total Nilai Stok (Rp)': stk.currentStock * stk.unitCostPrice,
    'Pemasok / Supplier': stk.supplier || '-',
    'Status Stok': stk.currentStock <= stk.minStock ? '⚠️ MENIPIS / PERLU RESTOCK' : '✅ AMAN',
  }));
  const wsStock = XLSX.utils.json_to_sheet(stockRows);
  XLSX.utils.book_append_sheet(wb, wsStock, 'Stok Bahan Baku');

  // 5. PENGELUARAN & MODAL SHEET
  const expenseRows = expenses.map((exp) => ({
    'Tanggal': formatDateOnly(exp.date),
    'Judul Pengeluaran': exp.title,
    'Kategori': exp.category,
    'Jumlah (Rp)': exp.amount,
    'Tipe': exp.isCapital ? 'Modal / Investasi' : 'Operasional',
    'Metode Pembayaran': exp.paymentMethod.toUpperCase(),
    'Catatan': exp.notes || '-',
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Catatan Pengeluaran');

  // Download XLSX
  XLSX.writeFile(wb, `MoodKukusMamuju_Laporan_${dateStr}.xlsx`);
}

/**
 * Export clean professional PDF report using jsPDF and jspdf-autotable
 */
export function exportToPdf({
  financialSummary,
  transactions,
  stockItems,
  expenses,
  menuItems,
}: {
  financialSummary: FinancialSummary;
  transactions: Transaction[];
  stockItems: StockItem[];
  expenses: Expense[];
  menuItems: MenuItem[];
}) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // HEADER TITLE
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MOOD KUKUS MAMUJU', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Laporan Ringkasan Keuangan & Penjualan Per Item Kuliner Kukusan', 14, 22);

  doc.setFontSize(9);
  doc.text(`Tanggal Export: ${dateStr}`, 150, 15);

  let currentY = 36;

  // METRICS SUMMARY BOX
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 32, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RINGKASAN PERFORMANSA KEUANGAN', 18, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total Pemasukan : ${formatRp(financialSummary.totalRevenue)}`, 18, currentY + 15);
  doc.text(`• Laba Kotor      : ${formatRp(financialSummary.grossProfit)}`, 18, currentY + 22);
  doc.text(`• Total Pengeluaran: ${formatRp(financialSummary.totalExpenses)}`, 105, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`• LABA BERSIH     : ${formatRp(financialSummary.netProfit)} (Margin ${financialSummary.profitMargin}%)`, 105, currentY + 22);

  currentY += 40;

  // TABLE 1: PENJUALAN PER ITEM
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Laporan Laku Terjual per Item Bahan Kukusan', 14, currentY);
  currentY += 4;

  const perItemSales = calculatePerItemSales(menuItems, transactions);
  const perItemTableData = perItemSales.map((item) => [
    item.itemName,
    formatRp(item.pricePerUnit),
    `${item.preparedQty} ${item.unitName}`,
    `${item.soldQty} ${item.unitName}`,
    `${item.remainingQty} ${item.unitName}`,
    `${item.sellRatePct}%`,
    formatRp(item.totalRevenue),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Nama Item Bahan', 'Harga/Unit', 'Disiapkan', 'Terjual', 'Sisa', 'Laku (%)', 'Omzet']],
    body: perItemTableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // TABLE 2: RIWAYAT TRANSAKSI PENJUALAN
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Riwayat Transaksi Penjualan Kasir POS', 14, currentY);
  currentY += 4;

  const trTableData = transactions.slice(0, 15).map((tr) => [
    formatDateOnly(tr.date),
    tr.customerName || 'Walk-In',
    tr.items.map((i) => `${i.menuName} (${i.quantity}x)`).join(', '),
    tr.paymentMethod.toUpperCase(),
    formatRp(tr.totalAmount),
    formatRp(tr.netProfit),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Tanggal', 'Pelanggan', 'Rincian Item', 'Bayar', 'Total', 'Laba']],
    body: trTableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // TABLE 3: STOK MENIPIS & INVENTARIS BAHAN BAKU
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Status Inventaris Stok Bahan Baku & Kemasan', 14, currentY);
  currentY += 4;

  const stockTableData = stockItems.map((stk) => [
    stk.name,
    stk.category,
    `${stk.currentStock} ${stk.unit}`,
    `${stk.minStock} ${stk.unit}`,
    formatRp(stk.unitCostPrice),
    stk.currentStock <= stk.minStock ? 'MENIPIS' : 'AMAN',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Bahan / Kemasan', 'Kategori', 'Stok Saat Ini', 'Batas Min', 'HPP Satuan', 'Status']],
    body: stockTableData,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  // Save PDF file
  const dateFile = new Date().toISOString().split('T')[0];
  doc.save(`MoodKukusMamuju_Laporan_Kumulatif_${dateFile}.pdf`);
}

/**
 * Export a single daily report to Excel (.xlsx)
 */
export function exportSingleDailyReportToExcel(report: DailyReport) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['MOOD KUKUS MAMUJU - LAPORAN PENJUALAN HARIAN'],
    [`Tanggal Penjualan: ${report.dateLabel || formatDateOnly(report.date)}`],
    [`Tanggal Finalisasi: ${new Date(report.finalizedAt).toLocaleString('id-ID')}`],
    ['Catatan:', report.notes || '-'],
    [''],
    ['Metrik Penjualan Harian', 'Nilai'],
    ['Total Pemasukan (Omset)', report.totalRevenue],
    ['Total Modal HPP Bahan', report.totalHpp],
    ['Laba Bersih Harian', report.totalProfit],
    ['Total Item Terjual', `${report.totalItemsSold} unit`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Harian');

  if (report.items && report.items.length > 0) {
    const itemRows = report.items.map((it) => ({
      'Nama Menu / Items': it.menuName,
      'Harga Satuan (Rp)': it.pricePerUnit,
      'Modal HPP Satuan (Rp)': it.costPricePerUnit,
      'Jumlah Terjual': it.soldQty,
      'Satuan': it.unitName,
      'Total Omzet (Rp)': it.totalRevenue,
      'Total HPP (Rp)': it.totalHpp,
      'Laba Bersih (Rp)': it.totalProfit,
    }));
    const wsItems = XLSX.utils.json_to_sheet(itemRows);
    XLSX.utils.book_append_sheet(wb, wsItems, 'Rincian Per Item');
  }

  XLSX.writeFile(wb, `MoodKukus_Laporan_Harian_${report.date}.xlsx`);
}

/**
 * Export a single daily report to PDF (.pdf)
 */
export function exportSingleDailyReportToPdf(report: DailyReport) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // HEADER TITLE
  doc.setFillColor(245, 158, 11); // Amber-500
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MOOD KUKUS MAMUJU', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`LAPORAN PENJUALAN HARIAN: ${report.dateLabel || formatDateOnly(report.date)}`, 14, 22);

  let currentY = 36;

  // SUMMARY BOX
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 34, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('RINGKASAN HASIL PENJUALAN HARIAN', 18, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total Pemasukan (Omset) : ${formatRp(report.totalRevenue)}`, 18, currentY + 16);
  doc.text(`• Modal HPP Bahan         : ${formatRp(report.totalHpp)}`, 18, currentY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`• LABA BERSIH HARIAN     : ${formatRp(report.totalProfit)}`, 105, currentY + 16);
  doc.setTextColor(30, 41, 59);
  doc.text(`• Total Porsi/Item Terjual : ${report.totalItemsSold} Unit`, 105, currentY + 24);

  currentY += 42;

  if (report.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Catatan Keterangan: ${report.notes}`, 14, currentY);
    currentY += 8;
  }

  // TABLE OF ITEMS
  if (report.items && report.items.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Rincian Item Terjual:', 14, currentY);
    currentY += 4;

    const tableData = report.items.map((it) => [
      it.menuName,
      formatRp(it.pricePerUnit),
      `${it.soldQty} ${it.unitName}`,
      formatRp(it.totalRevenue),
      formatRp(it.totalHpp),
      formatRp(it.totalProfit),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Nama Menu', 'Harga Satuan', 'Terjual', 'Omzet', 'HPP', 'Laba']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  doc.save(`MoodKukus_Laporan_Harian_${report.date}.pdf`);
}


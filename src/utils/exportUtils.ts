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
  dailyReports = [],
  expenses = [],
}: {
  financialSummary: FinancialSummary;
  transactions?: Transaction[];
  stockItems?: StockItem[];
  expenses?: Expense[];
  menuItems?: MenuItem[];
  dailyReports?: DailyReport[];
}) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. RINGKASAN KEUANGAN TOTAL SHEET
  const isBep = financialSummary.netProfit >= financialSummary.totalCapital && financialSummary.totalCapital > 0;
  const bepStatusStr = financialSummary.totalCapital === 0
    ? 'Belum ada modal awal diinput'
    : isBep
    ? `SUDAH BALIK MODAL & PROFIT (+ ${formatRp(financialSummary.netProfit - financialSummary.totalCapital)})`
    : `BELUM BALIK MODAL (Sisa ${formatRp(financialSummary.totalCapital - financialSummary.netProfit)} lagi untuk BEP)`;

  const summaryData = [
    ['MOOD KUKUS MAMUJU - LAPORAN REKAPITULASI KEUANGAN TOTAL USAHA'],
    [`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`],
    [''],
    ['Metrik Keuangan Utama', 'Nilai (Rp) / Persentase'],
    ['Total Modal Awal Disetor', financialSummary.totalCapital],
    ['Total Pemasukan (Omset)', financialSummary.totalRevenue],
    ['Laba Kotor Usaha', financialSummary.grossProfit],
    ['Total Pengeluaran Operasional', financialSummary.totalExpenses],
    ['Total Laba Bersih Usaha', financialSummary.netProfit],
    ['Margin Keuntungan Usaha', `${financialSummary.profitMargin}%`],
    ['Status Balik Modal (BEP)', bepStatusStr],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Utama');

  // 2. REKAPAN PENJUALAN HARIAN (PEMASUKAN & LABA PER TANGGAL)
  if (dailyReports && dailyReports.length > 0) {
    const reportRows = dailyReports.map((r) => ({
      'Tanggal Penjualan': r.dateLabel || formatDateOnly(r.date),
      'Pemasukan / Omset (Rp)': r.totalRevenue,
      'Modal HPP Bahan (Rp)': r.totalHpp,
      'Laba Bersih Harian (Rp)': r.totalProfit,
      'Total Item/Porsi Terjual': r.totalItemsSold,
      'Catatan Keterangan': r.notes || '-',
    }));
    const wsReports = XLSX.utils.json_to_sheet(reportRows);
    XLSX.utils.book_append_sheet(wb, wsReports, 'Rekapan Penjualan Harian');
  }

  // 3. REKAPAN PENGELUARAN USAHA
  if (expenses && expenses.length > 0) {
    const expenseRows = expenses.map((exp) => ({
      'Tanggal': formatDateOnly(exp.date),
      'Judul / Keterangan Pengeluaran': exp.title,
      'Kategori': exp.category,
      'Jumlah Pengeluaran (Rp)': exp.amount,
      'Tipe Pengeluaran': exp.isCapital ? 'Modal / Investasi' : 'Operasional',
      'Metode Pembayaran': exp.paymentMethod.toUpperCase(),
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Rekapan Pengeluaran');
  }

  // Download XLSX
  XLSX.writeFile(wb, `MoodKukusMamuju_Laporan_Total_${dateStr}.xlsx`);
}

/**
 * Export concise clean professional PDF report containing strictly Pemasukan, Pengeluaran & Laba Bersih
 */
export function exportToPdf({
  financialSummary,
  dailyReports = [],
  expenses = [],
}: {
  financialSummary: FinancialSummary;
  transactions?: Transaction[];
  stockItems?: StockItem[];
  expenses?: Expense[];
  menuItems?: MenuItem[];
  dailyReports?: DailyReport[];
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
  doc.text('Laporan Rekapitualisi Total: Pemasukan, Pengeluaran & Laba Bersih Usaha', 14, 22);

  doc.setFontSize(9);
  doc.text(`Tanggal Export: ${dateStr}`, 145, 15);

  let currentY = 36;

  // METRICS SUMMARY BOX WITH BEP ANALYSIS
  const isBep = financialSummary.netProfit >= financialSummary.totalCapital && financialSummary.totalCapital > 0;
  const bepStatusStr = financialSummary.totalCapital === 0
    ? 'BEP: Modal Awal Belum Diinput'
    : isBep
    ? `BEP: SUDAH BALIK MODAL 🎉 (+${formatRp(financialSummary.netProfit - financialSummary.totalCapital)})`
    : `BEP: BELUM BALIK MODAL ⏳ (Sisa ${formatRp(financialSummary.totalCapital - financialSummary.netProfit)})`;

  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 40, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('REKAPITULASI KEUANGAN & BEP TOTAL USAHA', 18, currentY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Modal Awal Disetor : ${formatRp(financialSummary.totalCapital)}`, 18, currentY + 16);
  doc.text(`• Total Pemasukan    : ${formatRp(financialSummary.totalRevenue)}`, 18, currentY + 24);
  doc.text(`• Total Pengeluaran  : ${formatRp(financialSummary.totalExpenses)}`, 18, currentY + 32);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`• TOTAL LABA BERSIH  : ${formatRp(financialSummary.netProfit)}`, 110, currentY + 16);
  doc.setTextColor(245, 158, 11);
  doc.text(`• MARGIN PROFIT      : ${financialSummary.profitMargin}%`, 110, currentY + 24);
  doc.setTextColor(isBep ? 16 : 225, isBep ? 185 : 29, isBep ? 129 : 72);
  doc.text(`• ${bepStatusStr}`, 110, currentY + 32);

  currentY += 48;

  // TABLE 1: REKAPAN PENJUALAN HARIAN
  if (dailyReports && dailyReports.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Rekapan Laporan Penjualan Harian (Pemasukan & Laba Bersih)', 14, currentY);
    currentY += 4;

    const reportTableData = dailyReports.map((r) => [
      r.dateLabel || formatDateOnly(r.date),
      formatRp(r.totalRevenue),
      formatRp(r.totalHpp),
      formatRp(r.totalProfit),
      `${r.totalItemsSold} Unit`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Tanggal Penjualan', 'Pemasukan (Omset)', 'Modal (HPP)', 'Laba Bersih', 'Terjual']],
      body: reportTableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // TABLE 2: REKAPAN PENGELUARAN USAHA
  if (expenses && expenses.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. Rekapan Pengeluaran Usaha (Operasional & Modal)', 14, currentY);
    currentY += 4;

    const expenseTableData = expenses.map((exp) => [
      formatDateOnly(exp.date),
      exp.title,
      exp.category,
      formatRp(exp.amount),
      exp.isCapital ? 'Modal/Investasi' : 'Operasional',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Tanggal', 'Judul / Keterangan', 'Kategori', 'Jumlah (Rp)', 'Tipe']],
      body: expenseTableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  // Save PDF file
  const dateFile = new Date().toISOString().split('T')[0];
  doc.save(`MoodKukusMamuju_Laporan_Total_${dateFile}.pdf`);
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


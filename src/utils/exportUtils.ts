import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialSummary, Transaction, StockItem, Expense, MenuItem, DailyReport } from '../types';
import { calculatePerItemSales, formatRp, formatDateOnly } from './calculations';

/**
 * Export full cumulative business report to Excel (.xlsx) file
 * Focused purely on essential totals: Pemasukan, Pengeluaran, Laba Bersih, and Daily Summaries
 */
export function exportToExcel({
  financialSummary,
  dailyReports,
  expenses,
}: {
  financialSummary: FinancialSummary;
  dailyReports?: DailyReport[];
  expenses?: Expense[];
}) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. REKAPAN UTAMA KEUANGAN (Pemasukan, Pengeluaran, Laba Bersih)
  const summaryData = [
    ['MOOD KUKUS MAMUJU - REKAPAN KUMULATIF USAN'],
    [`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
    [''],
    ['Keterangan', 'Jumlah (Rp)'],
    ['TOTAL PEMASUKAN (REVENUE)', financialSummary.totalRevenue],
    ['TOTAL PENGELUARAN (EXPENSE)', financialSummary.totalExpenses],
    ['LABA BERSIH (NET PROFIT)', financialSummary.netProfit],
    ['MARGIN KEUNTUNGAN (%)', `${financialSummary.profitMargin}%`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekapan Keuangan');

  // 2. REKAPAN PENJUALAN PER HARI
  if (dailyReports && dailyReports.length > 0) {
    const dailyRows = dailyReports.map((r) => ({
      'Tanggal': r.dateLabel,
      'Total Item Terjual (Unit)': r.totalItemsSold,
      'Total Pemasukan / Omset (Rp)': r.totalRevenue,
      'Total HPP / Modal (Rp)': r.totalHpp,
      'Laba Bersih (Rp)': r.totalProfit,
      'Catatan': r.notes || '-',
    }));
    const wsDaily = XLSX.utils.json_to_sheet(dailyRows);
    XLSX.utils.book_append_sheet(wb, wsDaily, 'Laporan Per Hari');
  }

  // 3. REKAPAN PENGELUARAN
  if (expenses && expenses.length > 0) {
    const expRows = expenses.map((e) => ({
      'Tanggal': formatDateOnly(e.date),
      'Nama Pengeluaran': e.title,
      'Kategori': e.category,
      'Biaya (Rp)': e.amount,
      'Metode Pembayaran': e.paymentMethod.toUpperCase(),
      'Catatan': e.notes || '-',
    }));
    const wsExp = XLSX.utils.json_to_sheet(expRows);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Rekapan Pengeluaran');
  }

  // Download XLSX
  XLSX.writeFile(wb, `MoodKukusMamuju_Rekapan_Kumulatif_${dateStr}.xlsx`);
}

/**
 * Export clean professional PDF report for cumulative totals
 */
export function exportToPdf({
  financialSummary,
  dailyReports,
  expenses,
}: {
  financialSummary: FinancialSummary;
  dailyReports?: DailyReport[];
  expenses?: Expense[];
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
  doc.text('MOOD KUKUS MAMUJU', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Laporan Rekapan Kumulatif Keuangan & Penjualan Usaha', 14, 21);
  doc.text(`Tanggal Cetak: ${dateStr}`, 140, 14);

  let currentY = 36;

  // METRICS SUMMARY BOX
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, 34, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('REKAPAN UTAMA KEUANGAN KUMULATIF', 18, currentY + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• TOTAL PEMASUKAN : ${formatRp(financialSummary.totalRevenue)}`, 18, currentY + 17);
  doc.text(`• TOTAL PENGELUARAN : ${formatRp(financialSummary.totalExpenses)}`, 18, currentY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`• LABA BERSIH TOTAL : ${formatRp(financialSummary.netProfit)}`, 105, currentY + 17);
  doc.setTextColor(14, 165, 233);
  doc.text(`• MARGIN PROFIT TOTAL : ${financialSummary.profitMargin}%`, 105, currentY + 25);

  currentY += 42;

  // TABLE: LAPORAN PENJUALAN PER HARI
  if (dailyReports && dailyReports.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Rekapan Laporan Penjualan Per Hari', 14, currentY);
    currentY += 4;

    const dailyTableData = dailyReports.map((r) => [
      r.dateLabel,
      `${r.totalItemsSold} unit`,
      formatRp(r.totalRevenue),
      formatRp(r.totalHpp),
      formatRp(r.totalProfit),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Tanggal', 'Volume Terjual', 'Pemasukan (Omset)', 'Modal (HPP)', 'Laba Bersih']],
      body: dailyTableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Save PDF file
  const dateFile = new Date().toISOString().split('T')[0];
  doc.save(`MoodKukusMamuju_Rekapan_Kumulatif_${dateFile}.pdf`);
}

/**
 * Export single daily report to Excel (.xlsx)
 */
export function exportDailyReportToExcel(report: DailyReport) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['MOOD KUKUS MAMUJU - LAPORAN PENJUALAN HARIAN'],
    [`Tanggal Penjualan: ${report.dateLabel}`],
    [`Catatan Harian: ${report.notes || '-'}`],
    [''],
    ['Metrik Harian', 'Nilai (Rp)'],
    ['Total Pemasukan (Omset)', report.totalRevenue],
    ['Total Modal HPP', report.totalHpp],
    ['Laba Bersih Harian', report.totalProfit],
    ['Total Item Terjual', `${report.totalItemsSold} unit`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Harian');

  if (report.items && report.items.length > 0) {
    const itemRows = report.items.map((item) => ({
      'Nama Item Jualan': item.menuName,
      'Harga per Unit (Rp)': item.pricePerUnit,
      'Modal HPP per Unit (Rp)': item.costPricePerUnit,
      'Jumlah Terjual': item.soldQty,
      'Satuan': item.unitName,
      'Total Omset (Rp)': item.totalRevenue,
      'Laba Bersih (Rp)': item.totalProfit,
    }));
    const wsItems = XLSX.utils.json_to_sheet(itemRows);
    XLSX.utils.book_append_sheet(wb, wsItems, 'Rincian Item Terjual');
  }

  XLSX.writeFile(wb, `Laporan_Harian_MoodKukus_${report.date.split('T')[0]}.xlsx`);
}

/**
 * Export single daily report to PDF (.pdf)
 */
export function exportDailyReportToPdf(report: DailyReport) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // HEADER TITLE
  doc.setFillColor(245, 158, 11); // Amber-500
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MOOD KUKUS MAMUJU', 14, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`LAPORAN PENJUALAN HARIAN: ${report.dateLabel}`, 14, 21);

  let currentY = 36;

  // SUMMARY BOX
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(14, currentY, 182, 30, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`• TOTAL PEMASUKAN : ${formatRp(report.totalRevenue)}`, 18, currentY + 11);
  doc.text(`• TOTAL MODAL (HPP) : ${formatRp(report.totalHpp)}`, 18, currentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`• LABA BERSIH HARIAN : ${formatRp(report.totalProfit)}`, 105, currentY + 11);
  doc.setTextColor(100, 116, 139);
  doc.text(`• VOLUME TERJUAL    : ${report.totalItemsSold} unit`, 105, currentY + 20);

  currentY += 38;

  // ITEM TABLE
  if (report.items && report.items.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Rincian Item Jualan Terjual:', 14, currentY);
    currentY += 4;

    const itemTableData = report.items.map((item) => [
      item.menuName,
      formatRp(item.pricePerUnit),
      `${item.soldQty} ${item.unitName}`,
      formatRp(item.totalRevenue),
      formatRp(item.totalProfit),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Nama Item', 'Harga/Unit', 'Terjual', 'Total Omset', 'Laba Bersih']],
      body: itemTableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });
  }

  doc.save(`Laporan_Harian_MoodKukus_${report.date.split('T')[0]}.pdf`);
}


import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  Search,
  Trash2,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { DailyReport } from '../types';
import { formatRp } from '../utils/calculations';
import { exportDailyReportToExcel, exportDailyReportToPdf } from '../utils/exportUtils';

interface DailyHistoryProps {
  dailyReports: DailyReport[];
  onOpenFinalizeModal: () => void;
  onDeleteDailyReport: (id: string) => void;
  onAddManualDailyReport?: (report: DailyReport) => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

export const DailyHistory: React.FC<DailyHistoryProps> = ({
  dailyReports,
  onOpenFinalizeModal,
  onDeleteDailyReport,
  onAddManualDailyReport,
}) => {
  const [expandedReportId, setExpandedReportId] = useState<string | null>(
    dailyReports[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

  // State for manual income input modal
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualDate, setManualDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [manualRevenue, setManualRevenue] = useState<number>(150000);
  const [manualHpp, setManualHpp] = useState<number>(0);
  const [manualNotes, setManualNotes] = useState<string>('Rekap omset manual penjualan hari lalu');

  // Filter reports
  const filteredReports = dailyReports.filter((rep) => {
    const matchesSearch =
      rep.dateLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.notes && rep.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rep.items.some((item) => item.menuName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDate = !filterDate || rep.date === filterDate;

    return matchesSearch && matchesDate;
  });

  // Calculate cumulative stats
  const totalCumulativeRevenue = dailyReports.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalCumulativeProfit = dailyReports.reduce((acc, r) => acc + r.totalProfit, 0);
  const totalCumulativeItems = dailyReports.reduce((acc, r) => acc + r.totalItemsSold, 0);
  const avgRevenuePerDay =
    dailyReports.length > 0 ? Math.round(totalCumulativeRevenue / dailyReports.length) : 0;

  const toggleExpand = (id: string) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  const handleSaveManualReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRevenue <= 0 || !manualDate) return;

    const parsedDate = new Date(manualDate + 'T12:00:00');
    const dateLabel = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);

    const report: DailyReport = {
      id: `rep-${Date.now()}`,
      date: manualDate,
      dateLabel,
      totalRevenue: manualRevenue,
      totalHpp: manualHpp,
      totalProfit: manualRevenue - manualHpp,
      totalItemsSold: 0,
      items: [],
      notes: manualNotes.trim() || 'Rekap omset manual hari lalu',
      finalizedAt: new Date().toISOString(),
      isStockDeducted: true,
    };

    if (onAddManualDailyReport) {
      onAddManualDailyReport(report);
    }

    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Histori Laporan Penjualan Harian</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
            Laporan Penjualan Per Hari
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl">
            Arsip lengkap hasil penjualan harian Mood Kukus Mamuju. Anda dapat meninjau rincian item laku, total omset, modal HPP, dan laba bersih per hari.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            title="Tambah Laporan Pemasukan Nominal Langsung untuk Hari Lalu yang Belum Tercatat"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Input Omset Hari Lalu</span>
          </button>

          <button
            type="button"
            onClick={onOpenFinalizeModal}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalisasi Hari Ini</span>
          </button>
        </div>
      </div>

      {/* Cumulative Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Hari Difinalisasi
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-400 flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>{dailyReports.length} Hari</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Total Omset Akumulasi
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{formatRp(totalCumulativeRevenue)}</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Total Laba Akumulasi
          </span>
          <div className="text-lg sm:text-xl font-black text-teal-300 flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-teal-300" />
            <span>{formatRp(totalCumulativeProfit)}</span>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Rata-Rata Omset / Hari
          </span>
          <div className="text-lg sm:text-xl font-black text-stone-200 flex items-center gap-1.5">
            <Package className="w-5 h-5 text-stone-400" />
            <span>{formatRp(avgRevenuePerDay)}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan tanggal, menu laku, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 bg-stone-800 rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* List of Reports */}
      {filteredReports.length === 0 ? (
        <div className="bg-stone-900/60 border border-dashed border-stone-800 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-200">Belum Ada Laporan Harian Terdaftar</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Gunakan tombol <span className="text-amber-400 font-bold">Finalisasi Penjualan Hari Ini</span> di atas untuk merekap & menyimpan hasil jualan hari ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isExpanded = expandedReportId === report.id;
            return (
              <div
                key={report.id}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                {/* Summary Header */}
                <div
                  onClick={() => toggleExpand(report.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-stone-850/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-stone-100 flex items-center gap-2">
                        <span>{report.dateLabel}</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 bg-stone-800 text-stone-400 rounded-full border border-stone-700">
                          {report.items.length} jenis item ({report.totalItemsSold} unit)
                        </span>
                      </h3>
                      {report.notes && (
                        <p className="text-xs text-stone-400 mt-1 line-clamp-1 italic">
                          "{report.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Omset Hari Ini:</span>
                        <span className="font-black text-emerald-400 text-sm">{formatRp(report.totalRevenue)}</span>
                      </div>
                      <div className="w-px h-6 bg-stone-800" />
                      <div>
                        <span className="text-[10px] text-stone-400 block">Laba Bersih:</span>
                        <span className="font-black text-teal-300 text-sm">{formatRp(report.totalProfit)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportDailyReportToExcel(report);
                        }}
                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        title="Export Laporan Hari Ini ke Excel"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportDailyReportToPdf(report);
                        }}
                        className="p-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        title="Export Laporan Hari Ini ke PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus laporan harian tanggal ${report.dateLabel}?`)) {
                            onDeleteDailyReport(report.id);
                          }
                        }}
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Hapus Laporan Harian Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-1.5 bg-stone-800 text-stone-300 rounded-xl">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Detail View */}
                {isExpanded && (
                  <div className="border-t border-stone-800 bg-stone-950/70 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-amber-400" />
                        <span>Rincian Item Terjual Tanggal {report.dateLabel}</span>
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        Waktu Finalisasi: {new Date(report.finalizedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-stone-800 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800 text-[11px]">
                          <tr>
                            <th className="p-3">Nama Item Jualan</th>
                            <th className="p-3 text-center">Harga Jual</th>
                            <th className="p-3 text-center">Modal HPP (Est)</th>
                            <th className="p-3 text-center">Qty Terjual</th>
                            <th className="p-3 text-right">Total Omset</th>
                            <th className="p-3 text-right">Laba Bersih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/80">
                          {report.items.map((item) => (
                            <tr key={item.menuItemId} className="hover:bg-stone-900/50 transition-colors">
                              <td className="p-3 font-bold text-stone-200">{item.menuName}</td>
                              <td className="p-3 text-center text-stone-300">{formatRp(item.pricePerUnit)}</td>
                              <td className="p-3 text-center text-stone-400">{formatRp(item.costPricePerUnit)}</td>
                              <td className="p-3 text-center font-extrabold text-amber-300">
                                {item.soldQty} {item.unitName}
                              </td>
                              <td className="p-3 text-right font-bold text-emerald-400">{formatRp(item.totalRevenue)}</td>
                              <td className="p-3 text-right font-bold text-teal-300">+{formatRp(item.totalProfit)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-stone-900 border-t border-stone-800 font-extrabold text-xs">
                          <tr>
                            <td colSpan={3} className="p-3 text-stone-300">TOTAL KESELURUHAN HARI INI</td>
                            <td className="p-3 text-center text-amber-400">{report.totalItemsSold} unit</td>
                            <td className="p-3 text-right text-emerald-400">{formatRp(report.totalRevenue)}</td>
                            <td className="p-3 text-right text-teal-300">{formatRp(report.totalProfit)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {report.notes && (
                      <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl">
                        <span className="text-[11px] font-bold text-amber-400 block mb-0.5">Catatan Harian:</span>
                        <p className="text-xs text-stone-300">{report.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Modal Input Omset / Pemasukan Hari Lalu */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-100">Input Pemasukan / Omset Hari Lalu</h3>
                  <p className="text-[11px] text-amber-400">Rekap Nominal Pemasukan Tanpa Detail Item</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualReport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Tanggal Laporan Penjualan</label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onClick={(e) => {
                    try { (e.target as HTMLInputElement).showPicker(); } catch {}
                  }}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Total Pemasukan / Omset (Rp)</label>
                <input
                  type="number"
                  required
                  value={manualRevenue === 0 ? '' : manualRevenue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setManualRevenue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Estimasi Modal HPP (Rp) (Opsional)</label>
                <input
                  type="number"
                  value={manualHpp === 0 ? '' : manualHpp}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setManualHpp(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Biarkan 0 jika tidak diingat, atau isi estimasi bahan baku.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Catatan penjualan..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 text-xs rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md"
                >
                  Simpan Laporan Hari Lalu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

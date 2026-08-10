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
  History,
} from 'lucide-react';
import { DailyReport } from '../types';
import { formatRp } from '../utils/calculations';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

interface DailyHistoryProps {
  dailyReports: DailyReport[];
  onOpenFinalizeModal: () => void;
  onDeleteDailyReport: (id: string) => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onOpenManualPastReport?: () => void;
}

export const DailyHistory: React.FC<DailyHistoryProps> = ({
  dailyReports,
  onOpenFinalizeModal,
  onDeleteDailyReport,
  onOpenManualPastReport,
}) => {
  const [expandedReportId, setExpandedReportId] = useState<string | null>(
    dailyReports[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');

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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenFinalizeModal}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalisasi Penjualan Hari Ini</span>
          </button>

          {onOpenManualPastReport && (
            <button
              onClick={onOpenManualPastReport}
              className="px-4 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              title="Input manual omset hari lalu saat catatan per item bahan hilang"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>+ Input Pemasukan Lalu</span>
            </button>
          )}
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
    </div>
  );
};

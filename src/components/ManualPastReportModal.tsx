import React, { useState } from 'react';
import { X, Calendar, DollarSign, FileText, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { DailyReport } from '../types';
import { formatRp, formatDateOnly } from '../utils/calculations';

interface ManualPastReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveManualReport: (report: DailyReport) => void;
}

export const ManualPastReportModal: React.FC<ManualPastReportModalProps> = ({
  isOpen,
  onClose,
  onSaveManualReport,
}) => {
  // Get yesterday's YYYY-MM-DD
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [reportDate, setReportDate] = useState<string>(yesterdayISO);
  const [revenue, setRevenue] = useState<number | ''>(500000);
  const [estimatedHpp, setEstimatedHpp] = useState<number | ''>(200000);
  const [estimatedItemsSold, setEstimatedItemsSold] = useState<number | ''>(50);
  const [notes, setNotes] = useState<string>('Pemasukan hari lalu diinput manual (catatan rincian per item hilang)');

  if (!isOpen) return null;

  const numRevenue = typeof revenue === 'number' ? revenue : 0;
  const numHpp = typeof estimatedHpp === 'number' ? estimatedHpp : 0;
  const numProfit = numRevenue - numHpp;
  const numItems = typeof estimatedItemsSold === 'number' ? estimatedItemsSold : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDate || numRevenue <= 0) {
      alert('Mohon masukkan tanggal dan jumlah total pemasukan yang valid.');
      return;
    }

    const d = new Date(reportDate);
    const dateLabel = !isNaN(d.getTime())
      ? new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(d)
      : formatDateOnly(reportDate);

    const newReport: DailyReport = {
      id: `report-manual-${Date.now()}`,
      date: reportDate,
      dateLabel,
      totalRevenue: numRevenue,
      totalHpp: numHpp,
      totalProfit: numProfit,
      totalItemsSold: numItems,
      items: [
        {
          menuItemId: `manual-${Date.now()}`,
          menuName: `Pemasukan Hari Lalu (${notes || 'Catatan per item tidak tersedia'})`,
          unitName: 'porsi',
          pricePerUnit: numRevenue,
          costPricePerUnit: numHpp,
          soldQty: numItems,
          totalRevenue: numRevenue,
          totalHpp: numHpp,
          totalProfit: numProfit,
        },
      ],
      notes: notes || 'Input manual dari pemasukan yang diingat.',
      finalizedAt: new Date().toISOString(),
      isStockDeducted: false, // Don't deduct stock since it's historical manual entry
    };

    onSaveManualReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-100 flex items-center gap-2">
                <span>Input Manual Pemasukan Lalu</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Histori Lampa
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Catat total pemasukan hari lalu saat rincian per item tidak tersedia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Form ini memudahkan Anda memasukkan hasil omset hari-hari sebelumnya yang rincian per item bahannya sudah tidak ada. Angka omset ini akan langsung ditambahkan ke total akumulasi seluruh usaha.
            </p>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih Tanggal Laporan Penjualan:</span>
            </label>
            <input
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              onClick={(e) => {
                try { (e.target as HTMLInputElement).showPicker(); } catch {}
              }}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          {/* Revenue */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Pemasukan / Uang Masuk Hari Tersebut (Rp):</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Rp</span>
              <input
                type="number"
                min="0"
                step="1000"
                required
                placeholder="misal: 500000"
                value={revenue}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setRevenue(val);
                  if (typeof val === 'number') {
                    // Automatically suggest 40% HPP as standard
                    setEstimatedHpp(Math.round(val * 0.4));
                  }
                }}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* HPP & Estimated Profit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300">
                Estimasi Modal HPP Bahan (Rp):
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="misal: 200000"
                value={estimatedHpp}
                onChange={(e) => setEstimatedHpp(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300">
                Estimasi Unit Terjual (Porsi/Unit):
              </label>
              <input
                type="number"
                min="1"
                placeholder="misal: 50"
                value={estimatedItemsSold}
                onChange={(e) => setEstimatedItemsSold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Real-time Summary Box */}
          <div className="bg-stone-950 border border-emerald-800/80 rounded-xl p-3 text-xs space-y-1.5">
            <div className="font-bold text-stone-300 border-b border-stone-800 pb-1 flex justify-between">
              <span>Preview Hasil Laporan:</span>
              <span className="text-emerald-400 font-black">{formatDateOnly(reportDate)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div>
                <span className="text-[10px] text-stone-400 block">Pemasukan:</span>
                <span className="font-black text-emerald-400 text-xs">{formatRp(numRevenue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Modal HPP:</span>
                <span className="font-bold text-rose-300 text-xs">{formatRp(numHpp)}</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Laba Bersih:</span>
                <span className="font-black text-teal-300 text-xs">+{formatRp(numProfit)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Catatan Keterangan Laporan:</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan keterangan..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Laporan Past Penjualan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

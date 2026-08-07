import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Calendar, DollarSign, PackageCheck } from 'lucide-react';
import { MenuItem, StockItem, SauceItem, DailyReport, DailyReportItem } from '../types';
import { calculateMenuItemHpp, formatRp } from '../utils/calculations';

interface FinalizeDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  sauces: SauceItem[];
  stockItems: StockItem[];
  onFinalizeDay: (report: DailyReport, resetTodaySales: boolean) => void;
}

export const FinalizeDayModal: React.FC<FinalizeDayModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  sauces,
  stockItems,
  onFinalizeDay,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [resetTodaySales, setResetTodaySales] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filter items that have soldQty > 0
  const soldItemsToday = menuItems.filter((m) => {
    if ((m.soldQty || 0) <= 0) return false;
    if (m.category === 'kemasan' || m.category === 'paket') return false;
    const nameLower = m.name.toLowerCase();
    if (nameLower.includes('paket') || nameLower.includes('combo')) return false;
    return true;
  });

  // Calculate breakdown
  let totalRevenue = 0;
  let totalHpp = 0;
  let totalItemsSold = 0;

  const reportItems: DailyReportItem[] = soldItemsToday.map((m) => {
    const qty = m.soldQty || 0;
    const hppPerUnit = calculateMenuItemHpp(m, m.defaultSauceId, sauces, stockItems);
    const itemRevenue = m.price * qty;
    const itemHpp = hppPerUnit * qty;
    const itemProfit = itemRevenue - itemHpp;

    totalRevenue += itemRevenue;
    totalHpp += itemHpp;
    totalItemsSold += qty;

    return {
      menuItemId: m.id,
      menuName: m.name,
      unitName: m.unitName || 'pcs',
      pricePerUnit: m.price,
      costPricePerUnit: hppPerUnit,
      soldQty: qty,
      totalRevenue: itemRevenue,
      totalHpp: itemHpp,
      totalProfit: itemProfit,
    };
  });

  const totalProfit = totalRevenue - totalHpp;

  // Format today's date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (soldItemsToday.length === 0) {
      alert('Belum ada item laku terjual yang diinput untuk hari ini.');
      return;
    }

    const report: DailyReport = {
      id: `rep-${Date.now()}`,
      date: dateStr,
      dateLabel,
      totalRevenue,
      totalHpp,
      totalProfit,
      totalItemsSold,
      items: reportItems,
      notes: notes.trim() || undefined,
      finalizedAt: now.toISOString(),
    };

    onFinalizeDay(report, resetTodaySales);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-stone-100 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-100">Finalisasi Penjualan Hari Ini</h3>
              <p className="text-xs text-amber-400 font-semibold">{dateLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {soldItemsToday.length === 0 ? (
          <div className="bg-stone-950 p-6 rounded-xl border border-dashed border-stone-800 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="font-bold text-sm text-stone-200">Belum Ada Item Terjual Diinput</h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              Silakan masukkan dulu jumlah item laku terjual hari ini pada tabel di Ringkasan Usaha sebelum melakukan finalisasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-3 gap-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Total Omset</span>
                <span className="text-sm font-black text-emerald-400">{formatRp(totalRevenue)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Total Modal (HPP)</span>
                <span className="text-sm font-black text-amber-400">{formatRp(totalHpp)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Laba Bersih</span>
                <span className="text-sm font-black text-teal-300">{formatRp(totalProfit)}</span>
              </div>
            </div>

            {/* Itemized Table Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Rincian Item Laku Terjual ({totalItemsSold} unit total):</span>
              </label>
              <div className="max-h-52 overflow-y-auto border border-stone-800 rounded-xl bg-stone-950 p-2 space-y-1.5">
                {reportItems.map((item) => {
                  const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                  const preparedQty = menuItem?.preparedQty || Math.max(item.soldQty + 10, 30);
                  const remainingQty = Math.max(0, preparedQty - item.soldQty);

                  return (
                    <div
                      key={item.menuItemId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 bg-stone-900 rounded-lg border border-stone-800/80 gap-2"
                    >
                      <div>
                        <div className="font-bold text-stone-200">{item.menuName}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{item.soldQty} {item.unitName} × {formatRp(item.pricePerUnit)}</span>
                          <span className="text-rose-400 font-semibold">(Selisih: -{item.soldQty} {item.unitName})</span>
                          <span className="text-teal-300 font-semibold">(Sisa Stok: {remainingQty} {item.unitName})</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="font-bold text-emerald-400">{formatRp(item.totalRevenue)}</div>
                        <div className="text-[10px] text-teal-300">Profit: +{formatRp(item.totalProfit)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Catatan Penjualan Hari Ini (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Misal: Penjualan sore hari ramai. Pisang kepok kukus habis pukul 17:00."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Checkbox Reset */}
            <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl flex items-center gap-2.5">
              <input
                type="checkbox"
                id="resetTodaySalesCheck"
                checked={resetTodaySales}
                onChange={(e) => setResetTodaySales(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded shrink-0 cursor-pointer"
              />
              <label htmlFor="resetTodaySalesCheck" className="text-xs text-amber-200 font-medium cursor-pointer">
                Reset angka laku terjual hari ini ke 0 setelah disimpan (Siap untuk pencatatan besok)
              </label>
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Finalisasi Laporan Hari Ini</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

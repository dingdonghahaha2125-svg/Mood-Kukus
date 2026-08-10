import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  TrendingDown,
  Building,
  Trash2,
  Calendar,
  Filter,
  CreditCard,
  Tag,
  Wallet,
} from 'lucide-react';
import { Expense, ExpenseCategory, StockItem } from '../types';
import { formatRp, formatDateOnly } from '../utils/calculations';

interface ExpenseTrackerProps {
  expenses: Expense[];
  stockItems?: StockItem[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenInitialCapitalModal?: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  stockItems = [],
  onAddExpense,
  onDeleteExpense,
  onOpenInitialCapitalModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterCapital, setFilterCapital] = useState<string>('all');

  const [formData, setFormData] = useState<{
    title: string;
    category: ExpenseCategory;
    amount: number | '';
    isCapital: boolean;
    paymentMethod: 'qris' | 'cash' | 'transfer';
    notes: string;
    date: string;
    linkToStock: boolean;
    stockItemId: string;
    addedStockQty: number | '';
  }>({
    title: '',
    category: 'belanja_bahan',
    amount: 150000,
    isCapital: false,
    paymentMethod: 'qris',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    linkToStock: false,
    stockItemId: '',
    addedStockQty: 5,
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) return;

    onAddExpense({
      id: `exp-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      isCapital: formData.isCapital,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      date: new Date(formData.date).toISOString(),
      stockItemId: formData.linkToStock && formData.stockItemId ? formData.stockItemId : undefined,
      addedStockQty: formData.linkToStock && formData.addedStockQty > 0 ? Number(formData.addedStockQty) : undefined,
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'belanja_bahan',
      amount: 150000,
      isCapital: false,
      paymentMethod: 'qris',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      linkToStock: false,
      stockItemId: '',
      addedStockQty: 5,
    });
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter((ex) => {
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    let matchesCapital = true;
    if (filterCapital === 'capital') matchesCapital = ex.isCapital;
    if (filterCapital === 'operational') matchesCapital = !ex.isCapital;

    return matchesCategory && matchesCapital;
  });

  const totalCapital = expenses.filter((e) => e.isCapital).reduce((sum, e) => sum + e.amount, 0);
  const totalOperational = expenses.filter((e) => !e.isCapital).reduce((sum, e) => sum + e.amount, 0);

  const getCategoryLabel = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'modal_awal':
        return 'Modal Awal';
      case 'belanja_bahan':
        return 'Belanja Bahan Baku';
      case 'pembelian_kemasan':
        return 'Pembelian Kemasan Eco';
      case 'peralatan':
        return 'Peralatan Kukusan';
      case 'sewa_operasional':
        return 'Sewa & Operasional';
      case 'pemasaran':
        return 'Pemasaran & Branding';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-300" />
            Pengeluaran Operasional & Modal Awal
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80">
            Catat semua belanja bahan baku pasar, pembelian kemasan besek, sewa booth, dan investasi peralatan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenInitialCapitalModal && (
            <button
              onClick={onOpenInitialCapitalModal}
              className="px-3.5 py-2 bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Atur modal awal rintis usaha dari nol"
            >
              <Wallet className="w-4 h-4 text-cyan-300" />
              <span>+ Kelola Modal Awal (BEP)</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-sky-400/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Catat Pengeluaran Baru
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 space-y-1 transition-all duration-300 backdrop-blur-sm">
          <span className="text-xs text-sky-200/80 font-medium">Pengeluaran Operasional (Rutin)</span>
          <div className="text-xl font-black text-rose-400">{formatRp(totalOperational)}</div>
          <p className="text-[10px] text-sky-300/60">Bahan baku pasar, kemasan, gas LPG, sewa</p>
        </div>

        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 space-y-1 transition-all duration-300 backdrop-blur-sm">
          <span className="text-xs text-sky-200/80 font-medium">Modal Awal Terinvestasi (Aset)</span>
          <div className="text-xl font-black text-cyan-300">{formatRp(totalCapital)}</div>
          <p className="text-[10px] text-sky-300/60">Panci pengukus, booth wooden, banner</p>
        </div>

        <div className="bg-slate-900/90 border border-sky-800/40 hover:border-sky-400/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 rounded-2xl p-4 space-y-1 transition-all duration-300 backdrop-blur-sm">
          <span className="text-xs text-sky-200/80 font-medium">Total Akumulasi Arus Kas Keluar</span>
          <div className="text-xl font-black text-slate-100">{formatRp(totalOperational + totalCapital)}</div>
          <p className="text-[10px] text-sky-300/60">Total modal awal + operasional</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-900/90 border border-sky-800/40 rounded-2xl p-4 space-y-3 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Semua Kategori</option>
              <option value="belanja_bahan">Belanja Bahan Baku</option>
              <option value="pembelian_kemasan">Pembelian Kemasan Eco</option>
              <option value="peralatan">Peralatan Kukusan</option>
              <option value="sewa_operasional">Sewa & Operasional</option>
              <option value="pemasaran">Pemasaran & Branding</option>
            </select>
          </div>

          <div className="sm:w-48">
            <select
              value={filterCapital}
              onChange={(e) => setFilterCapital(e.target.value)}
              className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Semua Tipe (Modal & Operasional)</option>
              <option value="operational">Hanya Operasional Rutin</option>
              <option value="capital">Hanya Modal Awal (Aset)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-slate-900/90 border border-sky-800/40 rounded-2xl overflow-hidden shadow-sm backdrop-blur-sm">
        <div className="p-4 border-b border-sky-900/40 font-bold text-slate-100 text-sm">
          Riwayat Pengeluaran ({filteredExpenses.length} transaksi)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950 text-sky-200/70 uppercase text-[10px] tracking-wider border-b border-sky-900/40">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Deskripsi Pengeluaran</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Jumlah (Rp)</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-900/40">
              {filteredExpenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-sky-950/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sky-200/70 text-xs">
                    {formatDateOnly(ex.date)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-100">
                    {ex.title}
                    {ex.notes && <p className="text-[10px] text-sky-300/70 font-normal">{ex.notes}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-cyan-300 border border-sky-800/60">
                      {getCategoryLabel(ex.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {ex.isCapital ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-cyan-300 border border-sky-700/80">
                        Modal Awal
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                        Operasional
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-rose-400">
                    -{formatRp(ex.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => onDeleteExpense(ex.id)}
                      className="p-1.5 text-sky-200/50 hover:text-rose-400 transition-colors"
                      title="Hapus Pengeluaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Log New Expense */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-800/60 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <h3 className="font-bold text-lg text-slate-100">Catat Pengeluaran & Modal Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-sky-200/60 hover:text-slate-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Judul Pengeluaran / Pembelian</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Belanja Pisang & Ubi di Pasar Induk"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="belanja_bahan">Belanja Bahan Baku Pasar</option>
                    <option value="pembelian_kemasan">Pembelian Kemasan Besek/Paper</option>
                    <option value="peralatan">Peralatan Kukusan / Dapur</option>
                    <option value="sewa_operasional">Sewa Tempat & Gas LPG</option>
                    <option value="pemasaran">Pemasaran & Branding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Jumlah Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 font-bold text-cyan-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Metode Pembayaran</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="qris">QRIS</option>
                    <option value="cash">Tunai (Cash)</option>
                    <option value="transfer">Transfer Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sky-200/80 mb-1 font-medium">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    onClick={(e) => {
                      try { (e.target as HTMLInputElement).showPicker(); } catch {}
                    }}
                    onFocus={(e) => {
                      try { (e.target as HTMLInputElement).showPicker(); } catch {}
                    }}
                    className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-sky-800/60">
                <input
                  type="checkbox"
                  id="isCapitalCheck"
                  checked={formData.isCapital}
                  onChange={(e) => setFormData({ ...formData, isCapital: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
                <label htmlFor="isCapitalCheck" className="text-xs text-slate-200 cursor-pointer">
                  Tandai sebagai <span className="font-bold text-cyan-300">Modal Awal / Aset</span> (Bukan pengeluaran operasional harian rutin)
                </label>
              </div>

              {/* STOCK AUTO-RESTOCK LINKING OPTION */}
              <div className="bg-sky-950/60 border border-sky-700/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="linkToStockCheck"
                    checked={formData.linkToStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        linkToStock: e.target.checked,
                        stockItemId: e.target.checked && stockItems.length > 0 ? stockItems[0].id : '',
                      })
                    }
                    className="w-4 h-4 accent-cyan-400"
                  />
                  <label htmlFor="linkToStockCheck" className="text-xs font-bold text-cyan-300 cursor-pointer">
                    🛒 Hubungkan dengan Stok Bahan Baku & Kemasan (Tambah Stok Otomatis)
                  </label>
                </div>

                {formData.linkToStock && (
                  <div className="space-y-3 pt-1 text-xs">
                    <p className="text-[11px] text-sky-200/80">
                      Pengeluaran ini akan langsung menambah sisa stok bahan jualan Anda di modul Manajemen Stok.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sky-200 mb-1 font-medium">Pilih Item Bahan Baku:</label>
                        <select
                          value={formData.stockItemId}
                          onChange={(e) => setFormData({ ...formData, stockItemId: e.target.value })}
                          className="w-full bg-slate-900 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-cyan-400"
                        >
                          {stockItems.map((stk) => (
                            <option key={stk.id} value={stk.id}>
                              {stk.name} (Stok: {stk.currentStock} {stk.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sky-200 mb-1 font-medium">Jumlah Ditambahkan:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            value={formData.addedStockQty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                addedStockQty: e.target.value === '' ? '' : parseFloat(e.target.value),
                              })
                            }
                            className="w-full bg-slate-900 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-cyan-400"
                          />
                          <span className="font-bold text-cyan-300 shrink-0">
                            {stockItems.find((s) => s.id === formData.stockItemId)?.unit || 'unit'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sky-200/80 mb-1 font-medium">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kwitansi atau detail toko..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-sky-800/60 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-sky-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-sky-800/60 text-sky-200/80 rounded-xl hover:bg-sky-950"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black rounded-xl shadow-md shadow-sky-400/20"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Wallet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Info,
  Calendar,
} from 'lucide-react';
import { Expense, FinancialSummary } from '../types';
import { formatRp, formatDateOnly } from '../utils/calculations';

interface InitialCapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  financialSummary: FinancialSummary;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const InitialCapitalModal: React.FC<InitialCapitalModalProps> = ({
  isOpen,
  onClose,
  expenses,
  financialSummary,
  onAddExpense,
  onDeleteExpense,
}) => {
  if (!isOpen) return null;

  // Filter capital expenses
  const capitalExpenses = expenses.filter((e) => e.isCapital || e.category === 'modal_awal');
  const totalCapitalDisetor = capitalExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qris'>('cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newExpense: Expense = {
      id: `exp-capital-${Date.now()}`,
      title: title.trim(),
      category: 'modal_awal',
      amount: Number(amount),
      isCapital: true,
      paymentMethod,
      notes: notes.trim(),
      date: new Date(date).toISOString(),
    };

    onAddExpense(newExpense);

    // Reset Form
    setTitle('');
    setAmount('');
    setNotes('');
  };

  // BEP Metrics
  const netProfit = financialSummary.netProfit;
  const isBepAchieved = netProfit >= totalCapitalDisetor && totalCapitalDisetor > 0;
  const bepProgress =
    totalCapitalDisetor > 0
      ? Math.min(100, Math.max(0, Math.round((netProfit / totalCapitalDisetor) * 100)))
      : 0;

  const remainingCapitalToCover = Math.max(0, totalCapitalDisetor - netProfit);
  const excessProfit = Math.max(0, netProfit - totalCapitalDisetor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                <span>Kelola Modal Awal Usaha (Mulai Dari 0)</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  BEP & ROI Tracker
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Input modal disetor untuk memantau apakah usaha sudah Balik Modal (BEP) atau Profit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BEP / Balik Modal Live Status Card */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-stone-200 uppercase tracking-wider">
                Status Analisis Balik Modal (BEP Usaha)
              </h3>
            </div>

            {totalCapitalDisetor === 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                ⚠️ Modal Awal Belum Diisi
              </span>
            ) : isBepAchieved ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SUDAH BALIK MODAL (BEP TERLEWATI 🎉)</span>
              </span>
            ) : netProfit < 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>RUGI OPERASIONAL</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/60 flex items-center gap-1.5">
                <span>⏳ BELUM BALIK MODAL ({bepProgress}%)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg space-y-0.5">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Total Modal Disetor</span>
              <div className="text-base font-black text-amber-400">{formatRp(totalCapitalDisetor)}</div>
              <p className="text-[10px] text-stone-500">Investasi awal rintis usaha</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg space-y-0.5">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Laba Bersih Usaha</span>
              <div
                className={`text-base font-black ${
                  netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatRp(netProfit)}
              </div>
              <p className="text-[10px] text-stone-500">Omset dikurangi HPP & Ops</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg space-y-0.5">
              <span className="text-[10px] text-stone-400 uppercase font-bold">
                {isBepAchieved ? 'Keuntungan Murni' : 'Sisa Modal Belum Kembali'}
              </span>
              <div
                className={`text-base font-black ${
                  isBepAchieved ? 'text-teal-300' : 'text-rose-300'
                }`}
              >
                {isBepAchieved ? formatRp(excessProfit) : formatRp(remainingCapitalToCover)}
              </div>
              <p className="text-[10px] text-stone-500">
                {isBepAchieved ? 'Profit bersih di atas modal' : 'Butuh laba lagi agar BEP'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {totalCapitalDisetor > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-stone-400">Progres Pengembalian Modal Awal:</span>
                <span className={isBepAchieved ? 'text-emerald-400' : 'text-amber-400'}>
                  {bepProgress}% {isBepAchieved ? '(Sudah Lunas BEP)' : ''}
                </span>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-2.5 overflow-hidden border border-stone-700">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isBepAchieved
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.max(3, bepProgress)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input Form for New Capital */}
        <form onSubmit={handleSubmit} className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Tambah Catatan Modal Awal Usaha Baru</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Keterangan Modal Awal <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Modal Usaha Booth & Kompor Kukus"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Nominal Modal Disetor (Rp) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-bold">Rp</span>
                <input
                  type="number"
                  placeholder="5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  required
                  min="1000"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">Tanggal Disetor</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">Sumber / Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="cash">Uang Tunai / Kas Usaha</option>
                <option value="transfer">Transfer Rekening / Tabungan</option>
                <option value="qris">QRIS / Saldo Digital</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-300 mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Misal: Modal pribadi dari tabungan untuk merintis gerobak"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={!title.trim() || !amount}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Modal Awal</span>
            </button>
          </div>
        </form>

        {/* Existing Capital List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
            <span>Daftar Modal Awal Disetor ({capitalExpenses.length})</span>
            <span className="text-amber-400 font-black">Total: {formatRp(totalCapitalDisetor)}</span>
          </h3>

          {capitalExpenses.length === 0 ? (
            <div className="p-4 bg-stone-950 border border-dashed border-stone-800 rounded-xl text-center space-y-1">
              <Info className="w-6 h-6 text-stone-500 mx-auto" />
              <p className="text-xs text-stone-400 font-medium">
                Belum ada catatan modal awal disetor. Tambahkan modal awal kamu di atas!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {capitalExpenses.map((cap) => (
                <div
                  key={cap.id}
                  className="bg-stone-950 border border-stone-800 hover:border-stone-700 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-200">{cap.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {cap.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        {formatDateOnly(cap.date)}
                      </span>
                      {cap.notes && <span>• {cap.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-amber-400">{formatRp(cap.amount)}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(cap.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                      title="Hapus Catatan Modal Awal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

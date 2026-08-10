import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { FinancialSummary, StockItem, MenuItem } from '../types';
import { formatRp } from '../utils/calculations';

interface AiBusinessAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  financialSummary: FinancialSummary;
  lowStockItems: StockItem[];
  menuItems: MenuItem[];
}

export const AiBusinessAdvisor: React.FC<AiBusinessAdvisorProps> = ({
  isOpen,
  onClose,
  financialSummary,
  lowStockItems,
  menuItems,
}) => {
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    '📈 Evaluasi Kesehatan Keuangan & Profit Margin Mood Kukus Mamuju saat ini.',
    '🍌 Berikan tips efisiensi jualan per item (Pisang Kukus, Ubi, Telur Rebus, Jagung Manis).',
    '🍯 Bagaimana strategi memaksimalkan penjualan Saus Cocolan & Paket Besek Combo Mamuju?',
    '🔮 Bahan baku & kemasan mana yang harus saya utamakan untuk direstock besok?',
  ];

  const handleFetchEvaluation = async (queryToUse?: string) => {
    const promptText = queryToUse || customQuery;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/evaluate-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialSummary,
          lowStockItems: lowStockItems.map((i) => ({
            name: i.name,
            currentStock: i.currentStock,
            minStock: i.minStock,
            unit: i.unit,
          })),
          topMenuItems: menuItems.slice(0, 5).map((m) => ({
            name: m.name,
            price: m.price,
          })),
          customQuery: promptText,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi server AI.');
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses evaluasi AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-800/60 rounded-2xl w-full max-w-2xl p-6 space-y-4 text-slate-100 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-sky-900/40 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-sky-400/20">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-1.5">
                KukusBot - Konsultan AI Kuliner
              </h3>
              <p className="text-xs text-sky-200/70">Analisis Keuangan Real-time & Strategi Bisnis Kukusan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-sky-200/60 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Badge Bar */}
        <div className="bg-slate-950 border border-sky-800/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div>
            <span className="text-sky-200/70">Pemasukan: </span>
            <span className="font-bold text-cyan-300">{formatRp(financialSummary.totalRevenue)}</span>
          </div>
          <div>
            <span className="text-sky-200/70">Laba Bersih: </span>
            <span className="font-bold text-emerald-400">{formatRp(financialSummary.netProfit)}</span>
          </div>
          <div>
            <span className="text-sky-200/70">Stok Menipis: </span>
            <span className="font-bold text-amber-300">{lowStockItems.length} Item</span>
          </div>
        </div>

        {/* Scrollable Response or Initial State */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
          {!response && !loading && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-sky-800/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                  <Lightbulb className="w-4 h-4 text-cyan-300" />
                  Pilih Pertanyaan Cepat Evaluasi Bisnis:
                </div>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCustomQuery(prompt);
                        handleFetchEvaluation(prompt);
                      }}
                      className="text-left text-xs bg-slate-900 hover:bg-sky-950 border border-sky-800/40 rounded-xl p-3 text-sky-100 transition-colors flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3 text-sky-200/70">
              <RefreshCw className="w-8 h-8 mx-auto text-cyan-300 animate-spin" />
              <p className="text-xs sm:text-sm font-semibold">
                KukusBot sedang menganalisis data keuangan, HPP bahan baku, dan strategi bisnis Anda...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
              ⚠️ {error}
            </div>
          )}

          {response && !loading && (
            <div className="bg-slate-950 border border-sky-800/60 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-sky-900/40 text-cyan-300 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-300" /> Hasil Evaluasi AI KukusBot
                </span>
                <button
                  onClick={() => handleFetchEvaluation()}
                  className="text-[11px] text-sky-200/60 hover:text-slate-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Analisis Ulang
                </button>
              </div>
              <div>{response}</div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 pt-2 border-t border-sky-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuery.trim()) handleFetchEvaluation();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan hal spesifik tentang stok atau strategi keuangan Anda..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-sky-800/60 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-sky-300/40 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !customQuery.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-sky-400/20 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-slate-950" />
              Tanya
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

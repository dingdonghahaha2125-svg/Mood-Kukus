import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Utensils,
  CheckCircle,
  Flame,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Trash2,
  Eye,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { FinancialSummary, StockItem, Transaction, Expense, MenuItem, SauceItem } from '../types';
import { formatRp, formatDate, calculatePerItemSales } from '../utils/calculations';

interface DashboardOverviewProps {
  financialSummary: FinancialSummary;
  lowStockItems: StockItem[];
  transactions: Transaction[];
  expenses: Expense[];
  menuItems: MenuItem[];
  sauces?: SauceItem[];
  stockItems?: StockItem[];
  onNavigateToTab: (tab: string) => void;
  onOpenRestockModal: (stockItem?: StockItem) => void;
  onOpenReceipt: (transaction: Transaction) => void;
  onOpenAiAdvisor: () => void;
  onOpenMenuEditor?: () => void;
  onOpenFinalizeModal?: () => void;
  onUpdateMenuItem?: (item: MenuItem) => void;
  onAddMenuItem?: (newItem: MenuItem) => void;
  onResetSalesToday?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  financialSummary,
  lowStockItems,
  transactions,
  expenses,
  menuItems,
  sauces = [],
  stockItems = [],
  onNavigateToTab,
  onOpenRestockModal,
  onOpenReceipt,
  onOpenAiAdvisor,
  onOpenMenuEditor,
  onOpenFinalizeModal,
  onUpdateMenuItem,
  onAddMenuItem,
  onResetSalesToday,
  onExportExcel,
  onExportPdf,
}) => {
  // State to filter per-item sales view (default: only show sold items today)
  const [itemFilter, setItemFilter] = React.useState<'sold_only' | 'all'>('sold_only');
  const [addSoldItemId, setAddSoldItemId] = React.useState<string>('');
  const [addSoldQty, setAddSoldQty] = React.useState<number>(1);

  // Calculate per-item sales metrics with unit profits
  const perItemSales = calculatePerItemSales(menuItems, transactions, sauces, stockItems);
  const displayedPerItemSales = itemFilter === 'sold_only' ? perItemSales.filter((i) => i.soldQty > 0) : perItemSales;

  // Today's Date String in Indonesian Full Format
  const todayDateFull = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalUnitsSold = menuItems.reduce((acc, item) => acc + (item.soldQty || 0), 0);

  // Prepare daily/transaction trend data
  const recentTransactions = [...transactions].reverse().slice(0, 5);

  // Group financial data by date
  const dateMap = new Map<string, { date: string; revenue: number; hpp: number; exp: number; profit: number }>();

  transactions.forEach((tr) => {
    const d = tr.date.split('T')[0];
    const prev = dateMap.get(d) || { date: d, revenue: 0, hpp: 0, exp: 0, profit: 0 };
    prev.revenue += tr.totalAmount;
    prev.hpp += tr.totalHpp;
    prev.profit += tr.netProfit;
    dateMap.set(d, prev);
  });

  expenses
    .filter((e) => !e.isCapital)
    .forEach((ex) => {
      const d = ex.date.split('T')[0];
      const prev = dateMap.get(d) || { date: d, revenue: 0, hpp: 0, exp: 0, profit: 0 };
      prev.exp += ex.amount;
      dateMap.set(d, prev);
    });

  const trendData = Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      netProfitReal: item.revenue - item.hpp - item.exp,
    }));

  // Group sales by Menu Item Name
  const menuSalesMap = new Map<string, { name: string; count: number; totalRev: number }>();
  transactions.forEach((tr) => {
    tr.items.forEach((it) => {
      const prev = menuSalesMap.get(it.menuName) || { name: it.menuName, count: 0, totalRev: 0 };
      prev.count += it.quantity;
      prev.totalRev += it.quantity * it.pricePerUnit;
      menuSalesMap.set(it.menuName, prev);
    });
  });
  const menuSalesData = Array.from(menuSalesMap.values()).sort((a, b) => b.count - a.count);

  // Group sales by Sauce
  const sauceSalesMap = new Map<string, number>();
  transactions.forEach((tr) => {
    tr.items.forEach((it) => {
      if (it.sauceName) {
        sauceSalesMap.set(it.sauceName, (sauceSalesMap.get(it.sauceName) || 0) + it.quantity);
      }
    });
  });
  const sauceSalesData = Array.from(sauceSalesMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick AI Trigger */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 border border-stone-700/70 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Monitoring Stok Per Item & Keuangan Real-time
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
            Selamat Datang di <span className="text-emerald-400">Mood Kukus Mamuju</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
            Sistem pencatatan khusus per-item bahan jualan kukusan (Pisang Kukus Kepok, Ubi Cilembu, Telur Rebus, Jagung Manis), batch olahan harian, dan analisis Laku Terjual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onNavigateToTab('pos')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Kasir POS
          </button>
          
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs rounded-xl transition-all"
              title="Download Laporan Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel</span>
            </button>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition-all"
              title="Download Laporan PDF (.pdf)"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>PDF</span>
            </button>
          )}

          <button
            onClick={onOpenAiAdvisor}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-teal-300 border border-teal-500/40 font-medium text-xs sm:text-sm rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            AI Advisor
          </button>
        </div>
      </div>

      {/* DEDICATED DAILY REPORT CARD WITH FULL DATE & QUICK EDIT */}
      <div className="bg-stone-900 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Laporan Penjualan Harian</span>
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full">
                📅 Tanggal: {todayDateFull}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2 pt-1">
              <span>Ringkasan Real-Time Laporan Hari Ini</span>
            </h2>
            <p className="text-xs text-stone-300">
              {totalUnitsSold === 0 ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ Status: Hari ini belum ada yang terjual (0 unit). Silakan masukkan data stok & jumlah laku terjual di bawah.
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  ✅ Status: Terjual {totalUnitsSold} unit barang hari ini | Total Uang Masuk: {formatRp(financialSummary.totalRevenue)} | Untung Bersih: {formatRp(financialSummary.netProfit)}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenFinalizeModal && (
              <button
                onClick={onOpenFinalizeModal}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>🏁 Finalisasi Penjualan Hari Ini</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab('daily_history')}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>📅 Histori Laporan Per Hari</span>
            </button>

            {onResetSalesToday && (
              <button
                onClick={onResetSalesToday}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-800/80 text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                title="Reset/Kosongkan seluruh data penjualan hari ini menjadi 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset (0)</span>
              </button>
            )}

            {onOpenMenuEditor && (
              <button
                onClick={onOpenMenuEditor}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>✏️ Atur Harga & Menu</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Input Bar for Today's Sales per Item */}
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Pencatatan Item Laku Terjual Hari Ini</span>
            </h4>
            <span className="text-[11px] text-stone-400">
              Pilih item yang terjual di bawah ini untuk dimasukkan ke laporan harian
            </span>
          </div>

          {/* Manual Add Form */}
          <div className="bg-stone-900 border border-amber-500/30 p-3.5 rounded-xl space-y-2">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Tambah Item Yang Terjual Hari Ini (Pilih Dari Stok & Menu):</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={addSoldItemId}
                onChange={(e) => setAddSoldItemId(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Pilih Item / Bahan Stok Terjual --</option>
                
                {/* Sellable Main Items Group */}
                <optgroup label="🍌 Produk & Bahan Terjual (Dari Stok Input)">
                  {stockItems
                    .filter((stk) => stk.category !== 'bahan_saus' && stk.category !== 'kemasan')
                    .map((stk) => {
                      // Strict matching: Match by ingredient stockItemId or exact name match (no loose substring .includes())
                      const linkedMenu = menuItems.find(
                        (m) =>
                          m.category !== 'kemasan' &&
                          m.category !== 'paket' &&
                          !m.name.toLowerCase().includes('paket') &&
                          !m.name.toLowerCase().includes('combo') &&
                          (m.ingredients.some((ing) => ing.stockItemId === stk.id) ||
                            m.name.trim().toLowerCase() === stk.name.trim().toLowerCase())
                      );
                      const optVal = linkedMenu ? `menu::${linkedMenu.id}` : `stock::${stk.id}`;
                      const unitDisplay = (linkedMenu && linkedMenu.unitName)
                        ? linkedMenu.unitName
                        : stk.unit === 'kg'
                        ? 'porsi'
                        : stk.unit || 'pcs';

                      const sellPrice = linkedMenu
                        ? linkedMenu.price
                        : Math.max(Math.ceil((stk.unitCostPrice * 1.5) / 500) * 500, 3000);

                      const soldCount = linkedMenu ? (linkedMenu.soldQty || 0) : 0;
                      const preparedCount = linkedMenu ? (linkedMenu.preparedQty || Math.max(soldCount + 10, 30)) : stk.currentStock;
                      const remainingCount = Math.max(0, preparedCount - soldCount);

                      const label = `${stk.name} — Rp ${formatRp(sellPrice)} / ${unitDisplay} [Stok Siap: ${preparedCount} | Terjual: ${soldCount} | Sisa: ${remainingCount} ${unitDisplay}]`;

                      return (
                        <option key={stk.id} value={optVal}>
                          {label}
                        </option>
                      );
                    })}
                </optgroup>
              </select>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-stone-950 p-1.5 rounded-xl border border-stone-700">
                  <span className="text-[11px] text-stone-400 pl-1 font-semibold">Jumlah:</span>
                  <input
                    type="number"
                    min="1"
                    value={addSoldQty || 1}
                    onChange={(e) => setAddSoldQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 bg-stone-900 text-center text-xs font-black text-amber-300 py-1 rounded focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!addSoldItemId) return;

                    if (addSoldItemId.startsWith('menu::')) {
                      const targetId = addSoldItemId.replace('menu::', '');
                      const target = menuItems.find((m) => m.id === targetId);
                      if (target && onUpdateMenuItem) {
                        onUpdateMenuItem({
                          ...target,
                          soldQty: (target.soldQty || 0) + (addSoldQty || 1),
                        });
                      }
                    } else if (addSoldItemId.startsWith('stock::')) {
                      const stockId = addSoldItemId.replace('stock::', '');
                      const stk = stockItems.find((s) => s.id === stockId);
                      if (stk) {
                        const existingMenu = menuItems.find(
                          (m) =>
                            m.ingredients.some((i) => i.stockItemId === stk.id) ||
                            m.name.trim().toLowerCase() === stk.name.trim().toLowerCase()
                        );
                        if (existingMenu && onUpdateMenuItem) {
                          onUpdateMenuItem({
                            ...existingMenu,
                            soldQty: (existingMenu.soldQty || 0) + (addSoldQty || 1),
                          });
                        } else {
                          const estimatedSellPrice = Math.max(Math.ceil((stk.unitCostPrice * 1.5) / 500) * 500, 3000);
                          const newMenu: MenuItem = {
                            id: `menu-${Date.now()}`,
                            name: stk.name,
                            category:
                              stk.category === 'operasional' || stk.category === 'minuman'
                                ? 'minuman'
                                : stk.category === 'kemasan'
                                ? 'kemasan'
                                : 'satuan',
                            price: estimatedSellPrice,
                            description: `Produk jualan ${stk.name}`,
                            preparedQty: stk.currentStock,
                            soldQty: addSoldQty || 1,
                            isAvailable: true,
                            unitName: stk.unit === 'kg' ? 'porsi' : stk.unit,
                            ingredients: [{ stockItemId: stk.id, amount: 1 }],
                          };
                          if (onAddMenuItem) {
                            onAddMenuItem(newMenu);
                          } else if (onUpdateMenuItem) {
                            onUpdateMenuItem(newMenu);
                          }
                        }
                      }
                    } else {
                      const target = menuItems.find((m) => m.id === addSoldItemId);
                      if (target && onUpdateMenuItem) {
                        onUpdateMenuItem({
                          ...target,
                          soldQty: (target.soldQty || 0) + (addSoldQty || 1),
                        });
                      }
                    }

                    setAddSoldItemId('');
                    setAddSoldQty(1);
                  }}
                  disabled={!addSoldItemId}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Laku</span>
                </button>
              </div>
            </div>

            {/* Live Preview of Stock Difference / Reduction when item is selected */}
            {(() => {
              if (!addSoldItemId) return null;
              let selectedName = '';
              let prepared = 0;
              let currentSold = 0;
              let unitStr = 'pcs';
              let linkedStockItem: StockItem | undefined;

              if (addSoldItemId.startsWith('menu::')) {
                const targetId = addSoldItemId.replace('menu::', '');
                const m = menuItems.find((item) => item.id === targetId);
                if (m) {
                  selectedName = m.name;
                  currentSold = m.soldQty || 0;
                  prepared = m.preparedQty || Math.max(currentSold + 10, 30);
                  unitStr = m.unitName || 'pcs';
                  if (m.ingredients && m.ingredients.length > 0) {
                    linkedStockItem = stockItems.find((s) => s.id === m.ingredients[0].stockItemId);
                  }
                }
              } else if (addSoldItemId.startsWith('stock::')) {
                const stockId = addSoldItemId.replace('stock::', '');
                const s = stockItems.find((item) => item.id === stockId);
                if (s) {
                  selectedName = s.name;
                  prepared = s.currentStock;
                  currentSold = 0;
                  unitStr = s.unit === 'kg' ? 'porsi' : s.unit || 'pcs';
                  linkedStockItem = s;
                }
              }

              if (!selectedName) return null;

              const additionalQty = addSoldQty || 1;
              const newTotalSold = currentSold + additionalQty;
              const currentRemaining = Math.max(0, prepared - currentSold);
              const estNewRemaining = Math.max(0, prepared - newTotalSold);

              return (
                <div className="bg-stone-950/90 border border-amber-500/30 rounded-xl p-3 text-xs space-y-1.5 mt-2">
                  <div className="flex items-center justify-between font-bold text-amber-300 border-b border-stone-800 pb-1">
                    <span>📊 Informasi Selisih Stok untuk "{selectedName}":</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      Penambahan: +{additionalQty} {unitStr}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Stok Siap / Awal:</span>
                      <span className="font-bold text-stone-200">{prepared} {unitStr}</span>
                    </div>
                    <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Terjual Hari Ini:</span>
                      <span className="font-bold text-amber-400">
                        {currentSold} ➔ <span className="text-emerald-400 font-extrabold">{newTotalSold} {unitStr}</span>
                      </span>
                    </div>
                    <div className="bg-stone-900 p-2 rounded-lg border border-amber-900/50">
                      <span className="text-[10px] text-rose-300 block font-semibold">Selisih Pengurangan:</span>
                      <span className="font-extrabold text-rose-400">-{newTotalSold} {unitStr}</span>
                    </div>
                    <div className="bg-stone-900 p-2 rounded-lg border border-teal-800/80">
                      <span className="text-[10px] text-teal-300 block font-semibold">Sisa Stok Setelah Terjual:</span>
                      <span className="font-black text-teal-400 text-sm">
                        {estNewRemaining} {unitStr}
                      </span>
                    </div>
                  </div>
                  {linkedStockItem && (
                    <div className="text-[11px] text-stone-400 pt-1 flex items-center gap-1.5">
                      <span>🌾 <strong className="text-stone-300">Stok Bahan Baku ({linkedStockItem.name}):</strong> Sisa {linkedStockItem.currentStock} {linkedStockItem.unit}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* List of items that have soldQty > 0 */}
          {(() => {
            const soldItemsToday = menuItems.filter((item) => {
              if ((item.soldQty || 0) <= 0) return false;
              if (item.category === 'kemasan') return false;
              if (item.ingredients && item.ingredients.length > 0) {
                const hasValidStock = item.ingredients.some((ing) =>
                  stockItems.some((s) => s.id === ing.stockItemId)
                );
                if (!hasValidStock) return false;
              }
              return true;
            });

            if (soldItemsToday.length === 0) {
              return (
                <div className="bg-stone-900/60 border border-dashed border-stone-800 rounded-xl p-5 text-center space-y-1">
                  <p className="text-xs text-stone-300 font-medium">
                    Belum ada item terjual yang dicantumkan hari ini.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Pilih menu jualan pada form di atas lalu klik <span className="text-amber-400 font-bold">Catat Laku</span> untuk memasukkannya secara manual.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {soldItemsToday.map((item) => {
                  const soldQty = item.soldQty || 0;
                  const preparedQty = item.preparedQty || Math.max(soldQty + 10, 30);
                  const remainingQty = Math.max(0, preparedQty - soldQty);
                  const unitNameStr = item.unitName || 'pcs';

                  return (
                    <div
                      key={item.id}
                      className="bg-stone-900/90 border border-emerald-800/80 hover:border-emerald-600 rounded-xl p-3 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-stone-100 truncate">{item.name}</div>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            Harga: <span className="text-emerald-400 font-bold">{formatRp(item.price)}</span> / {unitNameStr}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 bg-stone-950 p-1 rounded-lg border border-stone-800">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMenuItem && (item.soldQty || 0) > 0) {
                                onUpdateMenuItem({ ...item, soldQty: item.soldQty - 1 });
                              }
                            }}
                            disabled={(item.soldQty || 0) <= 0}
                            className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-200 font-bold text-xs flex items-center justify-center border border-stone-700 transition-colors"
                            title="Kurangi 1 unit"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.soldQty || 0}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              if (onUpdateMenuItem) {
                                onUpdateMenuItem({ ...item, soldQty: val });
                              }
                            }}
                            className="w-12 h-6 bg-transparent text-center text-xs font-black text-amber-300 focus:outline-none focus:bg-stone-900 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMenuItem) {
                                onUpdateMenuItem({ ...item, soldQty: (item.soldQty || 0) + 1 });
                              }
                            }}
                            className="w-6 h-6 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-700 transition-colors"
                            title="Tambah 1 unit"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateMenuItem) {
                                onUpdateMenuItem({ ...item, soldQty: 0 });
                              }
                            }}
                            className="w-6 h-6 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-800 transition-colors ml-0.5"
                            title="Hapus item dari laporan terjual hari ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detailed Stock Difference Panel */}
                      <div className="bg-stone-950 p-2 rounded-lg border border-stone-800/90 grid grid-cols-3 gap-1 text-[11px]">
                        <div>
                          <span className="text-[9px] text-stone-500 uppercase tracking-tight block">Stok Siap:</span>
                          <span className="font-semibold text-stone-300">{preparedQty} {unitNameStr}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-rose-400 uppercase tracking-tight block font-bold">Selisih:</span>
                          <span className="font-extrabold text-rose-400">-{soldQty} {unitNameStr}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-teal-400 uppercase tracking-tight block font-bold">Sisa Stok:</span>
                          <span className="font-black text-teal-300">{remainingQty} {unitNameStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Low Stock Warning Banner (If Any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-300">
                Peringatan Restock! ({lowStockItems.length} Bahan Baku Menipis)
              </h4>
              <p className="text-xs text-amber-200/80">
                {lowStockItems.map((i) => `${i.name} (Sisa ${i.currentStock} ${i.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('stock')}
            className="w-full sm:w-auto text-xs font-semibold px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Restock Sekarang
          </button>
        </div>
      )}

      {/* KPI Cards Grid - Everyday Language */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Uang Masuk */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">🟢 Total Uang Masuk</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-100">{formatRp(financialSummary.totalRevenue)}</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Dari {transactions.length} kali transaksi jualan
            </p>
          </div>
        </div>

        {/* Untung Bersih */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">💰 Untung Bersih (Sisa Uang)</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}
            >
              {formatRp(financialSummary.netProfit)}
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Sudah dipotong belanja bahan & operasional
            </p>
          </div>
        </div>

        {/* Total Belanja */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">🔴 Total Uang Keluar</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-100">{formatRp(financialSummary.totalExpenses)}</div>
            <p className="text-xs text-stone-400 mt-1">Uang belanja pisang, ubi, gas, & kemasan</p>
          </div>
        </div>

        {/* Modal Peralatan */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">🛠️ Modal Peralatan & Booth</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-100">{formatRp(financialSummary.totalCapital)}</div>
            <p className="text-xs text-stone-400 mt-1">Panci kukusan, spanduk, & perlengkapan</p>
          </div>
        </div>
      </div>

      {/* DEDICATED SECTION: Per-Item Sales & Daily Prepared Stock Monitoring */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-bold text-stone-100 text-base sm:text-lg">
                Keuntungan & Penjualan Laku Terjual (Per Item Unit)
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              Lihat langsung keuntungan bersih per unit + jumlah laku terjual
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Filter Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setItemFilter('sold_only')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  itemFilter === 'sold_only'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Tampilkan hanya item yang sudah laku terjual hari ini"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Terjual ({perItemSales.filter((i) => i.soldQty > 0).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setItemFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  itemFilter === 'all'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Tampilkan seluruh katalog menu produk"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Semua ({perItemSales.length})</span>
              </button>
            </div>

            {onResetSalesToday && (
              <button
                onClick={onResetSalesToday}
                className="text-xs bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                title="Hapus / Reset seluruh data item terjual menjadi 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Semua</span>
              </button>
            )}

            {onOpenMenuEditor && (
              <button
                onClick={onOpenMenuEditor}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>✏️ Edit Harga</span>
              </button>
            )}
          </div>
        </div>

        {/* Per Item Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedPerItemSales.length === 0 ? (
            <div className="col-span-full bg-stone-950/80 border border-dashed border-stone-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 text-sm">Belum Ada Item Terjual Hari Ini</h4>
                <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                  Tampilan awal laporan per item ini masih kosong. Ketika Anda menginput item yang terjual hari ini pada form di atas atau transaksi kasir, laporannya akan muncul otomatis di sini tanpa mengubah format.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setItemFilter('all')}
                  className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-3.5 py-2 rounded-xl border border-stone-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tampilkan Semua Katalog Menu ({perItemSales.length} Menu)</span>
                </button>
              </div>
            </div>
          ) : (
            displayedPerItemSales.map((item) => {
              const isHighSeller = item.sellRatePct >= 70;
              const isSoldOut = item.remainingQty === 0;

              const getCategoryLabel = () => {
                if (item.category === 'satuan') return '🍌 Satuan';
                if (item.category === 'paket') return '📦 Paket';
                if (item.category === 'minuman') return '🥤 Air Mineral';
                return '🍱 Packing';
              };

              return (
                <div
                  key={item.menuItemId}
                  className="bg-stone-800/60 border border-stone-700/70 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-700 text-stone-300">
                        {getCategoryLabel()}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-400">{formatRp(item.pricePerUnit)}/{item.unitName}</span>
                        
                        {/* Hapus / Remove button on card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const target = menuItems.find((m) => m.id === item.menuItemId);
                            if (target && onUpdateMenuItem) {
                              if (confirm(`Hapus "${item.itemName}" dari laporan terjual (set ke 0)?`)) {
                                onUpdateMenuItem({ ...target, soldQty: 0 });
                              }
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-rose-400 hover:bg-rose-950/80 border border-transparent hover:border-rose-800/80 rounded-lg transition-colors"
                          title="Hapus item ini dari laporan terjual (Set 0)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-stone-100 leading-snug line-clamp-1">{item.itemName}</h4>

                    {/* Per Unit Profit Badge */}
                    <div className="bg-stone-900/90 border border-stone-700/80 rounded-lg p-2 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-stone-400">Untung / {item.unitName}:</span>
                      <span className="font-black text-emerald-400 text-xs">
                        +{formatRp(item.unitProfit)} ({item.profitMarginPct}%)
                      </span>
                    </div>

                    {/* Progress Bar for Sell Rate with +/- and Reset controls */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[11px] gap-1">
                        <span className="text-stone-400 font-medium">Laku Terjual:</span>
                        
                        <div className="flex items-center gap-1 font-bold text-amber-400">
                          {/* Decrement button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const target = menuItems.find((m) => m.id === item.menuItemId);
                              if (target && onUpdateMenuItem) {
                                onUpdateMenuItem({ ...target, soldQty: Math.max(0, target.soldQty - 1) });
                              }
                            }}
                            disabled={item.soldQty <= 0}
                            className="w-5 h-5 rounded bg-stone-700 hover:bg-stone-600 disabled:opacity-20 text-stone-200 font-bold text-xs flex items-center justify-center transition-colors"
                            title="Kurangi 1 item terjual"
                          >
                            -
                          </button>

                          <span className="px-0.5 text-[11px]">
                            {item.soldQty} dari {item.preparedQty} {item.unitName} ({item.sellRatePct}%)
                          </span>

                          {/* Increment button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const target = menuItems.find((m) => m.id === item.menuItemId);
                              if (target && onUpdateMenuItem) {
                                onUpdateMenuItem({ ...target, soldQty: target.soldQty + 1 });
                              }
                            }}
                            className="w-5 h-5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-bold text-xs flex items-center justify-center transition-colors"
                            title="Tambah 1 item terjual"
                          >
                            +
                          </button>

                          {/* Reset button */}
                          {item.soldQty > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const target = menuItems.find((m) => m.id === item.menuItemId);
                                if (target && onUpdateMenuItem) {
                                  onUpdateMenuItem({ ...target, soldQty: 0 });
                                }
                              }}
                              className="ml-1 p-0.5 text-stone-400 hover:text-rose-400 transition-colors"
                              title="Hapus / Reset jumlah terjual item ini menjadi 0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSoldOut
                              ? 'bg-rose-500'
                              : isHighSeller
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, isNaN(item.sellRatePct) ? 0 : item.sellRatePct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Sisa Stok Siap:</span>
                      <span
                        className={`font-bold ${
                          isSoldOut ? 'text-rose-400' : 'text-teal-300'
                        }`}
                      >
                        {item.remainingQty} {item.unitName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Total Untung Item:</span>
                      <span className="font-extrabold text-emerald-400">{formatRp(item.totalProfit)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Trend Pemasukan vs Pengeluaran */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Tren Keuangan & Laba Bersih
              </h3>
              <p className="text-xs text-stone-400">Perbandingan pemasukan, HPP modal bahan, dan laba bersih</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-800 text-stone-300 rounded-lg border border-stone-700">
              Harian / Transaksi
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="formattedDate" stroke="#78716c" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#78716c"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `Rp${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderColor: '#44403c',
                    borderRadius: '12px',
                    color: '#f5f5f4',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatRp(Number(value)), '']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Pemasukan (Revenue)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="netProfitReal"
                  name="Laba Bersih"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart: Popular Dipping Sauces */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-400" />
              Saus Cocolan Terfavorit
            </h3>
            <p className="text-xs text-stone-400">Porsi saus pilihan pelanggan</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {sauceSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sauceSalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sauceSalesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#44403c',
                      borderRadius: '12px',
                      color: '#f5f5f4',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', color: '#a8a29e' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-stone-500">Belum ada data saus terisolasi.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Top Sold Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Transaksi Penjualan Terakhir
            </h3>
            <button
              onClick={() => onNavigateToTab('pos')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Kasir Baru &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tr) => (
              <div
                key={tr.id}
                onClick={() => onOpenReceipt(tr)}
                className="bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 rounded-xl p-3.5 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-200">
                      {tr.customerName || 'Pelanggan Walk-in'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-stone-700 text-stone-300">
                      {tr.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    {tr.items.map((i) => `${i.quantity}x ${i.menuName}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(tr.date)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-emerald-400">{formatRp(tr.totalAmount)}</div>
                  <div className="text-[10px] text-teal-400 font-medium">
                    Laba: +{formatRp(tr.netProfit)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Menu Items */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-100 text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Peringkat Penjualan Menu Kukusan
            </h3>
            <button
              onClick={() => onNavigateToTab('hpp')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Cek HPP Menu &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {menuSalesData.map((menu, idx) => (
              <div
                key={menu.name}
                className="bg-stone-800/60 border border-stone-700/50 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500 text-stone-950'
                        : idx === 1
                        ? 'bg-stone-300 text-stone-950'
                        : 'bg-stone-700 text-stone-300'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-200">{menu.name}</h4>
                    <p className="text-[11px] text-stone-400">{menu.count} porsi terkurang dari stok</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-stone-100">{formatRp(menu.totalRev)}</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Terjual Populer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  onExportExcel,
  onExportPdf,
}) => {
  // Calculate per-item sales metrics with unit profits
  const perItemSales = calculatePerItemSales(menuItems, transactions, sauces, stockItems);

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
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-bold text-stone-100 text-base sm:text-lg">
                Keuntungan & Penjualan Laku Terjual (Per Item Unit)
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Lihat langsung keuntungan bersih per unit/biji/botol + jumlah laku terjual
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onOpenMenuEditor && (
              <button
                onClick={onOpenMenuEditor}
                className="text-xs bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>✏️ Edit Harga Jual</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab('stock')}
              className="text-xs bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Stok & Batch</span>
            </button>
          </div>
        </div>

        {/* Per Item Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {perItemSales.map((item) => {
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
                className="bg-stone-800/60 border border-stone-700/70 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-700 text-stone-300">
                      {getCategoryLabel()}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{formatRp(item.pricePerUnit)}/{item.unitName}</span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-100 leading-snug line-clamp-1">{item.itemName}</h4>

                  {/* Per Unit Profit Badge */}
                  <div className="bg-stone-900/90 border border-stone-700/80 rounded-lg p-2 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-stone-400">Untung / {item.unitName}:</span>
                    <span className="font-black text-emerald-400 text-xs">
                      +{formatRp(item.unitProfit)} ({item.profitMarginPct}%)
                    </span>
                  </div>

                  {/* Progress Bar for Sell Rate */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-400">Laku Terjual:</span>
                      <span className="font-bold text-amber-400">
                        {item.soldQty} dari {item.preparedQty} {item.unitName} ({item.sellRatePct}%)
                      </span>
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
                        style={{ width: `${Math.min(100, item.sellRatePct)}%` }}
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
          })}
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

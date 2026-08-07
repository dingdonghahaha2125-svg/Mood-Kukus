import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Calendar,
  Receipt,
  Calculator,
  Bot,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { FinancialSummary, StockItem } from '../types';
import { formatRp } from '../utils/calculations';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  financialSummary: FinancialSummary;
  lowStockItems: StockItem[];
  onOpenAiAdvisor: () => void;
  onResetDemoData: () => void;
  onOpenMenuEditor?: () => void;
  onOpenDeviceSync?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  financialSummary,
  lowStockItems,
  onOpenAiAdvisor,
  onResetDemoData,
  onOpenMenuEditor,
  onOpenDeviceSync,
  onExportExcel,
  onExportPdf,
}) => {
  const navItems = [
    { id: 'dashboard', label: '🏠 Ringkasan Usaha', icon: LayoutDashboard },
    { id: 'daily_history', label: '📅 Laporan Per Hari', icon: Calendar },
    {
      id: 'stock',
      label: '🍌 Stok & Bahan Kukusan',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? lowStockItems.length : undefined,
    },
    { id: 'expenses', label: '💸 Catat Belanja & Pengeluaran', icon: Receipt },
    { id: 'hpp', label: '🧮 Hitung Harga Jual', icon: Calculator },
    { id: 'flyer', label: '🎨 Buat Flyer Promosi', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="cursor-pointer py-1" onClick={() => setActiveTab('dashboard')}>
            <BrandLogo size="md" />
          </div>

          {/* Quick Metrics Bar (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 bg-stone-800/60 border border-stone-700/60 rounded-xl px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Pemasukan:</span>
              <span className="font-semibold text-emerald-400">{formatRp(financialSummary.totalRevenue)}</span>
            </div>
            <div className="w-px h-4 bg-stone-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Laba Bersih:</span>
              <span className={`font-semibold ${financialSummary.netProfit >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
                {formatRp(financialSummary.netProfit)}
              </span>
            </div>
            <div className="w-px h-4 bg-stone-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Margin:</span>
              <span className="font-semibold text-amber-400">{financialSummary.profitMargin}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Device Sync Button */}
            {onOpenDeviceSync && (
              <button
                onClick={onOpenDeviceSync}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-xs transition-all shadow-sm"
                title="Sinkronisasikan Data Antara Laptop & Handphone"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Sync HP</span>
              </button>
            )}

            {/* Edit Menu Price Quick Button */}
            {onOpenMenuEditor && (
              <button
                onClick={onOpenMenuEditor}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs transition-all shadow-sm"
                title="Edit Harga Jual Menu & Ketahui Keuntungan Per Unit"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Atur Harga Jual</span>
              </button>
            )}

            {/* Export Buttons */}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-emerald-400 rounded-xl font-semibold text-xs transition-all"
                title="Export Laporan ke Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel</span>
              </button>
            )}

            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-rose-400 rounded-xl font-semibold text-xs transition-all"
                title="Export Laporan ke PDF (.pdf)"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>PDF</span>
              </button>
            )}

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
              title="Konsultasikan Keuangan & Stok dengan AI"
            >
              <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">Tanya KukusBot AI</span>
              <span className="sm:hidden">AI Advisor</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemoData}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
              title="Reset ke Data Sample Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-stone-800/80 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-full flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

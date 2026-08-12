import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Calendar,
  Receipt,
  AlertTriangle,
  Bot,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Download,
  Upload,
  ShieldCheck,
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
  onResetDemoData?: () => void;
  onOpenMenuEditor?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  financialSummary,
  lowStockItems,
  onOpenAiAdvisor,
  onOpenMenuEditor,
  onExportExcel,
  onExportPdf,
  onBackupData,
  onRestoreData,
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
  ];

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="cursor-pointer py-1" onClick={() => setActiveTab('dashboard')}>
            <BrandLogo size="md" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Backup Data Button */}
            {onBackupData && (
              <button
                onClick={onBackupData}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-amber-950/80 text-amber-300 border border-amber-600/50 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Unduh Cadangan File JSON Seluruh Data Aplikasi"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Backup Data</span>
              </button>
            )}

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
              title="Konsultasikan Keuangan & Stok dengan AI"
            >
              <Bot className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">Tanya KukusBot AI</span>
              <span className="sm:hidden">AI Advisor</span>
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

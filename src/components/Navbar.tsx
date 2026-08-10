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
  isCloudConnected?: boolean;
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
  isCloudConnected = true,
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
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-sky-800/40 text-slate-100 shadow-lg shadow-sky-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="cursor-pointer py-1" onClick={() => setActiveTab('dashboard')}>
            <BrandLogo size="md" />
          </div>

          {/* Cloud Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 bg-sky-950/80 border border-sky-700/60 rounded-xl px-3 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300" title="Database Firestore Terhubung Real-Time">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span>Firebase Cloud Active</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-sky-400/20 transition-all active:scale-95"
              title="Konsultasikan Keuangan & Stok dengan AI"
            >
              <Bot className="w-4 h-4 text-slate-950 animate-bounce" />
              <span className="hidden sm:inline">Tanya KukusBot AI</span>
              <span className="sm:hidden">AI Advisor</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-t border-sky-900/40 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-sky-500/20 scale-[1.02]'
                    : 'text-sky-200/80 hover:text-cyan-200 hover:bg-sky-950/70 hover:scale-[1.01]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-300'}`} />
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

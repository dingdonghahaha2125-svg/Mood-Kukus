import React, { useState, useEffect } from 'react';
import {
  INITIAL_STOCK_ITEMS,
  INITIAL_MENU_ITEMS,
  INITIAL_SAUCES,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_DAILY_REPORTS,
} from './data/initialData';
import { StockItem, MenuItem, SauceItem, Expense, Transaction, DailyReport } from './types';
import { calculateFinancialSummary } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StockManagement } from './components/StockManagement';
import { DailyHistory } from './components/DailyHistory';
import { ExpenseTracker } from './components/ExpenseTracker';
import { HppCalculator } from './components/HppCalculator';
import { FlyerGenerator } from './components/FlyerGenerator';
import { AiBusinessAdvisor } from './components/AiBusinessAdvisor';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { MenuPriceEditorModal } from './components/MenuPriceEditorModal';
import { FinalizeDayModal } from './components/FinalizeDayModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { exportToExcel, exportToPdf } from './utils/exportUtils';

export default function App() {
  // Helper to fix Singkos typo -> Singkong
  const fixSingkos = (str: string) => str ? str.replace(/singkos/gi, 'Singkong') : str;

  // Load state from LocalStorage with fallback to initialData
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_stock_items');
    const items: StockItem[] = saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
    return items
      .filter((s) => s.id !== 'stk-3' && !s.name.toLowerCase().includes('jagung'))
      .map((s) => ({ ...s, name: fixSingkos(s.name) }));
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_menu_items');
    const items: MenuItem[] = saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    return items
      .filter((m) => m.id !== 'menu-item-jagung' && !m.name.toLowerCase().includes('jagung'))
      .map((m) => ({ ...m, name: fixSingkos(m.name) }));
  });

  const [sauces, setSauces] = useState<SauceItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_sauces');
    return saved ? JSON.parse(saved) : INITIAL_SAUCES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('kukuslokal_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kukuslokal_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [dailyReports, setDailyReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('kukuslokal_daily_reports');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_REPORTS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState<boolean>(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState<boolean>(false);
  const [isDeviceSyncOpen, setIsDeviceSyncOpen] = useState<boolean>(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Auto-sync via URL parameter (e.g. from QR scan)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const syncData = urlParams.get('syncData');
    if (syncData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(syncData)));
        if (decoded && typeof decoded === 'object') {
          if (decoded.stockItems) setStockItems(decoded.stockItems);
          if (decoded.menuItems) setMenuItems(decoded.menuItems);
          if (decoded.sauces) setSauces(decoded.sauces);
          if (decoded.expenses) setExpenses(decoded.expenses);
          if (decoded.transactions) setTransactions(decoded.transactions);
          if (decoded.dailyReports) setDailyReports(decoded.dailyReports);
          alert('📱 Data berhasil disinkronkan dari Laptop/HP!');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Failed auto sync from URL', err);
      }
    }
  }, []);

  // Multi-tab / Broadcast sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === 'kukuslokal_stock_items' && e.newValue) setStockItems(JSON.parse(e.newValue));
      if (e.key === 'kukuslokal_menu_items' && e.newValue) setMenuItems(JSON.parse(e.newValue));
      if (e.key === 'kukuslokal_sauces' && e.newValue) setSauces(JSON.parse(e.newValue));
      if (e.key === 'kukuslokal_expenses' && e.newValue) setExpenses(JSON.parse(e.newValue));
      if (e.key === 'kukuslokal_transactions' && e.newValue) setTransactions(JSON.parse(e.newValue));
      if (e.key === 'kukuslokal_daily_reports' && e.newValue) setDailyReports(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('kukuslokal_stock_items', JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem('kukuslokal_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('kukuslokal_sauces', JSON.stringify(sauces));
  }, [sauces]);

  useEffect(() => {
    localStorage.setItem('kukuslokal_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('kukuslokal_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kukuslokal_daily_reports', JSON.stringify(dailyReports));
  }, [dailyReports]);

  // Auto-sanitize menu items against current stock items (removes items not matching stock input or paket/combo/jagung)
  useEffect(() => {
    const validStockIds = new Set(stockItems.map((s) => s.id));
    setMenuItems((prevMenu) => {
      const sanitized = prevMenu.filter((m) => {
        if (m.category === 'kemasan' || m.category === 'paket') return false;
        const nameLower = m.name.toLowerCase();
        if (nameLower.includes('paket') || nameLower.includes('combo') || nameLower.includes('jagung')) return false;
        if (m.ingredients && m.ingredients.length > 0) {
          return m.ingredients.some((ing) => validStockIds.has(ing.stockItemId));
        }
        return true;
      });
      if (sanitized.length !== prevMenu.length) {
        return sanitized;
      }
      return prevMenu;
    });
  }, [stockItems]);

  // Derived financial calculation
  const financialSummary = calculateFinancialSummary(transactions, expenses, menuItems, sauces, stockItems);
  const lowStockItems = stockItems.filter((i) => i.currentStock <= i.minStock);

  // HANDLERS FOR DAILY REPORT FINALIZATION
  const handleFinalizeDailyReport = (report: DailyReport, resetTodaySales: boolean) => {
    setDailyReports((prev) => [report, ...prev]);

    // Otomatis kurangi stok bahan baku (stockItems) berdasarkan item yang laku terjual
    setStockItems((prevStock) => {
      const stockDeductionMap = new Map<string, number>();

      report.items.forEach((repItem) => {
        const menuItem = menuItems.find((m) => m.id === repItem.menuItemId);
        if (menuItem) {
          if (menuItem.ingredients && menuItem.ingredients.length > 0) {
            menuItem.ingredients.forEach((ing) => {
              const currentReq = stockDeductionMap.get(ing.stockItemId) || 0;
              stockDeductionMap.set(ing.stockItemId, currentReq + ing.amount * repItem.soldQty);
            });
          } else {
            // Fallback matching by name
            const matchedStock = prevStock.find((s) => s.name.trim().toLowerCase() === menuItem.name.trim().toLowerCase());
            if (matchedStock) {
              const currentReq = stockDeductionMap.get(matchedStock.id) || 0;
              stockDeductionMap.set(matchedStock.id, currentReq + repItem.soldQty);
            }
          }
        }
      });

      return prevStock.map((s) => {
        const deduct = stockDeductionMap.get(s.id);
        if (deduct && deduct > 0) {
          return {
            ...s,
            currentStock: Math.max(0, Number((s.currentStock - deduct).toFixed(2))),
            lastUpdated: new Date().toISOString(),
          };
        }
        return s;
      });
    });

    if (resetTodaySales) {
      setMenuItems((prev) =>
        prev.map((item) => ({
          ...item,
          soldQty: 0,
        }))
      );
    }

    setActiveTab('daily_history');
  };

  const handleDeleteDailyReport = (id: string) => {
    setDailyReports((prev) => prev.filter((r) => r.id !== id));
  };

  // RESET SALES TODAY (Set soldQty = 0 & clear transactions)
  const handleResetSalesToday = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data penjualan hari ini menjadi 0 (kosong)?')) {
      setTransactions([]);
      setMenuItems((prev) =>
        prev.map((item) => ({
          ...item,
          soldQty: 0,
        }))
      );
      localStorage.setItem('kukuslokal_transactions', JSON.stringify([]));
    }
  };

  // HANDLERS FOR MENU ITEMS & PRICES
  const handleUpdateMenuItem = (updated: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [...prev, newItem]);
  };

  // HANDLERS FOR INVENTORY
  const handleAddStockItem = (item: StockItem) => {
    setStockItems((prev) => [item, ...prev]);
  };

  const handleUpdateStockItem = (updated: StockItem) => {
    setStockItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteStockItem = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus item bahan baku ini?')) {
      const nextStock = stockItems.filter((item) => item.id !== id);
      const remainingStockIds = new Set(nextStock.map((s) => s.id));
      setStockItems(nextStock);

      setMenuItems((prevMenu) =>
        prevMenu.filter((m) => {
          if (m.category === 'kemasan') return false;
          if (m.ingredients && m.ingredients.length > 0) {
            return m.ingredients.some((ing) => remainingStockIds.has(ing.stockItemId));
          }
          return true;
        })
      );
    }
  };

  const handleRestock = (
    stockItemId: string,
    addedQty: number,
    purchaseCost: number,
    recordAsExpense: boolean
  ) => {
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === stockItemId) {
          return {
            ...item,
            currentStock: Number((item.currentStock + addedQty).toFixed(2)),
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    if (recordAsExpense && purchaseCost > 0) {
      const stockItem = stockItems.find((i) => i.id === stockItemId);
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        title: `Restock Bahan: ${stockItem?.name || 'Bahan Baku'} (${addedQty} ${stockItem?.unit || 'unit'})`,
        category: 'belanja_bahan',
        amount: purchaseCost,
        isCapital: false,
        paymentMethod: 'qris',
        date: new Date().toISOString(),
        notes: `Restock otomatis dari modul stok`,
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleUpdateMenuRecipe = (updatedMenu: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === updatedMenu.id ? updatedMenu : m)));
  };

  // HANDLERS FOR POS SALES & AUTO STOCK DEDUCTION
  const handleProcessSale = (transaction: Transaction) => {
    // 1. Save Transaction
    setTransactions((prev) => [transaction, ...prev]);

    // 2. Automatically deduct corresponding stock items based on ingredients
    setStockItems((prevStock) => {
      const stockMap = new Map<string, number>();

      // Sum up required quantities across transaction items
      transaction.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        if (menuItem) {
          menuItem.ingredients.forEach((ing) => {
            const currentReq = stockMap.get(ing.stockItemId) || 0;
            stockMap.set(ing.stockItemId, currentReq + ing.amount * item.quantity);
          });
        }

        if (item.sauceId) {
          const sauce = sauces.find((s) => s.id === item.sauceId);
          if (sauce) {
            sauce.ingredients.forEach((ing) => {
              const currentReq = stockMap.get(ing.stockItemId) || 0;
              stockMap.set(ing.stockItemId, currentReq + ing.amount * item.quantity);
            });
          }
        }
      });

      // Deduct stock
      return prevStock.map((stockItem) => {
        const deductAmt = stockMap.get(stockItem.id);
        if (deductAmt && deductAmt > 0) {
          const newQty = Math.max(0, Number((stockItem.currentStock - deductAmt).toFixed(2)));
          return {
            ...stockItem,
            currentStock: newQty,
            lastUpdated: new Date().toISOString(),
          };
        }
        return stockItem;
      });
    });
  };

  // HANDLERS FOR EXPENSES
  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Hapus log pengeluaran ini?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // EXPORT HANDLERS
  const handleExportExcel = () => {
    exportToExcel({
      financialSummary,
      transactions,
      stockItems,
      expenses,
      menuItems,
    });
  };

  const handleExportPdf = () => {
    exportToPdf({
      financialSummary,
      transactions,
      stockItems,
      expenses,
      menuItems,
    });
  };

  // RESET DEMO DATA
  const handleResetDemoData = () => {
    if (confirm('Kembalikan semua data stok, menu, dan transaksi ke data contoh awal Mood Kukus Mamuju?')) {
      localStorage.removeItem('kukuslokal_stock_items');
      localStorage.removeItem('kukuslokal_menu_items');
      localStorage.removeItem('kukuslokal_sauces');
      localStorage.removeItem('kukuslokal_expenses');
      localStorage.removeItem('kukuslokal_transactions');
      localStorage.removeItem('kukuslokal_daily_reports');

      setStockItems(INITIAL_STOCK_ITEMS);
      setMenuItems(INITIAL_MENU_ITEMS);
      setSauces(INITIAL_SAUCES);
      setExpenses(INITIAL_EXPENSES);
      setTransactions(INITIAL_TRANSACTIONS);
      setDailyReports(INITIAL_DAILY_REPORTS);
    }
  };

  const handleImportData = (imported: {
    stockItems?: StockItem[];
    menuItems?: MenuItem[];
    sauces?: SauceItem[];
    expenses?: Expense[];
    transactions?: Transaction[];
    dailyReports?: DailyReport[];
  }) => {
    if (imported.stockItems) setStockItems(imported.stockItems);
    if (imported.menuItems) setMenuItems(imported.menuItems);
    if (imported.sauces) setSauces(imported.sauces);
    if (imported.expenses) setExpenses(imported.expenses);
    if (imported.transactions) setTransactions(imported.transactions);
    if (imported.dailyReports) setDailyReports(imported.dailyReports);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-emerald-500 selection:text-stone-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        financialSummary={financialSummary}
        lowStockItems={lowStockItems}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onResetDemoData={handleResetDemoData}
        onOpenMenuEditor={() => setIsMenuEditorOpen(true)}
        onOpenDeviceSync={() => setIsDeviceSyncOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            financialSummary={financialSummary}
            lowStockItems={lowStockItems}
            transactions={transactions}
            expenses={expenses}
            menuItems={menuItems}
            sauces={sauces}
            stockItems={stockItems}
            onNavigateToTab={setActiveTab}
            onOpenRestockModal={() => setActiveTab('stock')}
            onOpenReceipt={(tr) => setActiveReceiptTransaction(tr)}
            onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
            onOpenMenuEditor={() => setIsMenuEditorOpen(true)}
            onOpenFinalizeModal={() => setIsFinalizeModalOpen(true)}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onResetSalesToday={handleResetSalesToday}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'daily_history' && (
          <DailyHistory
            dailyReports={dailyReports}
            onOpenFinalizeModal={() => setIsFinalizeModalOpen(true)}
            onDeleteDailyReport={handleDeleteDailyReport}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            stockItems={stockItems}
            menuItems={menuItems}
            sauces={sauces}
            onAddStockItem={handleAddStockItem}
            onUpdateStockItem={handleUpdateStockItem}
            onDeleteStockItem={handleDeleteStockItem}
            onRestock={handleRestock}
            onUpdateMenuRecipe={handleUpdateMenuRecipe}
            onAddMenuItem={handleAddMenuItem}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'flyer' && (
          <FlyerGenerator
            menuItems={menuItems}
            sauces={sauces}
          />
        )}
      </main>

      {/* Modals */}
      <AiBusinessAdvisor
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        financialSummary={financialSummary}
        lowStockItems={lowStockItems}
        menuItems={menuItems}
      />

      <DigitalReceiptModal
        transaction={activeReceiptTransaction}
        onClose={() => setActiveReceiptTransaction(null)}
      />

      <MenuPriceEditorModal
        isOpen={isMenuEditorOpen}
        onClose={() => setIsMenuEditorOpen(false)}
        menuItems={menuItems}
        sauces={sauces}
        stockItems={stockItems}
        onUpdateMenuItem={handleUpdateMenuItem}
        onAddMenuItem={handleAddMenuItem}
      />

      <FinalizeDayModal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        menuItems={menuItems}
        sauces={sauces}
        stockItems={stockItems}
        onFinalizeDay={handleFinalizeDailyReport}
      />

      <DeviceSyncModal
        isOpen={isDeviceSyncOpen}
        onClose={() => setIsDeviceSyncOpen(false)}
        stockItems={stockItems}
        menuItems={menuItems}
        sauces={sauces}
        expenses={expenses}
        transactions={transactions}
        dailyReports={dailyReports}
        onImportData={handleImportData}
      />

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-500 text-xs py-4 text-center mt-8">
        <p>KukusLokal &copy; {new Date().getFullYear()} - Sistem Manajemen Stok & Keuangan Kuliner Alami Eco-Friendly</p>
      </footer>
    </div>
  );
}

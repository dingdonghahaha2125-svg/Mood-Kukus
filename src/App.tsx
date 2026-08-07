import React, { useState, useEffect } from 'react';
import {
  INITIAL_STOCK_ITEMS,
  INITIAL_MENU_ITEMS,
  INITIAL_SAUCES,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { StockItem, MenuItem, SauceItem, Expense, Transaction } from './types';
import { calculateFinancialSummary } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StockManagement } from './components/StockManagement';
import { PosCashier } from './components/PosCashier';
import { ExpenseTracker } from './components/ExpenseTracker';
import { HppCalculator } from './components/HppCalculator';
import { FlyerGenerator } from './components/FlyerGenerator';
import { AiBusinessAdvisor } from './components/AiBusinessAdvisor';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { MenuPriceEditorModal } from './components/MenuPriceEditorModal';
import { exportToExcel, exportToPdf } from './utils/exportUtils';

export default function App() {
  // Load state from LocalStorage with fallback to initialData
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_stock_items');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
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

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState<boolean>(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

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

  // Derived financial calculation
  const financialSummary = calculateFinancialSummary(transactions, expenses, menuItems, sauces, stockItems);
  const lowStockItems = stockItems.filter((i) => i.currentStock <= i.minStock);

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
      setStockItems((prev) => prev.filter((item) => item.id !== id));
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

      setStockItems(INITIAL_STOCK_ITEMS);
      setMenuItems(INITIAL_MENU_ITEMS);
      setSauces(INITIAL_SAUCES);
      setExpenses(INITIAL_EXPENSES);
      setTransactions(INITIAL_TRANSACTIONS);
    }
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
            onUpdateMenuItem={handleUpdateMenuItem}
            onResetSalesToday={handleResetSalesToday}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'pos' && (
          <PosCashier
            menuItems={menuItems}
            sauces={sauces}
            stockItems={stockItems}
            onProcessSale={handleProcessSale}
            onOpenReceipt={(tr) => setActiveReceiptTransaction(tr)}
            onOpenMenuEditor={() => setIsMenuEditorOpen(true)}
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

        {activeTab === 'hpp' && (
          <HppCalculator
            menuItems={menuItems}
            sauces={sauces}
            stockItems={stockItems}
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

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-500 text-xs py-4 text-center mt-8">
        <p>KukusLokal &copy; {new Date().getFullYear()} - Sistem Manajemen Stok & Keuangan Kuliner Alami Eco-Friendly</p>
      </footer>
    </div>
  );
}

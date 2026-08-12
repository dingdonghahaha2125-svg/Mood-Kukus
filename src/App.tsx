import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import {
  INITIAL_STOCK_ITEMS,
  INITIAL_MENU_ITEMS,
  INITIAL_SAUCES,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_DAILY_REPORTS,
} from './data/initialData';
import { StockItem, MenuItem, SauceItem, Expense, Transaction, DailyReport } from './types';
import { calculateFinancialSummary, calculateStockDeductions } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StockManagement } from './components/StockManagement';
import { DailyHistory } from './components/DailyHistory';
import { ExpenseTracker } from './components/ExpenseTracker';
import { AiBusinessAdvisor } from './components/AiBusinessAdvisor';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { MenuPriceEditorModal } from './components/MenuPriceEditorModal';
import { FinalizeDayModal } from './components/FinalizeDayModal';
import { exportToExcel, exportToPdf } from './utils/exportUtils';

export default function App() {
  // Helper to fix Singkos typo -> Singkong
  const fixSingkos = (str: string) => str ? str.replace(/singkos/gi, 'Singkong') : str;

  // Load state from LocalStorage with fallback to initialData
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('kukuslokal_stock_items');
    const items: StockItem[] = saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
    return items
      .filter((s) => !s.name.toLowerCase().includes('jagung'))
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

  const [initialCapital, setInitialCapital] = useState<number>(() => {
    const saved = localStorage.getItem('kukuslokal_initial_capital');
    return saved ? Number(saved) : 5000000;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState<boolean>(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState<boolean>(false);
  const [finalizeModalDate, setFinalizeModalDate] = useState<string>('');
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  const handleOpenFinalizeModal = (date?: string) => {
    setFinalizeModalDate(date || new Date().toISOString().split('T')[0]);
    setIsFinalizeModalOpen(true);
  };

  // Firestore Real-time Listeners and Auto-Seeding
  useEffect(() => {
    const unsubCapital = onSnapshot(doc(db, 'settings', 'initialCapital'), (docSnap) => {
      if (docSnap.exists() && typeof docSnap.data().amount === 'number') {
        setInitialCapital(docSnap.data().amount);
      } else {
        setDoc(doc(db, 'settings', 'initialCapital'), { amount: 5000000 }).catch(console.error);
      }
    });

    const unsubStock = onSnapshot(collection(db, 'stockItems'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as StockItem[];
        setStockItems(
          items
            .filter((s) => !s.name.toLowerCase().includes('jagung'))
            .map((s) => ({ ...s, name: fixSingkos(s.name) }))
        );
      } else {
        INITIAL_STOCK_ITEMS.forEach((item) => {
          setDoc(doc(db, 'stockItems', item.id), item).catch(console.error);
        });
      }
    });

    const unsubMenu = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as MenuItem[];
        setMenuItems(
          items
            .filter((m) => m.id !== 'menu-item-jagung' && !m.name.toLowerCase().includes('jagung'))
            .map((m) => ({ ...m, name: fixSingkos(m.name) }))
        );
      } else {
        INITIAL_MENU_ITEMS.forEach((item) => {
          setDoc(doc(db, 'menuItems', item.id), item).catch(console.error);
        });
      }
    });

    const unsubSauces = onSnapshot(collection(db, 'sauces'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as SauceItem[];
        setSauces(items);
      } else {
        INITIAL_SAUCES.forEach((item) => {
          setDoc(doc(db, 'sauces', item.id), item).catch(console.error);
        });
      }
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Expense[];
        setExpenses(items);
      } else {
        INITIAL_EXPENSES.forEach((item) => {
          setDoc(doc(db, 'expenses', item.id), item).catch(console.error);
        });
      }
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(items);
      } else {
        INITIAL_TRANSACTIONS.forEach((item) => {
          setDoc(doc(db, 'transactions', item.id), item).catch(console.error);
        });
      }
    });

    const unsubDailyReports = onSnapshot(collection(db, 'dailyReports'), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DailyReport[];
        setDailyReports(items);
      } else {
        INITIAL_DAILY_REPORTS.forEach((item) => {
          setDoc(doc(db, 'dailyReports', item.id), item).catch(console.error);
        });
      }
    });

    return () => {
      unsubCapital();
      unsubStock();
      unsubMenu();
      unsubSauces();
      unsubExpenses();
      unsubTransactions();
      unsubDailyReports();
    };
  }, []);

  // Multi-tab / Broadcast sync fallback
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

  // Sync to LocalStorage as additional client fallback
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

  // Auto-sanitize menu items against current stock items
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

  // Auto-reconcile stock deduction for finalized daily reports that haven't deducted stock yet
  useEffect(() => {
    let stockChanged = false;
    let newStock = [...stockItems];
    const updatedReports = dailyReports.map((report) => {
      if (!report.isStockDeducted) {
        const stockDeductionMap = calculateStockDeductions(report.items, menuItems, newStock);
        if (stockDeductionMap.size > 0) {
          newStock = newStock.map((s) => {
            const deduct = stockDeductionMap.get(s.id);
            if (deduct && deduct > 0) {
              stockChanged = true;
              const updatedItem = {
                ...s,
                currentStock: Math.max(0, Number((s.currentStock - deduct).toFixed(2))),
                lastUpdated: new Date().toISOString(),
              };
              setDoc(doc(db, 'stockItems', updatedItem.id), updatedItem).catch(console.error);
              return updatedItem;
            }
            return s;
          });
        }
        return { ...report, isStockDeducted: true };
      }
      return report;
    });

    if (stockChanged) {
      setStockItems(newStock);
      setDailyReports(updatedReports);
    }
  }, [dailyReports, menuItems]);

  // Derived financial calculation
  const financialSummary = calculateFinancialSummary(
    transactions,
    expenses,
    menuItems,
    sauces,
    stockItems,
    dailyReports,
    initialCapital
  );
  const lowStockItems = stockItems.filter((i) => i.currentStock <= i.minStock);

  // HANDLER FOR INITIAL CAPITAL UPDATE
  const handleUpdateInitialCapital = async (amount: number) => {
    setInitialCapital(amount);
    localStorage.setItem('kukuslokal_initial_capital', amount.toString());
    try {
      await setDoc(doc(db, 'settings', 'initialCapital'), { amount });
    } catch (err) {
      console.error('Error saving initial capital to Firestore:', err);
    }
  };

  // HANDLER FOR MANUAL DAILY REPORT
  const handleAddManualDailyReport = async (report: DailyReport) => {
    setDailyReports((prev) => [report, ...prev]);
    try {
      await setDoc(doc(db, 'dailyReports', report.id), report);
    } catch (err) {
      console.error('Error adding manual daily report to Firestore:', err);
    }
  };

  // HANDLERS FOR DAILY REPORT FINALIZATION
  const handleFinalizeDailyReport = async (report: DailyReport, resetTodaySales: boolean) => {
    const reportWithFlag: DailyReport = { ...report, isStockDeducted: true };

    // Otomatis kurangi stok bahan baku (stockItems) berdasarkan item yang laku terjual
    setStockItems((prevStock) => {
      const stockDeductionMap = calculateStockDeductions(report.items, menuItems, prevStock);

      return prevStock.map((s) => {
        const deduct = stockDeductionMap.get(s.id);
        if (deduct && deduct > 0) {
          const updated = {
            ...s,
            currentStock: Math.max(0, Number((s.currentStock - deduct).toFixed(2))),
            lastUpdated: new Date().toISOString(),
          };
          setDoc(doc(db, 'stockItems', updated.id), updated).catch(console.error);
          return updated;
        }
        return s;
      });
    });

    setDailyReports((prev) => [reportWithFlag, ...prev]);
    try {
      await setDoc(doc(db, 'dailyReports', reportWithFlag.id), reportWithFlag);
    } catch (err) {
      console.error('Error saving daily report to Firestore:', err);
    }

    if (resetTodaySales) {
      setMenuItems((prev) =>
        prev.map((item) => {
          const updated = { ...item, soldQty: 0 };
          setDoc(doc(db, 'menuItems', updated.id), updated).catch(console.error);
          return updated;
        })
      );
    }

    setActiveTab('daily_history');
  };

  const handleDeleteDailyReport = async (id: string) => {
    setDailyReports((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'dailyReports', id));
    } catch (err) {
      console.error('Error deleting daily report from Firestore:', err);
    }
  };

  // RESET SALES TODAY (Set soldQty = 0 & clear transactions)
  const handleResetSalesToday = async () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data penjualan hari ini menjadi 0 (kosong)?')) {
      setTransactions([]);
      setMenuItems((prev) =>
        prev.map((item) => ({
          ...item,
          soldQty: 0,
        }))
      );
      localStorage.setItem('kukuslokal_transactions', JSON.stringify([]));

      // Clear transactions in Firestore
      transactions.forEach((t) => {
        deleteDoc(doc(db, 'transactions', t.id)).catch(console.error);
      });
    }
  };

  // HANDLERS FOR MENU ITEMS & PRICES
  const handleUpdateMenuItem = async (updated: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    try {
      await setDoc(doc(db, 'menuItems', updated.id), updated);
    } catch (err) {
      console.error('Error updating menu item in Firestore:', err);
    }
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    setMenuItems((prev) => [...prev, newItem]);
    try {
      await setDoc(doc(db, 'menuItems', newItem.id), newItem);
    } catch (err) {
      console.error('Error adding menu item to Firestore:', err);
    }
  };

  // HANDLERS FOR INVENTORY
  const handleAddStockItem = async (item: StockItem) => {
    setStockItems((prev) => [item, ...prev]);
    try {
      await setDoc(doc(db, 'stockItems', item.id), item);
    } catch (err) {
      console.error('Error adding stock item to Firestore:', err);
    }
  };

  const handleUpdateStockItem = async (updated: StockItem) => {
    setStockItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    try {
      await setDoc(doc(db, 'stockItems', updated.id), updated);
    } catch (err) {
      console.error('Error updating stock item in Firestore:', err);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
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

      try {
        await deleteDoc(doc(db, 'stockItems', id));
      } catch (err) {
        console.error('Error deleting stock item from Firestore:', err);
      }
    }
  };

  const handleRestock = async (
    stockItemId: string,
    addedQty: number,
    purchaseCost: number,
    recordAsExpense: boolean,
    purchaseDate?: string
  ) => {
    const isoDate = purchaseDate
      ? new Date(purchaseDate + 'T12:00:00').toISOString()
      : new Date().toISOString();

    let updatedStockItem: StockItem | null = null;
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === stockItemId) {
          updatedStockItem = {
            ...item,
            currentStock: Number((item.currentStock + addedQty).toFixed(2)),
            lastUpdated: isoDate,
          };
          return updatedStockItem;
        }
        return item;
      })
    );

    if (updatedStockItem) {
      try {
        await setDoc(doc(db, 'stockItems', (updatedStockItem as StockItem).id), updatedStockItem);
      } catch (err) {
        console.error('Error updating stock item during restock in Firestore:', err);
      }
    }

    if (recordAsExpense && purchaseCost > 0) {
      const stockItem = stockItems.find((i) => i.id === stockItemId);
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        title: `Restock Bahan: ${stockItem?.name || 'Bahan Baku'} (${addedQty} ${stockItem?.unit || 'unit'})`,
        category: 'belanja_bahan',
        amount: purchaseCost,
        isCapital: false,
        paymentMethod: 'qris',
        date: isoDate,
        notes: `Restock otomatis dari modul stok ${purchaseDate ? 'tanggal ' + purchaseDate : ''}`,
      };
      setExpenses((prev) => [newExpense, ...prev]);
      try {
        await setDoc(doc(db, 'expenses', newExpense.id), newExpense);
      } catch (err) {
        console.error('Error adding expense during restock to Firestore:', err);
      }
    }
  };

  const handleUpdateMenuRecipe = async (updatedMenu: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === updatedMenu.id ? updatedMenu : m)));
    try {
      await setDoc(doc(db, 'menuItems', updatedMenu.id), updatedMenu);
    } catch (err) {
      console.error('Error updating menu recipe in Firestore:', err);
    }
  };

  // HANDLERS FOR POS SALES & AUTO STOCK DEDUCTION
  const handleProcessSale = async (transaction: Transaction) => {
    // 1. Save Transaction to Firestore using setDoc
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (err) {
      console.error('Error saving transaction to Firestore:', err);
    }

    // 2. Local state update for transaction
    setTransactions((prev) => [transaction, ...prev]);

    // 3. Automatically deduct corresponding stock items based on ingredients and sync to Firestore
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

      // Deduct stock and sync to Firestore
      return prevStock.map((stockItem) => {
        const deductAmt = stockMap.get(stockItem.id);
        if (deductAmt && deductAmt > 0) {
          const newQty = Math.max(0, Number((stockItem.currentStock - deductAmt).toFixed(2)));
          const updatedItem = {
            ...stockItem,
            currentStock: newQty,
            lastUpdated: new Date().toISOString(),
          };
          setDoc(doc(db, 'stockItems', updatedItem.id), updatedItem).catch((err) =>
            console.error('Error updating stock item in Firestore:', err)
          );
          return updatedItem;
        }
        return stockItem;
      });
    });
  };

  // HANDLERS FOR EXPENSES
  const handleAddExpense = async (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
    try {
      await setDoc(doc(db, 'expenses', expense.id), expense);
    } catch (err) {
      console.error('Error adding expense to Firestore:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Hapus log pengeluaran ini?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err) {
        console.error('Error deleting expense from Firestore:', err);
      }
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
            onOpenFinalizeModal={handleOpenFinalizeModal}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onResetSalesToday={handleResetSalesToday}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onUpdateInitialCapital={handleUpdateInitialCapital}
          />
        )}

        {activeTab === 'daily_history' && (
          <DailyHistory
            dailyReports={dailyReports}
            onOpenFinalizeModal={handleOpenFinalizeModal}
            onDeleteDailyReport={handleDeleteDailyReport}
            onAddManualDailyReport={handleAddManualDailyReport}
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
        initialDate={finalizeModalDate}
      />

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-500 text-xs py-4 text-center mt-8">
        <p>KukusLokal &copy; {new Date().getFullYear()} - Sistem Manajemen Stok & Keuangan Kuliner Alami Eco-Friendly</p>
      </footer>
    </div>
  );
}

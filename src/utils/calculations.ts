import { MenuItem, SauceItem, StockItem, Transaction, Expense, FinancialSummary, DailyReport } from '../types';

/**
 * Calculates the exact HPP (Harga Pokok Penjualan) for a menu item
 * based on its raw ingredients & packaging stock cost prices.
 */
export function calculateMenuItemHpp(
  menuItem: MenuItem,
  sauceId: string | undefined,
  sauces: SauceItem[],
  stockItems: StockItem[]
): number {
  let totalHpp = 0;

  const stockMap = new Map<string, StockItem>();
  stockItems.forEach((stk) => stockMap.set(stk.id, stk));

  // 1. Calculate menu ingredients cost
  if (menuItem.ingredients) {
    for (const ing of menuItem.ingredients) {
      const stockItem = stockMap.get(ing.stockItemId);
      if (stockItem) {
        totalHpp += ing.amount * stockItem.unitCostPrice;
      }
    }
  }

  // 2. Add sauce ingredients cost if selected
  if (sauceId) {
    const sauce = sauces.find((s) => s.id === sauceId);
    if (sauce && sauce.ingredients) {
      for (const ing of sauce.ingredients) {
        const stockItem = stockMap.get(ing.stockItemId);
        if (stockItem) {
          totalHpp += ing.amount * stockItem.unitCostPrice;
        }
      }
    }
  }

  return Math.round(totalHpp);
}

/**
 * Calculates financial summary metrics
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  expenses: Expense[],
  menuItems: MenuItem[] = [],
  sauces: SauceItem[] = [],
  stockItems: StockItem[] = [],
  dailyReports: DailyReport[] = []
): FinancialSummary {
  // 1. Calculate cumulative revenue and HPP from all finalized daily reports
  const reportsRevenue = dailyReports.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
  const reportsHpp = dailyReports.reduce((sum, r) => sum + (r.totalHpp || 0), 0);

  // 2. Calculate active unfinalized sales (transactions or current active menuItems.soldQty)
  let activeRevenue = transactions.reduce((sum, tr) => sum + tr.totalAmount, 0);
  let activeHpp = transactions.reduce((sum, tr) => sum + tr.totalHpp, 0);

  const menuItemsRevenue = menuItems.reduce((sum, item) => sum + (item.soldQty || 0) * item.price, 0);
  if (transactions.length === 0 && menuItemsRevenue > 0) {
    activeRevenue = menuItemsRevenue;
    activeHpp = menuItems.reduce((sum, item) => {
      const hpp = calculateMenuItemHpp(item, item.defaultSauceId, sauces, stockItems);
      return sum + (item.soldQty || 0) * hpp;
    }, 0);
  } else if (transactions.length > 0 && menuItemsRevenue > activeRevenue) {
    activeRevenue = Math.max(activeRevenue, menuItemsRevenue);
  }

  const totalRevenue = reportsRevenue + activeRevenue;
  const totalHpp = reportsHpp + activeHpp;

  const operationalExpenses = expenses
    .filter((e) => !e.isCapital)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCapital = expenses
    .filter((e) => e.isCapital)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = operationalExpenses + totalCapital;

  const grossProfit = totalRevenue - totalHpp;
  const netProfit = grossProfit - operationalExpenses;

  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalExpenses,
    totalCapital,
    grossProfit,
    netProfit,
    profitMargin,
  };
}

/**
 * Format currency to IDR Rupiah string
 */
export function formatRp(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string to Indonesian readable format with time
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format date string to Indonesian readable format (date only)
 */
export function formatDateOnly(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Calculates per-item sales metrics comparing prepared stock vs actual sold items
 */
export function calculatePerItemSales(
  menuItems: MenuItem[],
  transactions: Transaction[],
  sauces: SauceItem[] = [],
  stockItems: StockItem[] = []
) {
  const itemMap = new Map<
    string,
    {
      menuItem: MenuItem;
      soldQty: number;
      revenue: number;
    }
  >();

  menuItems.forEach((m) => {
    itemMap.set(m.id, {
      menuItem: m,
      soldQty: m.soldQty || 0,
      revenue: (m.soldQty || 0) * m.price,
    });
  });

  // Calculate sold quantities from transaction items
  transactions.forEach((tr) => {
    tr.items.forEach((it) => {
      const existing = itemMap.get(it.menuItemId);
      if (existing) {
        existing.soldQty += it.quantity;
        existing.revenue += (it.pricePerUnit + (it.extraPrice || 0)) * it.quantity;
      }
    });
  });

  return Array.from(itemMap.values()).map(({ menuItem, soldQty, revenue }) => {
    const preparedQty = menuItem.preparedQty || Math.max(soldQty + 10, 30);
    const remainingQty = Math.max(0, preparedQty - soldQty);
    const sellRatePct = preparedQty > 0 ? Math.round((soldQty / preparedQty) * 100) : 0;

    // Calculate estimated HPP per unit
    const estimatedHppPerUnit = calculateMenuItemHpp(
      menuItem,
      menuItem.defaultSauceId,
      sauces,
      stockItems
    );
    const pricePerUnit = menuItem.price;
    const unitProfit = pricePerUnit - estimatedHppPerUnit;
    const profitMarginPct = pricePerUnit > 0 ? Math.round((unitProfit / pricePerUnit) * 100) : 0;
    const totalProfit = unitProfit * soldQty;

    return {
      menuItemId: menuItem.id,
      itemName: menuItem.name,
      category: menuItem.category,
      unitName: menuItem.unitName || (menuItem.category === 'paket' ? 'porsi' : 'biji'),
      preparedQty,
      soldQty,
      remainingQty,
      pricePerUnit,
      estimatedHppPerUnit,
      unitProfit,
      profitMarginPct,
      totalRevenue: revenue,
      totalProfit,
      sellRatePct,
      isAvailable: menuItem.isAvailable,
    };
  });
}

/**
 * Calculates stock item deductions from daily report items or sold menu items
 */
export function calculateStockDeductions(
  reportItems: { menuItemId?: string; menuName: string; soldQty: number }[],
  menuItems: MenuItem[],
  stockItems: StockItem[]
): Map<string, number> {
  const stockDeductionMap = new Map<string, number>();

  reportItems.forEach((repItem) => {
    const qty = repItem.soldQty || 0;
    if (qty <= 0) return;

    // 1. Try exact or fuzzy menuItem match
    const menuItem = menuItems.find(
      (m) =>
        (repItem.menuItemId && m.id === repItem.menuItemId) ||
        m.name.trim().toLowerCase() === repItem.menuName.trim().toLowerCase() ||
        (repItem.menuItemId && m.id.toLowerCase().includes(repItem.menuItemId.toLowerCase())) ||
        (repItem.menuName && m.name.toLowerCase().includes(repItem.menuName.toLowerCase()))
    );

    let hasDeducted = false;

    if (menuItem && menuItem.ingredients && menuItem.ingredients.length > 0) {
      menuItem.ingredients.forEach((ing) => {
        const currentReq = stockDeductionMap.get(ing.stockItemId) || 0;
        stockDeductionMap.set(ing.stockItemId, currentReq + ing.amount * qty);
        hasDeducted = true;
      });
    }

    if (!hasDeducted) {
      // Smart Keyword / Category Fallback matching directly to Stock Items
      const nameLower = (repItem.menuName || '').toLowerCase();

      if (nameLower.includes('pisang')) {
        const pisangStock = stockItems.find((s) => s.name.toLowerCase().includes('pisang') || s.id === 'stk-1');
        if (pisangStock) {
          const unitDeduct = pisangStock.unit === 'kg' ? 0.08 : 1;
          const curr = stockDeductionMap.get(pisangStock.id) || 0;
          stockDeductionMap.set(pisangStock.id, curr + unitDeduct * qty);
          hasDeducted = true;
        }
      } else if (nameLower.includes('ubi')) {
        const ubiStock = stockItems.find((s) => s.name.toLowerCase().includes('ubi') || s.id === 'stk-2');
        if (ubiStock) {
          const unitDeduct = ubiStock.unit === 'kg' ? 0.10 : 1;
          const curr = stockDeductionMap.get(ubiStock.id) || 0;
          stockDeductionMap.set(ubiStock.id, curr + unitDeduct * qty);
          hasDeducted = true;
        }
      } else if (nameLower.includes('telur')) {
        const telurStock = stockItems.find((s) => s.name.toLowerCase().includes('telur') || s.id === 'stk-4');
        if (telurStock) {
          const curr = stockDeductionMap.get(telurStock.id) || 0;
          stockDeductionMap.set(telurStock.id, curr + 1 * qty);
          hasDeducted = true;
        }
      } else if (nameLower.includes('singkong')) {
        const singkongStock = stockItems.find((s) => s.name.toLowerCase().includes('singkong'));
        if (singkongStock) {
          const unitDeduct = singkongStock.unit === 'kg' ? 0.12 : 1;
          const curr = stockDeductionMap.get(singkongStock.id) || 0;
          stockDeductionMap.set(singkongStock.id, curr + unitDeduct * qty);
          hasDeducted = true;
        }
      } else if (nameLower.includes('botol') || nameLower.includes('600ml')) {
        const botolStock = stockItems.find((s) => s.id === 'stk-13' || s.name.toLowerCase().includes('botol'));
        if (botolStock) {
          const curr = stockDeductionMap.get(botolStock.id) || 0;
          stockDeductionMap.set(botolStock.id, curr + 1 * qty);
          hasDeducted = true;
        }
      } else if (nameLower.includes('cup') || nameLower.includes('220ml') || nameLower.includes('gelas')) {
        const cupStock = stockItems.find((s) => s.id === 'stk-14' || s.name.toLowerCase().includes('cup'));
        if (cupStock) {
          const curr = stockDeductionMap.get(cupStock.id) || 0;
          stockDeductionMap.set(cupStock.id, curr + 1 * qty);
          hasDeducted = true;
        }
      } else {
        // Direct string match fallback
        const exactStock = stockItems.find((s) => s.name.trim().toLowerCase() === repItem.menuName.trim().toLowerCase());
        if (exactStock) {
          const curr = stockDeductionMap.get(exactStock.id) || 0;
          stockDeductionMap.set(exactStock.id, curr + 1 * qty);
        }
      }
    }
  });

  return stockDeductionMap;
}


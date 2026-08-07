export type StockCategory = 'bahan_utama' | 'bahan_saus' | 'kemasan' | 'operasional';
export type StockUnit = 'kg' | 'pcs' | 'liter' | 'pack' | 'ikat' | 'roll' | 'gram';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  currentStock: number;
  minStock: number;
  unit: StockUnit;
  unitCostPrice: number; // Cost price per unit in IDR
  lastUpdated: string;
  supplier?: string;
  notes?: string;
}

export interface RecipeIngredient {
  stockItemId: string;
  amount: number; // Amount in the stock item's unit (e.g. 0.2 kg, 1 pcs)
}

export interface SauceItem {
  id: string;
  name: string;
  description: string;
  extraPrice: number; // Extra fee for premium sauce if any
  ingredients: RecipeIngredient[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'paket' | 'satuan' | 'minuman' | 'kemasan';
  price: number; // Selling price in IDR per item / portion
  description: string;
  image?: string;
  ingredients: RecipeIngredient[];
  defaultSauceId?: string;
  isAvailable: boolean;
  unitName?: string; // 'biji', 'potong', 'tongkol', 'porsi', 'botol', 'box'
  preparedQty?: number; // Total units prepared/cooked for sale today (Stok Siap Jual)
  soldQty?: number; // Total units sold (Laku Terjual)
}

export interface SaleTransactionItem {
  menuItemId: string;
  menuName: string;
  quantity: number;
  pricePerUnit: number;
  sauceId?: string;
  sauceName?: string;
  extraPrice: number;
  packagingType?: string;
  calculatedHppPerUnit: number;
  unitName?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date format
  items: SaleTransactionItem[];
  totalAmount: number;
  totalHpp: number;
  netProfit: number;
  paymentMethod: 'qris' | 'cash' | 'transfer';
  customerName?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'modal_awal'
  | 'belanja_bahan'
  | 'pembelian_kemasan'
  | 'peralatan'
  | 'sewa_operasional'
  | 'pemasaran';

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  isCapital: boolean; // Is it initial investment capital or operational expense
  paymentMethod: 'qris' | 'cash' | 'transfer';
  notes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalCapital: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface PerItemSalesSummary {
  menuItemId: string;
  itemName: string;
  category: string;
  unitName: string;
  preparedQty: number;
  soldQty: number;
  remainingQty: number;
  pricePerUnit: number;
  estimatedHppPerUnit: number;
  unitProfit: number;
  profitMarginPct: number;
  totalRevenue: number;
  totalProfit: number;
  sellRatePct: number;
  isAvailable: boolean;
}


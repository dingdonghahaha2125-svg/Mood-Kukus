import {
  StockItem,
  MenuItem,
  SauceItem,
  Expense,
  Transaction,
  DailyReport,
} from '../types';

// Collection Names
const COLLECTIONS = {
  STOCK_ITEMS: 'stockItems',
  SAUCE_ITEMS: 'sauceItems',
  MENU_ITEMS: 'menuItems',
  TRANSACTIONS: 'transactions',
  EXPENSES: 'expenses',
  DAILY_REPORTS: 'dailyReports',
};

// Generic helper to subscribe to a collection (Disabled)
export function subscribeToCollection<T>(
  collectionName: string,
  _onData: (data: T[]) => void
) {
  console.log(`[Firebase Cloud Disabled] Local storage mode active for: ${collectionName}`);
  return () => {};
}

// Save or Update a Document in Firestore (Disabled)
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  console.log(`[Firebase Cloud Disabled] Skipped cloud save for ${collectionName}/${data.id}. Data saved locally.`);
}

// Directly add an Expense document to Firestore (Disabled)
export async function addExpenseToFirestore(expense: Expense): Promise<string> {
  console.log(`[Firebase Cloud Disabled] Skipped cloud expense add for ${expense.id}. Saved locally.`);
  return expense.id;
}

// Delete a Document from Firestore (Disabled)
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  console.log(`[Firebase Cloud Disabled] Skipped cloud delete for ${collectionName}/${id}. Deleted locally.`);
}

// Batch Sync Initial Seed Data to Firestore (Disabled)
export async function seedCollectionIfEmpty<T extends { id: string }>(
  _collectionName: string,
  _initialData: T[]
): Promise<void> {
  // No-op
}

export { COLLECTIONS };



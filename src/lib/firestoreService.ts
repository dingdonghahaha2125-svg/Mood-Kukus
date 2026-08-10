import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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

// Generic helper to subscribe to a collection
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((d) => d.data() as T);
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    );
  } catch (err) {
    console.warn(`Firestore subscription failed for ${collectionName}:`, err);
    return () => {};
  }
}

// Save or Update a Document in Firestore
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  const path = `${collectionName}/${data.id}`;
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a Document from Firestore
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Batch Sync Initial Seed Data to Firestore if collection is empty
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialData.length > 0) {
      console.log(`Seeding initial data for ${collectionName}...`);
      for (const item of initialData) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
    }
  } catch (error) {
    console.warn(`Could not seed ${collectionName} into Firestore:`, error);
  }
}

export { COLLECTIONS };

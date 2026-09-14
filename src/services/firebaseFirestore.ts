import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ProductItem,
  StockItem,
  SaleRecord,
  CustomerRecord,
  DuePaymentRecord,
  ExpenseRecord,
  SupplierRecord,
} from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Test connection on boot as mandated by the Firebase Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection successful!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.', error);
    } else {
      console.log('Firestore initialized. Note:', error);
    }
    return false;
  }
}

// User types
export interface AppUser {
  username: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  designation: string;
  phone?: string;
  avatar?: string;
}

// Default Pre-Configured Accounts for 1 Admin + 5 Cashiers/Staff
export const DEFAULT_USERS: { [username: string]: { password: string; user: AppUser } } = {
  admin: {
    password: 'admin1234',
    user: {
      username: 'admin',
      name: 'সুপার অ্যাডমিন (মালিক)',
      role: 'admin',
      designation: 'Store Owner / Admin',
    },
  },
  cashier1: {
    password: 'user1234',
    user: {
      username: 'cashier1',
      name: 'কাউন্টার ১ (ক্যাশিয়ার)',
      role: 'cashier',
      designation: 'Cashier Counter 1',
    },
  },
  cashier2: {
    password: 'user1234',
    user: {
      username: 'cashier2',
      name: 'কাউন্টার ২ (ক্যাশিয়ার)',
      role: 'cashier',
      designation: 'Cashier Counter 2',
    },
  },
  salesman: {
    password: 'user1234',
    user: {
      username: 'salesman',
      name: 'বিক্রয় কর্মী (Sales)',
      role: 'cashier',
      designation: 'Sales Representative',
    },
  },
  manager: {
    password: 'user1234',
    user: {
      username: 'manager',
      name: 'স্টোর ম্যানেজার',
      role: 'manager',
      designation: 'Store Manager',
    },
  },
  inventory: {
    password: 'user1234',
    user: {
      username: 'inventory',
      name: 'স্টক ইনচার্জ',
      role: 'manager',
      designation: 'Inventory Keeper',
    },
  },
};

// Real-time Firestore Listeners
export function subscribeToProducts(callback: (products: ProductItem[]) => void) {
  const colRef = collection(db, 'products');
  return onSnapshot(colRef, (snapshot) => {
    const list: ProductItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ProductItem);
    });
    callback(list);
  }, (err) => console.warn('Firestore products listener error:', err));
}

export function subscribeToStock(callback: (stock: StockItem[]) => void) {
  const colRef = collection(db, 'stock');
  return onSnapshot(colRef, (snapshot) => {
    const list: StockItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as StockItem);
    });
    callback(list);
  }, (err) => console.warn('Firestore stock listener error:', err));
}

export function subscribeToSales(callback: (sales: SaleRecord[]) => void) {
  const colRef = collection(db, 'sales');
  return onSnapshot(colRef, (snapshot) => {
    const list: SaleRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SaleRecord);
    });
    callback(list);
  }, (err) => console.warn('Firestore sales listener error:', err));
}

export function subscribeToCustomers(callback: (customers: CustomerRecord[]) => void) {
  const colRef = collection(db, 'customers');
  return onSnapshot(colRef, (snapshot) => {
    const list: CustomerRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as CustomerRecord);
    });
    callback(list);
  }, (err) => console.warn('Firestore customers listener error:', err));
}

export function subscribeToExpenses(callback: (expenses: ExpenseRecord[]) => void) {
  const colRef = collection(db, 'expenses');
  return onSnapshot(colRef, (snapshot) => {
    const list: ExpenseRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ExpenseRecord);
    });
    callback(list);
  }, (err) => console.warn('Firestore expenses listener error:', err));
}

export function subscribeToDuePayments(callback: (duePayments: DuePaymentRecord[]) => void) {
  const colRef = collection(db, 'duePayments');
  return onSnapshot(colRef, (snapshot) => {
    const list: DuePaymentRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as DuePaymentRecord);
    });
    callback(list);
  }, (err) => console.warn('Firestore due payments listener error:', err));
}

// Sync single entities to Firestore
export async function syncProductToFirestore(product: ProductItem) {
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (e) {
    console.error('Error saving product to Firestore:', e);
  }
}

export async function syncStockItemToFirestore(stockItem: StockItem) {
  try {
    await setDoc(doc(db, 'stock', stockItem.id), stockItem);
  } catch (e) {
    console.error('Error saving stock to Firestore:', e);
  }
}

export async function syncSaleToFirestore(sale: SaleRecord) {
  try {
    await setDoc(doc(db, 'sales', sale.invoiceNo), sale);
  } catch (e) {
    console.error('Error saving sale to Firestore:', e);
  }
}

export async function deleteSaleFromFirestore(invoiceNo: string) {
  try {
    await deleteDoc(doc(db, 'sales', invoiceNo));
  } catch (e) {
    console.error('Error deleting sale from Firestore:', e);
  }
}

export async function syncCustomerToFirestore(customer: CustomerRecord) {
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (e) {
    console.error('Error saving customer to Firestore:', e);
  }
}

export async function syncExpenseToFirestore(expense: ExpenseRecord) {
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (e) {
    console.error('Error saving expense to Firestore:', e);
  }
}

export async function syncDuePaymentToFirestore(payment: DuePaymentRecord) {
  try {
    await setDoc(doc(db, 'duePayments', payment.id), payment);
  } catch (e) {
    console.error('Error saving due payment to Firestore:', e);
  }
}

// Batch upload all initial data to Firestore if cloud is empty
export async function seedInitialDataIfEmpty(data: {
  products: ProductItem[];
  stock: StockItem[];
  sales: SaleRecord[];
  customers: CustomerRecord[];
  expenses: ExpenseRecord[];
  duePayments: DuePaymentRecord[];
}) {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      return false; // Already has data
    }
    
    // Seed initial demo data
    const batch = writeBatch(db);
    data.products.forEach((p) => batch.set(doc(db, 'products', p.id), p));
    data.stock.forEach((s) => batch.set(doc(db, 'stock', s.id), s));
    data.sales.forEach((s) => batch.set(doc(db, 'sales', s.invoiceNo), s));
    data.customers.forEach((c) => batch.set(doc(db, 'customers', c.id), c));
    data.expenses.forEach((e) => batch.set(doc(db, 'expenses', e.id), e));
    data.duePayments.forEach((d) => batch.set(doc(db, 'duePayments', d.id), d));

    await batch.commit();
    console.log('Initial data seeded to Firestore successfully!');
    return true;
  } catch (e) {
    console.warn('Seeding initial data notice:', e);
    return false;
  }
}

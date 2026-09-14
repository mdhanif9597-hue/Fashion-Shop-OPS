import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProductItem,
  StockItem,
  SaleRecord,
  SaleInvoiceItem,
  CustomerRecord,
  CustomerPaymentHistory,
  DuePaymentRecord,
  SupplierRecord,
  ExpenseRecord,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_STOCK,
  INITIAL_CUSTOMERS,
  INITIAL_DUE_PAYMENTS,
  INITIAL_SALES,
  INITIAL_SUPPLIERS,
  INITIAL_EXPENSES,
} from '../data/initialData';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout as firebaseLogout,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  createShopSpreadsheet,
  syncAllToGoogleSheet,
  importDataFromGoogleSheet,
  getSpreadsheetDetails,
  extractSpreadsheetId,
  listUserSpreadsheets,
  DriveSpreadsheetItem,
} from '../services/googleSheetsService';
import {
  testConnection,
  AppUser,
  DEFAULT_USERS,
  subscribeToProducts,
  subscribeToStock,
  subscribeToSales,
  subscribeToCustomers,
  subscribeToExpenses,
  subscribeToDuePayments,
  syncProductToFirestore,
  syncStockItemToFirestore,
  syncSaleToFirestore,
  syncCustomerToFirestore,
  syncExpenseToFirestore,
  syncDuePaymentToFirestore,
  deleteSaleFromFirestore,
  seedInitialDataIfEmpty,
} from '../services/firebaseFirestore';

export type ModalType =
  | 'none'
  | 'sale_pos'
  | 'new_product'
  | 'old_invoice'
  | 'due_payment'
  | 'invoice_print'
  | 'sheets_view'
  | 'sheet_sync'
  | 'expense_entry'
  | 'report_modal'
  | 'user_auth';

interface ShopContextType {
  products: ProductItem[];
  stock: StockItem[];
  sales: SaleRecord[];
  customers: CustomerRecord[];
  duePayments: DuePaymentRecord[];
  suppliers: SupplierRecord[];
  expenses: ExpenseRecord[];
  activeModal: ModalType;
  setActiveModal: (modal: ModalType) => void;
  currentInvoiceForPrint: SaleRecord | null;
  setCurrentInvoiceForPrint: (invoice: SaleRecord | null) => void;

  // User Accounts & Firebase Status
  currentUser: AppUser;
  loginUser: (username: string, password: string) => boolean;
  logoutUser: () => void;
  firebaseStatus: 'connecting' | 'connected' | 'offline';
  
  // Actions
  addNewProduct: (data: {
    productName: string;
    category: string;
    supplier: string;
    qty: number;
    purchasePrice: number;
    salePrice: number;
  }) => { product: ProductItem; stockUpdated: boolean };
  
  processSale: (data: {
    customerName: string;
    phone: string;
    items: SaleInvoiceItem[];
    subtotal: number;
    discount: number;
    netTotal: number;
    payment: number;
    due: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card';
    remarks: string;
  }) => SaleRecord;

  payCustomerDue: (
    customerId: string,
    amount: number,
    paymentMethod: string,
    remarks: string,
    collectionDate?: string
  ) => void;

  updateSale: (invoiceNo: string, updatedData: Partial<SaleRecord>) => void;
  deleteSale: (invoiceNo: string) => void;

  // Expense Actions
  addExpense: (data: {
    category: string;
    amount: number;
    note: string;
    paymentMethod?: string;
    date?: string;
  }) => ExpenseRecord;
  deleteExpense: (id: string) => void;

  // Next IDs generators
  getNextProductId: () => string;
  getNextPurchaseNo: () => string;
  getNextInvoiceNo: () => string;
  getNextExpenseId: () => string;

  // Google Sheets Direct OAuth & API integration
  user: User | null;
  googleAccessToken: string | null;
  isAuthLoading: boolean;
  googleSignInAction: () => Promise<void>;
  googleSignOutAction: () => Promise<void>;
  connectedSpreadsheetId: string;
  connectedSpreadsheetTitle: string;
  connectedSpreadsheetUrl: string;
  createAndConnectShopSheet: (title?: string) => Promise<string>;
  connectExistingSheetByIdOrUrl: (input: string) => Promise<void>;
  disconnectSheet: () => void;
  syncAllToGoogleSheetsDirect: () => Promise<void>;
  importFromGoogleSheetsDirect: () => Promise<void>;
  userDriveSheets: DriveSpreadsheetItem[];
  loadUserDriveSheets: () => Promise<void>;
  isDriveSheetsLoading: boolean;

  // Confirmation Modal state for Workspace Mutating/Destructive operations
  confirmModalState: {
    isOpen: boolean;
    type: 'export' | 'import' | null;
    isLoading: boolean;
  };
  openExportConfirmation: () => void;
  openImportConfirmation: () => void;
  closeConfirmationModal: () => void;
  executeConfirmedSync: () => Promise<void>;

  // Legacy Webhook & CSV fallback
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncMessage: string;
  syncWithGoogleSheet: () => Promise<void>;
  resetToSampleData: () => void;
  exportToCSV: (type: 'products' | 'stock' | 'sales' | 'customers' | 'expenses' | 'all') => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('pos_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('pos_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('pos_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [duePayments, setDuePayments] = useState<DuePaymentRecord[]>(() => {
    const saved = localStorage.getItem('pos_due_payments');
    return saved ? JSON.parse(saved) : INITIAL_DUE_PAYMENTS;
  });

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => {
    const saved = localStorage.getItem('pos_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('pos_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [currentInvoiceForPrint, setCurrentInvoiceForPrint] = useState<SaleRecord | null>(null);

  // Google OAuth & Direct Sheets API state
  const [user, setUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [connectedSpreadsheetId, setConnectedSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('pos_gsheet_id') || '';
  });
  const [connectedSpreadsheetTitle, setConnectedSpreadsheetTitle] = useState<string>(() => {
    return localStorage.getItem('pos_gsheet_title') || '';
  });
  const [connectedSpreadsheetUrl, setConnectedSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('pos_gsheet_view_url') || '';
  });
  const [userDriveSheets, setUserDriveSheets] = useState<DriveSpreadsheetItem[]>([]);
  const [isDriveSheetsLoading, setIsDriveSheetsLoading] = useState<boolean>(false);

  // Confirmation Modal state for destructive/mutating Workspace operations
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: 'export' | 'import' | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: null,
    isLoading: false,
  });

  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    return localStorage.getItem('pos_gsheet_url') || '';
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // User Accounts & Firebase Firestore Status
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('pos_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_USERS.admin.user;
  });
  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  const loginUser = (username: string, password: string): boolean => {
    const account = DEFAULT_USERS[username.toLowerCase().trim()];
    if (account && account.password === password.trim()) {
      setCurrentUser(account.user);
      localStorage.setItem('pos_current_user', JSON.stringify(account.user));
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(DEFAULT_USERS.admin.user);
    localStorage.setItem('pos_current_user', JSON.stringify(DEFAULT_USERS.admin.user));
  };

  // Initialize Firebase Firestore connection, test on boot & sync data
  useEffect(() => {
    testConnection().then((ok) => {
      setFirebaseStatus(ok ? 'connected' : 'offline');
      if (ok) {
        seedInitialDataIfEmpty({
          products,
          stock,
          sales,
          customers,
          expenses,
          duePayments,
        });
      }
    });

    const unsubProducts = subscribeToProducts((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setProducts(cloudList);
      }
    });

    const unsubStock = subscribeToStock((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setStock(cloudList);
      }
    });

    const unsubSales = subscribeToSales((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setSales(cloudList);
      }
    });

    const unsubCustomers = subscribeToCustomers((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setCustomers(cloudList);
      }
    });

    const unsubExpenses = subscribeToExpenses((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setExpenses(cloudList);
      }
    });

    const unsubDue = subscribeToDuePayments((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setDuePayments(cloudList);
      }
    });

    return () => {
      unsubProducts();
      unsubStock();
      unsubSales();
      unsubCustomers();
      unsubExpenses();
      unsubDue();
    };
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setGoogleAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setGoogleAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pos_due_payments', JSON.stringify(duePayments));
  }, [duePayments]);

  useEffect(() => {
    localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pos_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pos_gsheet_url', googleSheetUrl);
  }, [googleSheetUrl]);

  // ID generators
  const getNextProductId = (): string => {
    let maxNum = 0;
    products.forEach((p) => {
      const match = p.id.match(/^P(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    stock.forEach((s) => {
      const match = s.id.match(/^P(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `P${nextNum.toString().padStart(4, '0')}`;
  };

  const getNextPurchaseNo = (): string => {
    let maxNum = 0;
    products.forEach((p) => {
      const match = p.purchaseNo.match(/^PUR(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `PUR${nextNum.toString().padStart(5, '0')}`;
  };

  const getNextInvoiceNo = (): string => {
    let maxNum = 1000;
    sales.forEach((s) => {
      const match = s.invoiceNo.match(/^INV-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `INV-${maxNum + 1}`;
  };

  const getNextExpenseId = (): string => {
    let maxNum = 0;
    expenses.forEach((e) => {
      const match = e.id.match(/^EXP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `EXP-${nextNum.toString().padStart(3, '0')}`;
  };

  const formatNow = () => {
    const now = new Date();
    const d = now.getDate();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return `${m}/${d}/${y} ${h}:${min}:${s}`;
  };

  // 1. Add New Product (Products & Stock sync)
  const addNewProduct = (data: {
    productName: string;
    category: string;
    supplier: string;
    qty: number;
    purchasePrice: number;
    salePrice: number;
  }) => {
    const newId = getNextProductId();
    const newPurchaseNo = getNextPurchaseNo();
    const dateStr = formatNow();
    const totalCost = data.qty * data.purchasePrice;

    const newProduct: ProductItem = {
      id: newId,
      date: dateStr,
      purchaseNo: newPurchaseNo,
      supplier: data.supplier || 'General Supplier',
      product: data.productName,
      category: data.category || 'clothing',
      qty: data.qty,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      total: totalCost,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Supplier record update
    if (data.supplier) {
      setSuppliers((prev) => {
        const existing = prev.find(
          (s) => s.name.toLowerCase() === data.supplier.trim().toLowerCase()
        );
        if (existing) {
          return prev.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  totalSupplied: s.totalSupplied + totalCost,
                  totalPaid: s.totalPaid + totalCost, // default paid
                }
              : s
          );
        } else {
          return [
            ...prev,
            {
              id: `SUP-${prev.length + 1}`,
              date: dateStr,
              name: data.supplier.trim(),
              phone: 'N/A',
              totalSupplied: totalCost,
              totalPaid: totalCost,
              totalDue: 0,
            },
          ];
        }
      });
    }

    // Check Stock logic: "যদি সেইম প্রোডাক্ট সেইম প্রাইস হয়, তাহলে সেটি যদি আগে থেকে স্টক শিটে থেকে থাকে, তাহলে সেই সেই আইটেমের সাথে অ্যাড হবে এবং প্রোডাক্ট শিটে নতুন অ্যাড হবে।"
    let stockMerged = false;
    setStock((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productName.trim().toLowerCase() === data.productName.trim().toLowerCase() &&
          Number(item.purchasePrice) === Number(data.purchasePrice) &&
          Number(item.salePrice) === Number(data.salePrice)
      );

      if (existingIndex !== -1) {
        stockMerged = true;
        const updated = [...prev];
        const current = updated[existingIndex];
        updated[existingIndex] = {
          ...current,
          purchasedQty: current.purchasedQty + data.qty,
          currentStock: current.currentStock + data.qty,
          date: dateStr,
        };
        return updated;
      } else {
        const newStockItem: StockItem = {
          id: newId,
          date: dateStr,
          purchaseNo: newPurchaseNo,
          productName: data.productName,
          category: data.category || 'clothing',
          purchasedQty: data.qty,
          soldQty: 0,
          currentStock: data.qty,
          salePrice: data.salePrice,
          purchasePrice: data.purchasePrice,
        };
        return [newStockItem, ...prev];
      }
    });

    // Real-time Cloud Sync to Firebase Firestore
    syncProductToFirestore(newProduct);
    const targetStockItem = stock.find(
      (item) =>
        item.productName.trim().toLowerCase() === data.productName.trim().toLowerCase() &&
        Number(item.purchasePrice) === Number(data.purchasePrice) &&
        Number(item.salePrice) === Number(data.salePrice)
    );
    if (targetStockItem) {
      syncStockItemToFirestore({
        ...targetStockItem,
        purchasedQty: targetStockItem.purchasedQty + data.qty,
        currentStock: targetStockItem.currentStock + data.qty,
        date: dateStr,
      });
    } else {
      syncStockItemToFirestore({
        id: newId,
        date: dateStr,
        purchaseNo: newPurchaseNo,
        productName: data.productName,
        category: data.category || 'clothing',
        purchasedQty: data.qty,
        soldQty: 0,
        currentStock: data.qty,
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice,
      });
    }

    return { product: newProduct, stockUpdated: stockMerged };
  };

  // 2. Process Sale (Sale Entry POS)
  const processSale = (data: {
    customerName: string;
    phone: string;
    items: SaleInvoiceItem[];
    subtotal: number;
    discount: number;
    netTotal: number;
    payment: number;
    due: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card';
    remarks: string;
  }): SaleRecord => {
    const invoiceNo = getNextInvoiceNo();
    const dateStr = formatNow();
    const totalProfit = data.items.reduce((acc, item) => acc + (item.profit || 0), 0) - (data.discount || 0);

    const saleRecord: SaleRecord = {
      id: invoiceNo,
      invoiceNo,
      date: dateStr,
      customerName: data.customerName.trim() || 'Walk-in Customer',
      phone: data.phone.trim() || 'N/A',
      items: data.items,
      productNameSummary: data.items.map((i) => i.productName).join(', '),
      qtySummary: data.items.reduce((acc, i) => acc + i.qty, 0),
      salePriceSummary: data.items.reduce((acc, i) => acc + i.salePrice * i.qty, 0),
      discountTotal: data.discount,
      purchasePriceSummary: data.items.reduce((acc, i) => acc + i.purchasePrice * i.qty, 0),
      subtotal: data.subtotal,
      discount: data.discount,
      netTotal: data.netTotal,
      payment: data.payment,
      due: Math.max(0, data.due),
      paymentMethod: data.paymentMethod,
      remarks: data.remarks || '',
      profit: Math.max(0, totalProfit),
    };

    // 1. Add to Sales
    setSales((prev) => [saleRecord, ...prev]);

    // 2. Deduct from Stock: "স্টক শিট থেকে সেই আইটেমগুলো কমে যাবে"
    setStock((prev) => {
      const updated = [...prev];
      data.items.forEach((soldItem) => {
        // Find matching item by ID or name
        const matchIdx = updated.findIndex(
          (s) => s.id === soldItem.productId || s.productName.toLowerCase() === soldItem.productName.toLowerCase()
        );
        if (matchIdx !== -1) {
          const item = updated[matchIdx];
          const newSoldQty = item.soldQty + soldItem.qty;
          const newCurrentStock = Math.max(0, item.currentStock - soldItem.qty);
          updated[matchIdx] = {
            ...item,
            soldQty: newSoldQty,
            currentStock: newCurrentStock,
          };
        }
      });
      return updated;
    });

    // 3. Update Customer Record: "এবং যদি কাস্টমার ডিউ নেওয়া হয়, তাহলে সেটি কাস্টমার শিটে দেখাবে"
    const custName = data.customerName.trim() || 'Walk-in Customer';
    const custPhone = data.phone.trim() || 'N/A';

    setCustomers((prev) => {
      const existingIdx = prev.findIndex(
        (c) =>
          (custPhone !== 'N/A' && c.phone === custPhone) ||
          c.customerName.toLowerCase() === custName.toLowerCase()
      );

      if (existingIdx !== -1) {
        const current = prev[existingIdx];
        const updated = [...prev];
        updated[existingIdx] = {
          ...current,
          date: dateStr,
          phone: custPhone !== 'N/A' ? custPhone : current.phone,
          totalPurchase: current.totalPurchase + data.netTotal,
          totalPaid: current.totalPaid + data.payment,
          totalDue: Math.max(0, current.totalDue + (data.netTotal - data.payment)),
        };
        return updated;
      } else {
        const newCustomer: CustomerRecord = {
          id: `CUST-${prev.length + 1001}`,
          date: dateStr,
          customerName: custName,
          phone: custPhone,
          totalPurchase: data.netTotal,
          totalPaid: data.payment,
          totalDue: Math.max(0, data.netTotal - data.payment),
        };
        return [newCustomer, ...prev];
      }
    });

    // Set for printing
    setCurrentInvoiceForPrint(saleRecord);

    // Sync to Firestore Cloud in real-time
    syncSaleToFirestore(saleRecord);
    data.items.forEach((soldItem) => {
      const currentItem = stock.find(
        (s) => s.id === soldItem.productId || s.productName.toLowerCase() === soldItem.productName.toLowerCase()
      );
      if (currentItem) {
        syncStockItemToFirestore({
          ...currentItem,
          soldQty: currentItem.soldQty + soldItem.qty,
          currentStock: Math.max(0, currentItem.currentStock - soldItem.qty),
        });
      }
    });

    return saleRecord;
  };

  // 3. Customer Due Payment: "ডিউ ক্লিয়ার করতে পারি সেটি করে দিবে"
  const payCustomerDue = (
    customerId: string,
    amount: number,
    paymentMethod: string,
    remarks: string,
    collectionDate?: string
  ) => {
    if (amount <= 0) return;
    const dateStr = collectionDate || formatNow();

    let custName = '';
    let custPhone = '';
    let previousDue = 0;
    let finalDue = 0;

    setCustomers((prev) => {
      return prev.map((c) => {
        if (c.id === customerId) {
          custName = c.customerName;
          custPhone = c.phone;
          previousDue = c.totalDue;
          const newDue = Math.max(0, c.totalDue - amount);
          finalDue = newDue;
          const newPaid = c.totalPaid + amount;

          const historyItem: CustomerPaymentHistory = {
            id: `PAY-${Date.now()}`,
            date: dateStr,
            amount,
            paymentMethod: paymentMethod || 'Cash',
            remarks: remarks || 'ডিউ পরিশোধ',
            remainingDue: newDue,
          };

          const oldHistory = Array.isArray(c.paymentHistory) ? c.paymentHistory : [];

          const updatedCustomer = {
            ...c,
            totalPaid: newPaid,
            totalDue: newDue,
            lastPaymentDate: dateStr,
            lastPaymentAmount: amount,
            paymentHistory: [historyItem, ...oldHistory],
          };
          syncCustomerToFirestore(updatedCustomer);
          return updatedCustomer;
        }
        return c;
      });
    });

    const newDueRecord: DuePaymentRecord = {
      id: `DUE-${Date.now().toString().slice(-5)}`,
      date: dateStr,
      customerId,
      customerName: custName,
      phone: custPhone,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      remarks: remarks || 'ডিউ পরিশোধ',
      previousDue,
      remainingDue: finalDue,
    };

    setDuePayments((prev) => [newDueRecord, ...prev]);
    syncDuePaymentToFirestore(newDueRecord);
  };

  // 4. Update Old Invoice
  const updateSale = (invoiceNo: string, updatedData: Partial<SaleRecord>) => {
    setSales((prev) =>
      prev.map((sale) => {
        if (sale.invoiceNo === invoiceNo) {
          const updated = { ...sale, ...updatedData };
          syncSaleToFirestore(updated);
          return updated;
        }
        return sale;
      })
    );
  };

  const deleteSale = (invoiceNo: string) => {
    setSales((prev) => prev.filter((s) => s.invoiceNo !== invoiceNo));
    deleteSaleFromFirestore(invoiceNo);
  };

  // 5. Add Expense (Expense Entry)
  const addExpense = (data: {
    category: string;
    amount: number;
    note: string;
    paymentMethod?: string;
    date?: string;
  }): ExpenseRecord => {
    const id = getNextExpenseId();
    const dateStr = data.date || formatNow();
    const newExpense: ExpenseRecord = {
      id,
      date: dateStr,
      category: data.category || 'General Expense',
      amount: data.amount,
      note: data.note || '',
      paymentMethod: data.paymentMethod || 'Cash',
    };

    setExpenses((prev) => [newExpense, ...prev]);
    syncExpenseToFirestore(newExpense);
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setStock(INITIAL_STOCK);
    setCustomers(INITIAL_CUSTOMERS);
    setDuePayments(INITIAL_DUE_PAYMENTS);
    setSales(INITIAL_SALES);
    setSuppliers(INITIAL_SUPPLIERS);
    setExpenses(INITIAL_EXPENSES);
  };

  // CSV Export Utility
  const exportToCSV = (type: 'products' | 'stock' | 'sales' | 'customers' | 'expenses' | 'due_payments' | 'all') => {
    const downloadBlob = (csvContent: string, fileName: string) => {
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (type === 'products' || type === 'all') {
      const headers = ['Date', 'ID', 'Purchase No', 'Supplier', 'Product', 'Qty', 'Purchase Price', 'Sale Price', 'Total'];
      const rows = products.map((p) => [
        p.date,
        p.id,
        p.purchaseNo,
        p.supplier,
        p.product,
        p.qty,
        p.purchasePrice,
        p.salePrice,
        p.total,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Products_Sheet_${Date.now()}.csv`);
    }

    if (type === 'stock' || type === 'all') {
      const headers = ['Date', 'Id', 'Purchase No', 'Product Name', 'Category', 'Purchased Qty', 'Sold Qty', 'Current Stock', 'Sale Price', 'Purchase Price'];
      const rows = stock.map((s) => [
        s.date,
        s.id,
        s.purchaseNo,
        s.productName,
        s.category,
        s.purchasedQty,
        s.soldQty,
        s.currentStock,
        s.salePrice,
        s.purchasePrice,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Stock_Sheet_${Date.now()}.csv`);
    }

    if (type === 'sales' || type === 'all') {
      const headers = ['Date', 'Invoice No', 'Customer Name', 'Phone', 'Product Name', 'Qty', 'Sale Price', 'Discount', 'Purchase Price', 'Payment', 'Remarks', 'Payment Method', 'Profit'];
      const rows = sales.map((s) => [
        s.date,
        s.invoiceNo,
        s.customerName,
        s.phone,
        s.productNameSummary || '',
        s.qtySummary || 0,
        s.salePriceSummary || s.netTotal,
        s.discount || 0,
        s.purchasePriceSummary || 0,
        s.payment,
        s.remarks || '',
        s.paymentMethod,
        s.profit,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Sales_Sheet_${Date.now()}.csv`);
    }

    if (type === 'customers' || type === 'all') {
      const headers = [
        'Registration Date',
        'Customer Name',
        'Phone',
        'Total Purchase',
        'Total Paid',
        'Total Due',
        'Last Payment Date',
        'Last Paid Amount',
      ];
      const rows = customers.map((c) => [
        c.date,
        c.customerName,
        c.phone,
        c.totalPurchase,
        c.totalPaid,
        c.totalDue,
        c.lastPaymentDate || 'N/A',
        c.lastPaymentAmount || 0,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Customers_Sheet_${Date.now()}.csv`);
    }

    if ((type as string) === 'due_payments' || type === 'all') {
      const headers = [
        'Collection Date',
        'Voucher ID',
        'Customer Name',
        'Phone',
        'Collected Amount',
        'Payment Method',
        'Remaining Due',
        'Remarks',
      ];
      const rows = duePayments.map((d) => [
        d.date,
        d.id,
        d.customerName,
        d.phone,
        d.amount,
        d.paymentMethod,
        d.remainingDue ?? 0,
        d.remarks || '',
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Due_Collections_Sheet_${Date.now()}.csv`);
    }

    if (type === 'expenses' || type === 'all') {
      const headers = ['Date', 'Expense ID', 'Category', 'Amount', 'Note', 'Payment Method'];
      const rows = expenses.map((e) => [
        e.date,
        e.id,
        e.category,
        e.amount,
        e.note || '',
        e.paymentMethod || 'Cash',
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadBlob(csv, `Expenses_Sheet_${Date.now()}.csv`);
    }
  };

  // Google Sheets Webhook Sync
  const syncWithGoogleSheet = async () => {
    if (!googleSheetUrl) {
      setSyncStatus('error');
      setSyncMessage('অনুগ্রহ করে গুগল শিট ওয়েব অ্যাপ ইউআরএল (Web App URL) ইনপুট দিন');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('গুগল শিটে ডাটা সিনক্রোনাইজ হচ্ছে...');

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        products,
        stock,
        sales,
        customers,
        duePayments,
        suppliers,
        expenses,
      };

      const response = await fetch(googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setSyncStatus('synced');
      setSyncMessage('গুগল শিটে সফলভাবে ডাটা সিনক্রোনাইজ হয়েছে!');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'সিনক্রোনাইজেশন ব্যর্থ হয়েছে');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  // Google OAuth actions
  const googleSignInAction = async () => {
    try {
      setIsAuthLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setGoogleAccessToken(res.accessToken);
        setSyncStatus('synced');
        setSyncMessage(`স্বাগতম, ${res.user.displayName || 'ব্যবহারকারী'}! গুগল সফলভাবে সংযুক্ত হয়েছে।`);
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setSyncStatus('error');
      setSyncMessage(err?.message || 'গুগল সাইন ইন সম্পন্ন হতে ব্যর্থ হয়েছে');
      setTimeout(() => setSyncStatus('idle'), 5000);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const googleSignOutAction = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setGoogleAccessToken(null);
      setSyncStatus('idle');
      setSyncMessage('গুগল অ্যাকাউন্ট থেকে সাইন আউট করা হয়েছে');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const loadUserDriveSheets = async () => {
    let token = googleAccessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) return;

    try {
      setIsDriveSheetsLoading(true);
      const files = await listUserSpreadsheets(token);
      setUserDriveSheets(files);
    } catch (err) {
      console.error('Error loading Drive sheets:', err);
    } finally {
      setIsDriveSheetsLoading(false);
    }
  };

  const createAndConnectShopSheet = async (customTitle?: string): Promise<string> => {
    let token = googleAccessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('গুগল অ্যাকাউন্টে সাইন ইন প্রয়োজন');
      token = res.accessToken;
      setUser(res.user);
      setGoogleAccessToken(token);
    }

    setSyncStatus('syncing');
    setSyncMessage('আপনার গুগল ড্রাইভে নতুন গুগল শিট তৈরি হচ্ছে...');

    try {
      const title = customTitle || `Fashion Shop POS - ${new Date().toLocaleDateString('en-GB')}`;
      const result = await createShopSpreadsheet(title, token);

      setConnectedSpreadsheetId(result.spreadsheetId);
      setConnectedSpreadsheetTitle(title);
      setConnectedSpreadsheetUrl(result.spreadsheetUrl);
      localStorage.setItem('pos_gsheet_id', result.spreadsheetId);
      localStorage.setItem('pos_gsheet_title', title);
      localStorage.setItem('pos_gsheet_view_url', result.spreadsheetUrl);

      // Initial synchronization
      setSyncMessage('নতুন গুগল শিটে ডাটা সংরক্ষণ করা হচ্ছে...');
      await syncAllToGoogleSheet(
        result.spreadsheetId,
        { products, stock, sales, customers, duePayments, expenses },
        token
      );

      setSyncStatus('synced');
      setSyncMessage('নতুন গুগল শিট সফলভাবে তৈরি এবং সংযুক্ত হয়েছে!');
      setTimeout(() => setSyncStatus('idle'), 4000);
      return result.spreadsheetId;
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'গুগল শিট তৈরি করতে ব্যর্থ হয়েছে');
      setTimeout(() => setSyncStatus('idle'), 5000);
      throw err;
    }
  };

  const connectExistingSheetByIdOrUrl = async (input: string) => {
    const sheetId = extractSpreadsheetId(input);
    if (!sheetId) {
      throw new Error('অনুগ্রহ করে সঠিক গুগল শিট লিঙ্ক বা আইডি দিন');
    }

    let token = googleAccessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('গুগল অ্যাকাউন্টে সাইন ইন প্রয়োজন');
      token = res.accessToken;
      setUser(res.user);
      setGoogleAccessToken(token);
    }

    setSyncStatus('syncing');
    setSyncMessage('গুগল শিটের তথ্য যাচাই করা হচ্ছে...');

    try {
      const details = await getSpreadsheetDetails(sheetId, token);
      const viewUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

      setConnectedSpreadsheetId(sheetId);
      setConnectedSpreadsheetTitle(details.title);
      setConnectedSpreadsheetUrl(viewUrl);
      localStorage.setItem('pos_gsheet_id', sheetId);
      localStorage.setItem('pos_gsheet_title', details.title);
      localStorage.setItem('pos_gsheet_view_url', viewUrl);

      setSyncStatus('synced');
      setSyncMessage(`গুগল শিট "${details.title}" সফলভাবে কানেক্ট হয়েছে!`);
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'গুগল শিট কানেক্ট করা সম্ভব হয়নি');
      setTimeout(() => setSyncStatus('idle'), 5000);
      throw err;
    }
  };

  const disconnectSheet = () => {
    setConnectedSpreadsheetId('');
    setConnectedSpreadsheetTitle('');
    setConnectedSpreadsheetUrl('');
    localStorage.removeItem('pos_gsheet_id');
    localStorage.removeItem('pos_gsheet_title');
    localStorage.removeItem('pos_gsheet_view_url');
    setSyncStatus('idle');
    setSyncMessage('গুগল শিট সংযোগ বিচ্ছিন্ন করা হয়েছে');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const syncAllToGoogleSheetsDirect = async () => {
    if (!connectedSpreadsheetId) {
      setSyncStatus('error');
      setSyncMessage('কোনো গুগল শিট সংযুক্ত নেই। প্রথমে শিট কানেক্ট করুন।');
      return;
    }

    let token = googleAccessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('গুগল অ্যাকাউন্টে সাইন ইন প্রয়োজন');
      token = res.accessToken;
      setUser(res.user);
      setGoogleAccessToken(token);
    }

    setSyncStatus('syncing');
    setSyncMessage('গুগল শিটে ডাটা পাঠানো হচ্ছে...');

    try {
      await syncAllToGoogleSheet(
        connectedSpreadsheetId,
        { products, stock, sales, customers, duePayments, expenses },
        token
      );
      setSyncStatus('synced');
      setSyncMessage('গুগল শিটের সব ট্যাব সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'গুগল শিটে ডাটা পাঠানো ব্যর্থ হয়েছে');
      setTimeout(() => setSyncStatus('idle'), 5000);
      throw err;
    }
  };

  const importFromGoogleSheetsDirect = async () => {
    if (!connectedSpreadsheetId) {
      setSyncStatus('error');
      setSyncMessage('কোনো গুগল শিট সংযুক্ত নেই');
      return;
    }

    let token = googleAccessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      const res = await googleSignIn();
      if (!res) throw new Error('গুগল অ্যাকাউন্টে সাইন ইন প্রয়োজন');
      token = res.accessToken;
      setUser(res.user);
      setGoogleAccessToken(token);
    }

    setSyncStatus('syncing');
    setSyncMessage('গুগল শিট থেকে ডাটা রিড করা হচ্ছে...');

    try {
      const data = await importDataFromGoogleSheet(connectedSpreadsheetId, token);
      if (data.products && data.products.length > 0) setProducts(data.products);
      if (data.stock && data.stock.length > 0) setStock(data.stock);
      if (data.sales && data.sales.length > 0) setSales(data.sales);
      if (data.customers && data.customers.length > 0) setCustomers(data.customers);
      if (data.duePayments && data.duePayments.length > 0) setDuePayments(data.duePayments);
      if (data.expenses && data.expenses.length > 0) setExpenses(data.expenses);

      setSyncStatus('synced');
      setSyncMessage('গুগল শিটের সব রেকর্ড সফলভাবে সফটওয়্যারে ইমপোর্ট হয়েছে!');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'গুগল শিট থেকে ডাটা আনা ব্যর্থ হয়েছে');
      setTimeout(() => setSyncStatus('idle'), 5000);
      throw err;
    }
  };

  // Confirmation Modal controls (Mandatory Workspace Safety)
  const openExportConfirmation = () => {
    setConfirmModalState({
      isOpen: true,
      type: 'export',
      isLoading: false,
    });
  };

  const openImportConfirmation = () => {
    setConfirmModalState({
      isOpen: true,
      type: 'import',
      isLoading: false,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmModalState({
      isOpen: false,
      type: null,
      isLoading: false,
    });
  };

  const executeConfirmedSync = async () => {
    if (!confirmModalState.type) return;
    setConfirmModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (confirmModalState.type === 'export') {
        await syncAllToGoogleSheetsDirect();
      } else if (confirmModalState.type === 'import') {
        await importFromGoogleSheetsDirect();
      }
      closeConfirmationModal();
    } catch (err) {
      console.error('Confirmed sync error:', err);
      setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        stock,
        sales,
        customers,
        duePayments,
        suppliers,
        expenses,
        activeModal,
        setActiveModal,
        currentInvoiceForPrint,
        setCurrentInvoiceForPrint,
        currentUser,
        loginUser,
        logoutUser,
        firebaseStatus,
        addNewProduct,
        processSale,
        payCustomerDue,
        updateSale,
        deleteSale,
        addExpense,
        deleteExpense,
        getNextProductId,
        getNextPurchaseNo,
        getNextInvoiceNo,
        getNextExpenseId,
        user,
        googleAccessToken,
        isAuthLoading,
        googleSignInAction,
        googleSignOutAction,
        connectedSpreadsheetId,
        connectedSpreadsheetTitle,
        connectedSpreadsheetUrl,
        createAndConnectShopSheet,
        connectExistingSheetByIdOrUrl,
        disconnectSheet,
        syncAllToGoogleSheetsDirect,
        importFromGoogleSheetsDirect,
        userDriveSheets,
        loadUserDriveSheets,
        isDriveSheetsLoading,
        confirmModalState,
        openExportConfirmation,
        openImportConfirmation,
        closeConfirmationModal,
        executeConfirmedSync,
        googleSheetUrl,
        setGoogleSheetUrl,
        syncStatus,
        syncMessage,
        syncWithGoogleSheet,
        resetToSampleData,
        exportToCSV,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

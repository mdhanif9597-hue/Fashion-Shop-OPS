export interface ProductItem {
  id: string; // e.g. P0001
  date: string;
  purchaseNo: string; // e.g. PUR00006
  supplier: string;
  product: string;
  category: string;
  qty: number;
  purchasePrice: number;
  salePrice: number;
  total: number;
}

export interface StockItem {
  id: string; // e.g. P0001
  date: string;
  purchaseNo: string;
  productName: string;
  category: string;
  purchasedQty: number;
  soldQty: number;
  currentStock: number;
  salePrice: number;
  purchasePrice: number;
}

export interface SaleInvoiceItem {
  productId: string;
  productName: string;
  qty: number;
  purchasePrice: number;
  salePrice: number;
  discount: number;
  total: number;
  profit: number;
}

export interface SaleRecord {
  id: string; // Invoice No e.g. INV-1001
  invoiceNo: string;
  date: string;
  customerName: string;
  phone: string;
  items: SaleInvoiceItem[];
  // Aggregate summary fields for sheet view matching screenshot 4
  productNameSummary?: string;
  qtySummary?: number;
  salePriceSummary?: number;
  discountTotal?: number;
  purchasePriceSummary?: number;
  subtotal: number;
  discount: number;
  netTotal: number;
  payment: number;
  due: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card';
  remarks: string;
  profit: number;
}

export interface CustomerPaymentHistory {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  remarks: string;
  remainingDue: number;
}

export interface CustomerRecord {
  id: string; // e.g. CUST001
  date: string;
  customerName: string;
  phone: string;
  totalPurchase: number;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentHistory?: CustomerPaymentHistory[];
}

export interface DuePaymentRecord {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  phone: string;
  amount: number;
  paymentMethod: string;
  remarks: string;
  previousDue?: number;
  remainingDue?: number;
}

export interface SupplierRecord {
  id: string;
  date: string;
  name: string;
  phone: string;
  totalSupplied: number;
  totalPaid: number;
  totalDue: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
  paymentMethod?: string;
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  designation: string;
  phone?: string;
}

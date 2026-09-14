import {
  ProductItem,
  StockItem,
  SaleRecord,
  CustomerRecord,
  DuePaymentRecord,
  ExpenseRecord,
} from '../types';

export interface ShopDataPayload {
  products: ProductItem[];
  stock: StockItem[];
  sales: SaleRecord[];
  customers: CustomerRecord[];
  duePayments: DuePaymentRecord[];
  expenses: ExpenseRecord[];
}

export interface DriveSpreadsheetItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Extract Spreadsheet ID from standard Google Sheets URL or raw ID
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * List recent spreadsheets from the user's Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetItem[]> {
  try {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed = false");
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,modifiedTime,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list Drive files (${res.status})`);
    }

    const json = await res.json();
    return json.files || [];
  } catch (error: any) {
    console.error('Error listing user spreadsheets:', error);
    throw error;
  }
}

/**
 * Create a new Google Spreadsheet in the user's Google Drive with all shop sheets and styled headers
 */
export async function createShopSpreadsheet(
  title: string,
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const requestBody = {
    properties: {
      title: title || `Shop POS - ${new Date().toLocaleDateString('en-GB')}`,
    },
    sheets: [
      { properties: { title: 'Products', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Stock', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Sales', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Customers', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Due_Collections', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Expenses', gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create spreadsheet (${res.status})`);
  }

  const result = await res.json();
  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
  };
}

/**
 * Check spreadsheet accessibility and get sheet tab names
 */
export async function getSpreadsheetDetails(
  spreadsheetId: string,
  accessToken: string
): Promise<{ title: string; sheets: string[] }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch spreadsheet (${res.status})`);
  }

  const result = await res.json();
  const sheets = (result.sheets || []).map((s: any) => s.properties?.title || '');
  return {
    title: result.properties?.title || 'Spreadsheet',
    sheets,
  };
}

/**
 * Sync (write) all current shop data into the Google Sheet
 */
export async function syncAllToGoogleSheet(
  spreadsheetId: string,
  data: ShopDataPayload,
  accessToken: string
): Promise<{ updatedTabs: number }> {
  // 1. Ensure required sheets exist; create them if missing
  const details = await getSpreadsheetDetails(spreadsheetId, accessToken);
  const existingSheets = new Set(details.sheets);

  const neededTabs = ['Products', 'Stock', 'Sales', 'Customers', 'Due_Collections', 'Expenses'];
  const missingTabs = neededTabs.filter((tab) => !existingSheets.has(tab));

  if (missingTabs.length > 0) {
    // Add missing sheets
    const requests = missingTabs.map((title) => ({
      addSheet: {
        properties: {
          title,
          gridProperties: { frozenRowCount: 1 },
        },
      },
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
  }

  // 2. Clear old data from sheets to prevent ghost rows
  const clearPromises = neededTabs.map((tab) =>
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tab}!A1:Z:clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  );
  await Promise.all(clearPromises);

  // 3. Prepare Value Ranges
  const productsRows = [
    ['Date', 'ID', 'Purchase No', 'Supplier', 'Product Name', 'Qty', 'Purchase Price', 'Sale Price', 'Total'],
    ...data.products.map((p) => [
      p.date,
      p.id,
      p.purchaseNo,
      p.supplier,
      p.product,
      p.qty,
      p.purchasePrice,
      p.salePrice,
      p.total,
    ]),
  ];

  const stockRows = [
    ['Date', 'Product ID', 'Purchase No', 'Product Name', 'Category', 'Purchased Qty', 'Sold Qty', 'Current Stock', 'Sale Price', 'Purchase Price'],
    ...data.stock.map((s) => [
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
    ]),
  ];

  const salesRows = [
    ['Date', 'Invoice No', 'Customer Name', 'Phone', 'Product Name', 'Qty', 'Sale Price', 'Discount', 'Purchase Price', 'Payment', 'Remarks', 'Payment Method', 'Profit'],
    ...data.sales.map((s) => [
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
    ]),
  ];

  const customerRows = [
    ['Registration Date', 'Customer Name', 'Phone', 'Total Purchase', 'Total Paid', 'Total Due', 'Last Payment Date', 'Last Paid Amount'],
    ...data.customers.map((c) => [
      c.date,
      c.customerName,
      c.phone,
      c.totalPurchase,
      c.totalPaid,
      c.totalDue,
      c.lastPaymentDate || 'N/A',
      c.lastPaymentAmount || 0,
    ]),
  ];

  const dueRows = [
    ['Collection Date', 'Voucher ID', 'Customer Name', 'Phone', 'Collected Amount', 'Payment Method', 'Remaining Due', 'Remarks'],
    ...data.duePayments.map((d) => [
      d.date,
      d.id,
      d.customerName,
      d.phone,
      d.amount,
      d.paymentMethod,
      d.remainingDue ?? 0,
      d.remarks || '',
    ]),
  ];

  const expenseRows = [
    ['Date', 'Expense ID', 'Category', 'Amount', 'Note', 'Payment Method'],
    ...data.expenses.map((e) => [
      e.date,
      e.id,
      e.category,
      e.amount,
      e.note || '',
      e.paymentMethod || 'Cash',
    ]),
  ];

  const valueData = [
    { range: 'Products!A1', values: productsRows },
    { range: 'Stock!A1', values: stockRows },
    { range: 'Sales!A1', values: salesRows },
    { range: 'Customers!A1', values: customerRows },
    { range: 'Due_Collections!A1', values: dueRows },
    { range: 'Expenses!A1', values: expenseRows },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueData,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to update sheet values (${updateRes.status})`);
  }

  return { updatedTabs: valueData.length };
}

/**
 * Import shop data from Google Sheet
 */
export async function importDataFromGoogleSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<Partial<ShopDataPayload>> {
  const ranges = [
    'Products!A2:I',
    'Stock!A2:J',
    'Sales!A2:M',
    'Customers!A2:H',
    'Due_Collections!A2:H',
    'Expenses!A2:F',
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&')}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read sheet data (${res.status})`);
  }

  const json = await res.json();
  const valueRanges = json.valueRanges || [];

  const result: Partial<ShopDataPayload> = {};

  // Parse Products
  const prodRows = valueRanges[0]?.values || [];
  if (prodRows.length > 0) {
    result.products = prodRows.map((row: any[]) => ({
      date: row[0] || '',
      id: row[1] || '',
      purchaseNo: row[2] || '',
      supplier: row[3] || '',
      product: row[4] || '',
      qty: Number(row[5]) || 0,
      purchasePrice: Number(row[6]) || 0,
      salePrice: Number(row[7]) || 0,
      total: Number(row[8]) || 0,
    }));
  }

  // Parse Stock
  const stockRows = valueRanges[1]?.values || [];
  if (stockRows.length > 0) {
    result.stock = stockRows.map((row: any[]) => ({
      date: row[0] || '',
      id: row[1] || '',
      purchaseNo: row[2] || '',
      productName: row[3] || '',
      category: row[4] || '',
      purchasedQty: Number(row[5]) || 0,
      soldQty: Number(row[6]) || 0,
      currentStock: Number(row[7]) || 0,
      salePrice: Number(row[8]) || 0,
      purchasePrice: Number(row[9]) || 0,
    }));
  }

  // Parse Sales
  const salesRows = valueRanges[2]?.values || [];
  if (salesRows.length > 0) {
    result.sales = salesRows.map((row: any[]) => ({
      invoiceNo: row[1] || '',
      date: row[0] || '',
      customerName: row[2] || 'Cash Customer',
      phone: row[3] || 'N/A',
      items: [],
      productNameSummary: row[4] || '',
      qtySummary: Number(row[5]) || 0,
      salePriceSummary: Number(row[6]) || 0,
      discount: Number(row[7]) || 0,
      purchasePriceSummary: Number(row[8]) || 0,
      subtotal: Number(row[6]) || 0,
      netTotal: (Number(row[6]) || 0) - (Number(row[7]) || 0),
      payment: Number(row[9]) || 0,
      due: Math.max(0, ((Number(row[6]) || 0) - (Number(row[7]) || 0)) - (Number(row[9]) || 0)),
      paymentMethod: (row[11] as any) || 'Cash',
      profit: Number(row[12]) || 0,
      remarks: row[10] || '',
    }));
  }

  // Parse Customers
  const customerRows = valueRanges[3]?.values || [];
  if (customerRows.length > 0) {
    result.customers = customerRows.map((row: any[]) => ({
      id: `CUST-${(row[1] || '').replace(/\s+/g, '-').toLowerCase()}`,
      customerName: row[1] || '',
      phone: row[2] || '',
      date: row[0] || '',
      totalPurchase: Number(row[3]) || 0,
      totalPaid: Number(row[4]) || 0,
      totalDue: Number(row[5]) || 0,
      lastPaymentDate: row[6] || '',
      lastPaymentAmount: Number(row[7]) || 0,
    }));
  }

  // Parse Due Collections
  const dueRows = valueRanges[4]?.values || [];
  if (dueRows.length > 0) {
    result.duePayments = dueRows.map((row: any[]) => ({
      date: row[0] || '',
      id: row[1] || '',
      customerName: row[2] || '',
      phone: row[3] || '',
      amount: Number(row[4]) || 0,
      paymentMethod: row[5] || 'Cash',
      remainingDue: Number(row[6]) || 0,
      remarks: row[7] || '',
    }));
  }

  // Parse Expenses
  const expRows = valueRanges[5]?.values || [];
  if (expRows.length > 0) {
    result.expenses = expRows.map((row: any[]) => ({
      date: row[0] || '',
      id: row[1] || '',
      category: row[2] || 'General',
      amount: Number(row[3]) || 0,
      note: row[4] || '',
      paymentMethod: row[5] || 'Cash',
    }));
  }

  return result;
}

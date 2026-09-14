import React, { useState } from 'react';
import {
  Download,
  Printer,
  CloudUpload,
  Search,
  ArrowUpDown,
  Plus,
  Table as TableIcon,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  FileBarChart,
  PlusCircle,
  CreditCard,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

type TabType = 'Products' | 'Sales' | 'Stock' | 'Customers' | 'Due Collections' | 'Suppliers' | 'Expenses';

export const GoogleSheetsView: React.FC = () => {
  const {
    products,
    stock,
    sales,
    customers,
    duePayments,
    suppliers,
    expenses,
    setActiveModal,
    exportToCSV,
    connectedSpreadsheetId,
    connectedSpreadsheetTitle,
    connectedSpreadsheetUrl,
    openExportConfirmation,
    syncStatus,
    user,
  } = useShop();

  const [activeTab, setActiveTab] = useState<TabType>('Products');
  const [filterText, setFilterText] = useState<string>('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden m-4 sm:m-6">
      {/* Google Sheets Header & Toolbar */}
      <div className="bg-[#f8fafd] border-b border-slate-200 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0f9d58] text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 text-base">
                  {connectedSpreadsheetTitle || "Men's & women Fashion"}
                </h2>
                {connectedSpreadsheetId ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    গুগল শিট কানেক্টেড
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    লোকাল ডাটাবেজ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="hover:text-slate-800 cursor-pointer">File</span>
                <span className="hover:text-slate-800 cursor-pointer">Edit</span>
                <span className="hover:text-slate-800 cursor-pointer">View</span>
                <span className="hover:text-slate-800 cursor-pointer">Insert</span>
                <span className="hover:text-slate-800 cursor-pointer">Format</span>
                <span className="hover:text-slate-800 cursor-pointer">Data</span>
                {connectedSpreadsheetUrl && (
                  <a
                    href={connectedSpreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 ml-2"
                  >
                    <span>Google Sheets-এ খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="শিটে সার্চ করুন..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="text-xs pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <button
              id="sheet-report-btn"
              onClick={() => setActiveModal('report_modal')}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="তারিখ অনুযায়ী রিপোর্ট দেখুন"
            >
              <FileBarChart className="w-3.5 h-3.5 text-sky-700" />
              <span>রিপোর্ট</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'Due Collections') {
                  exportToCSV('due_payments' as any);
                } else {
                  exportToCSV(activeTab.toLowerCase() as any);
                }
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              title="CSV ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {connectedSpreadsheetId ? (
              <button
                onClick={openExportConfirmation}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1.5 bg-[#0f9d58] hover:bg-[#0b8043] disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                title="গুগল শিটে সেভ করুন"
              >
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CloudUpload className="w-3.5 h-3.5" />
                )}
                <span>শিটে সিঙ্ক করুন</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveModal('sheet_sync')}
                className="px-3 py-1.5 bg-[#0f9d58] hover:bg-[#0b8043] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Google Sheet Connect</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher tabs (Styled identical to Google Sheets at bottom) */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 pt-2 -mb-3 px-1">
          {(['Products', 'Sales', 'Stock', 'Customers', 'Due Collections', 'Suppliers', 'Expenses'] as TabType[]).map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-medium rounded-t-md transition flex items-center gap-1.5 whitespace-nowrap border-t-2 ${
                    isActive
                      ? 'bg-white border-emerald-600 text-emerald-800 font-bold shadow-xs'
                      : 'border-transparent text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{tab}</span>
                  {tab === 'Due Collections' && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full font-mono">
                      {duePayments.length}
                    </span>
                  )}
                  <span className="text-[10px] opacity-60">▼</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50/50 p-2 sm:p-4">
        {/* TAB 1: PRODUCTS (Screenshot 1) */}
        {activeTab === 'Products' && (
          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">ID</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Purchase No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Supplier</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Product</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Qty</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Purchase Price</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Sale Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {products
                    .filter((p) =>
                      filterText
                        ? p.product.toLowerCase().includes(filterText.toLowerCase()) ||
                          p.id.toLowerCase().includes(filterText.toLowerCase())
                        : true
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition">
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-bold font-mono text-emerald-700">
                          {item.id}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                          {item.purchaseNo}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                          {item.supplier}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                          {item.product}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                          {item.qty}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">
                          {item.purchasePrice}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-emerald-800 font-medium">
                          {item.salePrice}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SALES (Screenshot 4) */}
        {activeTab === 'Sales' && (
          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Invoice No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Customer Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Phone</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Product Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Qty</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Sale Price</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Discount</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Purchase Price</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Payment</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Remarks</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Payment Method</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {sales
                    .filter((s) =>
                      filterText
                        ? s.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
                          s.invoiceNo.toLowerCase().includes(filterText.toLowerCase())
                        : true
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/40 transition">
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-bold font-mono text-purple-700">
                          {item.invoiceNo}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                          {item.customerName}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                          {item.phone}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-medium">
                          {item.productNameSummary || item.items?.map((i) => i.productName).join(', ')}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                          {item.qtySummary || item.items?.reduce((a, i) => a + i.qty, 0)}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">
                          {item.subtotal}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-rose-600">
                          {item.discount}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                          {item.purchasePriceSummary || '-'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-emerald-700">
                          {item.payment}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                          {item.remarks || '-'}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 font-medium">
                          {item.paymentMethod}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                          {item.profit}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK (Screenshot 3) - Highlighting low stock in red */}
        {activeTab === 'Stock' && (
          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Id</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Purchase No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Product Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Category</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Purchased Qty</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Sold Qty</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center font-bold">Current Stock</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Sale Price</th>
                    <th className="py-2.5 px-3 text-right">Purchase Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {stock
                    .filter((s) =>
                      filterText
                        ? s.productName.toLowerCase().includes(filterText.toLowerCase()) ||
                          s.id.toLowerCase().includes(filterText.toLowerCase())
                        : true
                    )
                    .map((item, idx) => {
                      const isLowStock = item.currentStock <= 5;
                      return (
                        <tr
                          key={idx}
                          className={`transition ${
                            isLowStock
                              ? 'bg-rose-100/70 hover:bg-rose-100 font-medium'
                              : 'hover:bg-blue-50/40'
                          }`}
                        >
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                            {item.date}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold font-mono text-emerald-700">
                            {item.id}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                            {item.purchaseNo}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                            {item.productName}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                            {item.category}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold">
                            {item.purchasedQty}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-blue-700">
                            {item.soldQty}
                          </td>
                          <td
                            className={`py-2 px-3 border-r border-slate-200 text-center font-bold ${
                              isLowStock ? 'text-rose-700 font-black text-sm' : 'text-slate-900'
                            }`}
                          >
                            {item.currentStock}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-medium text-emerald-800">
                            {item.salePrice}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                            {item.purchasePrice}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS (Customer Ledger with Collection Dates & History) */}
        {activeTab === 'Customers' && (
          <div className="space-y-3">
            {/* Top quick stats & action */}
            <div className="bg-slate-100/90 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium">
                <div>
                  মোট কাস্টমার: <strong className="text-slate-900 font-bold">{customers.length} জন</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  মোট খরিদ: <strong className="text-slate-900 font-mono font-bold">৳ {customers.reduce((acc, c) => acc + (c.totalPurchase || 0), 0).toLocaleString()}</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  মোট পরিশোধ: <strong className="text-emerald-700 font-mono font-bold">৳ {customers.reduce((acc, c) => acc + (c.totalPaid || 0), 0).toLocaleString()}</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  মোট বকেয়া (Due): <strong className="text-rose-600 font-mono font-bold">৳ {customers.reduce((acc, c) => acc + (c.totalDue || 0), 0).toLocaleString()}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('due_payment')}
                  className="px-3 py-1.5 bg-[#be123c] hover:bg-[#9f1239] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>ডিউ কালেকশন এন্ট্রি</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300">Registration Date</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Customer Name</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Phone</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Total Purchase</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Total Paid</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right font-bold text-rose-700">Total Due</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-emerald-900 bg-emerald-50/60">
                        Last Collection Date (ডিউ কালেকশন তারিখ)
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right text-emerald-900 bg-emerald-50/60">
                        Last Collected (৳)
                      </th>
                      <th className="py-2.5 px-3 text-center">Collection History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {customers
                      .filter((c) =>
                        filterText
                          ? c.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
                            c.phone.toLowerCase().includes(filterText.toLowerCase()) ||
                            (c.lastPaymentDate && c.lastPaymentDate.includes(filterText))
                          : true
                      )
                      .map((item) => {
                        const isExpanded = expandedCustomerId === item.id;
                        const historyCount = item.paymentHistory?.length || 0;

                        return (
                          <React.Fragment key={item.id}>
                            <tr className="hover:bg-blue-50/40 transition">
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                                {item.date}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                                {item.customerName}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                                {item.phone}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-medium">
                                ৳ {item.totalPurchase.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold text-emerald-700">
                                ৳ {item.totalPaid.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-rose-600">
                                ৳ {item.totalDue.toLocaleString()}
                              </td>
                              {/* Last Payment Date column */}
                              <td className="py-2 px-3 border-r border-slate-200 font-mono text-emerald-800 bg-emerald-50/20">
                                {item.lastPaymentDate ? (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-emerald-600" />
                                    <span>{item.lastPaymentDate}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">কোনো কালেকশন নেই</span>
                                )}
                              </td>
                              {/* Last Payment Amount column */}
                              <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                                {item.lastPaymentAmount ? `৳ ${item.lastPaymentAmount.toLocaleString()}` : '-'}
                              </td>
                              {/* Payment History toggle action */}
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedCustomerId(isExpanded ? null : item.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 transition ${
                                    isExpanded
                                      ? 'bg-slate-800 text-white'
                                      : historyCount > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                  title="কালেকশন তারিখ ও হিস্ট্রি দেখুন"
                                >
                                  <History className="w-3 h-3" />
                                  <span>রেকর্ড ({historyCount})</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Customer Payment History Row */}
                            {isExpanded && (
                              <tr className="bg-emerald-50/40 border-b border-emerald-200">
                                <td colSpan={9} className="p-3">
                                  <div className="bg-white rounded-md border border-emerald-200 p-3 shadow-2xs">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                        <History className="w-4 h-4 text-emerald-600" />
                                        <span>
                                          {item.customerName} - এর ডিউ পেমেন্ট কালেকশন হিস্ট্রি ({historyCount} টি)
                                        </span>
                                      </div>
                                      {item.totalDue > 0 && (
                                        <button
                                          onClick={() => setActiveModal('due_payment')}
                                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>আরও ডিউ জমা করুন (বাকি ৳{item.totalDue})</span>
                                        </button>
                                      )}
                                    </div>

                                    {historyCount > 0 ? (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border border-slate-200 rounded">
                                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                                            <tr>
                                              <th className="py-1.5 px-2.5">কালেকশনের তারিখ ও সময়</th>
                                              <th className="py-1.5 px-2.5 text-right">আদায়কৃত টাকা</th>
                                              <th className="py-1.5 px-2.5">পেমেন্ট মেথড</th>
                                              <th className="py-1.5 px-2.5 text-right">পরিশোধ পরবর্তী বাকি</th>
                                              <th className="py-1.5 px-2.5">মন্তব্য / বিবরণ</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {item.paymentHistory?.map((h) => (
                                              <tr key={h.id} className="hover:bg-slate-50/80">
                                                <td className="py-1.5 px-2.5 font-mono text-slate-800 font-semibold">
                                                  {h.date}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-emerald-700">
                                                  ৳ {h.amount.toLocaleString()}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-slate-600">
                                                  {h.paymentMethod}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-right font-mono text-slate-700">
                                                  ৳ {h.remainingDue?.toLocaleString() ?? 0}
                                                </td>
                                                <td className="py-1.5 px-2.5 text-slate-500">
                                                  {h.remarks || '-'}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic py-2 text-center">
                                        এই কাস্টমারের এখনো কোনো ডিউ কালেকশন রেকর্ড তৈরি হয়নি।
                                      </p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DUE COLLECTIONS (Dedicated Due Collection Sheet) */}
        {activeTab === 'Due Collections' && (
          <div className="space-y-3">
            <div className="bg-slate-100/90 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium">
                <div>
                  মোট কালেকশন সংখ্যা: <strong className="text-slate-900 font-bold">{duePayments.length} টি</strong>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  মোট আদায়কৃত টাকা: <strong className="text-emerald-700 font-mono font-bold">৳ {duePayments.reduce((acc, d) => acc + (d.amount || 0), 0).toLocaleString()}</strong>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('due_payment')}
                className="px-3 py-1.5 bg-[#be123c] hover:bg-[#9f1239] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন ডিউ কালেকশন</span>
              </button>
            </div>

            <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300">Date (কালেকশনের তারিখ ও সময়)</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Voucher No</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Customer Name</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Phone</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right text-emerald-800">Collected Amount (৳)</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Payment Method</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Remaining Due (৳)</th>
                      <th className="py-2.5 px-3">Remarks / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {duePayments
                      .filter((d) =>
                        filterText
                          ? d.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
                            d.phone.includes(filterText) ||
                            d.id.toLowerCase().includes(filterText.toLowerCase()) ||
                            d.date.includes(filterText)
                          : true
                      )
                      .map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-blue-50/40 transition">
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-mono text-[11px] font-semibold">
                            {item.date}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-purple-700">
                            {item.id}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                            {item.customerName}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                            {item.phone}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-emerald-700">
                            ৳ {item.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-700">
                            {item.paymentMethod}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold text-rose-600">
                            ৳ {item.remainingDue?.toLocaleString() ?? 0}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    {duePayments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          এখনো কোনো ডিউ কালেকশন রেকর্ড তৈরি করা হয়নি
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUPPLIERS */}
        {activeTab === 'Suppliers' && (
          <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Supplier Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Phone</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Total Supplied</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right">Total Paid</th>
                    <th className="py-2.5 px-3 text-right font-bold text-rose-700">Total Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {suppliers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition">
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                        {item.date}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">
                        {item.phone}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-medium">
                        ৳ {item.totalSupplied}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-emerald-700">
                        ৳ {item.totalPaid}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">
                        ৳ {item.totalDue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: EXPENSES */}
        {activeTab === 'Expenses' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  দোকানের প্রতিদিনের খরচের খাতা (Daily Shop Expenses)
                </span>
                <span className="text-[11px] bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded-full font-mono font-medium">
                  {expenses.length} টি রেকর্ড
                </span>
              </div>
              <button
                id="sheet-add-expense-btn"
                onClick={() => setActiveModal('expense_entry')}
                className="px-3 py-1.5 bg-[#1e824c] hover:bg-[#166534] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ নতুন খরচ এন্ট্রি করুন</span>
              </button>
            </div>

            <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#e2e8f0] text-slate-700 font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300">Date</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Expense ID</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Category</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Amount</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Payment Method</th>
                      <th className="py-2.5 px-3">Note / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {expenses
                      .filter((e) =>
                        filterText
                          ? e.category.toLowerCase().includes(filterText.toLowerCase()) ||
                            e.note.toLowerCase().includes(filterText.toLowerCase()) ||
                            e.id.toLowerCase().includes(filterText.toLowerCase())
                          : true
                      )
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition">
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                            {item.date}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                            {item.id}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                            {item.category}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-rose-600">
                            ৳ {item.amount?.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-medium">
                            {item.paymentMethod || 'Cash'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.note}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

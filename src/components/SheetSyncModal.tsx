import React, { useState, useEffect } from 'react';
import {
  X,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Plus,
  Link,
  LogOut,
  RefreshCw,
  FolderOpen,
  ArrowUpFromLine,
  ArrowDownToLine,
  ShieldCheck,
  Code,
  FileCode,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const SheetSyncModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    googleSheetUrl,
    setGoogleSheetUrl,
    syncStatus,
    syncMessage,
    syncWithGoogleSheet,
    exportToCSV,
    resetToSampleData,
    user,
    isAuthLoading,
    googleSignInAction,
    googleSignOutAction,
    connectedSpreadsheetId,
    connectedSpreadsheetTitle,
    connectedSpreadsheetUrl,
    createAndConnectShopSheet,
    connectExistingSheetByIdOrUrl,
    disconnectSheet,
    openExportConfirmation,
    openImportConfirmation,
    userDriveSheets,
    loadUserDriveSheets,
    isDriveSheetsLoading,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'appscript_host' | 'oauth' | 'webhook' | 'csv'>('appscript_host');
  const [sheetInput, setSheetInput] = useState<string>('');
  const [newSheetTitle, setNewSheetTitle] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCodeGs, setCopiedCodeGs] = useState<boolean>(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState<boolean>(false);
  const [codeGsText, setCodeGsText] = useState<string>('');
  const [indexHtmlText, setIndexHtmlText] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  useEffect(() => {
    fetch('/google-apps-script/Code.gs')
      .then((r) => r.text())
      .then((t) => setCodeGsText(t))
      .catch((e) => console.error(e));

    fetch('/google-apps-script/Index.html')
      .then((r) => r.text())
      .then((t) => setIndexHtmlText(t))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (activeModal === 'sheet_sync' && user) {
      loadUserDriveSheets();
    }
  }, [activeModal, user]);

  if (activeModal !== 'sheet_sync') return null;

  const handleCreateNewSheet = async () => {
    try {
      setIsCreatingSheet(true);
      await createAndConnectShopSheet(newSheetTitle.trim() || undefined);
      setNewSheetTitle('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!sheetInput.trim()) return;
    try {
      setIsConnecting(true);
      await connectExistingSheetByIdOrUrl(sheetInput.trim());
      setSheetInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectFromDrive = async (sheetId: string) => {
    try {
      setIsConnecting(true);
      await connectExistingSheetByIdOrUrl(sheetId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  const fullAppsScript = `// ============================================================================
// Fashion Shop POS & Inventory Management - Apps Script (Auto-Sync Webhook)
// Instructions:
// 1. Google Sheets-এ যান -> Extensions -> Apps Script খুলুন।
// 2. আগের সব কোড মুছে এই সম্পূর্ণ কোডটি পেস্ট করুন।
// 3. Deploy -> New deployment -> Select type: "Web app"
// 4. Description: "Fashion POS Sync"
// 5. Execute as: "Me"
// 6. Who has access: "Anyone"
// 7. Deploy বাটনে ক্লিক করে প্রাপ্ত Web App URL টি সফটওয়্যারে পেস্ট করুন।
// ============================================================================

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUrl = ss.getUrl();
  var sheetName = ss.getName();
  
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>POS Sync Webhook</title>' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; text-align: center; }' +
    '.card { max-width: 550px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }' +
    '.badge { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; display: inline-block; margin-bottom: 16px; }' +
    'h1 { font-size: 22px; margin: 0 0 12px; color: #0f172a; }' +
    'p { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 24px; }' +
    '.btn { display: inline-block; background: #0f9d58; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; }' +
    '.btn:hover { background: #0b8043; }' +
    '.note { margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="badge">✓ Webhook Active & Connected</div>' +
    '<h1>Fashion POS Webhook চালু আছে!</h1>' +
    '<p>এই ওয়েব অ্যাপ লিঙ্কটি আপনার POS সফটওয়্যার থেকে স্বয়ংক্রিয়ভাবে হিসাব গ্রহণ করে এই গুগল শিটে সেভ করার জন্য তৈরি।</p>' +
    '<a href="' + sheetUrl + '" target="_blank" class="btn">📊 আসল গুগল শিটটি খুলুন (' + sheetName + ')</a>' +
    '<div class="note">সফটওয়্যার ব্যবহারের জন্য অনুগ্রহ করে আপনার POS ওয়েবসাইটে যান। এখানে আপনার শিটে ডাটা রিসিভ হচ্ছে।</div>' +
    '</div></body></html>';
    
  return HtmlService.createHtmlOutput(html)
    .setTitle("POS Webhook Status")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Products Sheet
    if (data.products && data.products.length > 0) {
      var prodSheet = ss.getSheetByName("Products") || ss.insertSheet("Products");
      prodSheet.clear();
      var prodHeaders = ["Product ID", "Product Name", "Category", "Purchase Price", "Sale Price", "Current Stock", "Status"];
      var prodRows = [prodHeaders];
      data.products.forEach(function(p) {
        prodRows.push([
          p.id || "",
          p.name || "",
          p.category || "",
          p.purchasePrice || 0,
          p.salePrice || 0,
          p.currentStock || 0,
          p.status || "In Stock"
        ]);
      });
      prodSheet.getRange(1, 1, prodRows.length, prodHeaders.length).setValues(prodRows);
      prodSheet.getRange(1, 1, 1, prodHeaders.length).setBackground("#1e824c").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 2. Stock Sheet
    if (data.stock && data.stock.length > 0) {
      var stockSheet = ss.getSheetByName("Stock") || ss.insertSheet("Stock");
      stockSheet.clear();
      var stockHeaders = ["Product ID", "Product Name", "Purchase Qty", "Sold Qty", "Available Stock", "Supplier", "Last Updated"];
      var stockRows = [stockHeaders];
      data.stock.forEach(function(s) {
        stockRows.push([
          s.productId || "",
          s.productName || "",
          s.purchaseQty || 0,
          s.soldQty || 0,
          s.currentStock || 0,
          s.supplier || "",
          s.lastUpdated || new Date().toISOString()
        ]);
      });
      stockSheet.getRange(1, 1, stockRows.length, stockHeaders.length).setValues(stockRows);
      stockSheet.getRange(1, 1, 1, stockHeaders.length).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 3. Sales Sheet
    if (data.sales && data.sales.length > 0) {
      var salesSheet = ss.getSheetByName("Sales") || ss.insertSheet("Sales");
      salesSheet.clear();
      var salesHeaders = ["Invoice No", "Date", "Customer Name", "Phone", "Items Summary", "Subtotal", "Discount", "Net Total", "Paid Amount", "Due Amount", "Payment Method", "Remarks"];
      var salesRows = [salesHeaders];
      data.sales.forEach(function(s) {
        var itemsSummary = (s.items || []).map(function(it) {
          return (it.productName || "") + " (" + (it.qty || 1) + "x" + (it.salePrice || 0) + ")";
        }).join("; ");
        salesRows.push([
          s.invoiceNo || "",
          s.date || "",
          s.customerName || "",
          s.phone || "",
          itemsSummary,
          s.subtotal || 0,
          s.discount || 0,
          s.netTotal || 0,
          s.payment || 0,
          s.due || 0,
          s.paymentMethod || "Cash",
          s.remarks || ""
        ]);
      });
      salesSheet.getRange(1, 1, salesRows.length, salesHeaders.length).setValues(salesRows);
      salesSheet.getRange(1, 1, 1, salesHeaders.length).setBackground("#7c3aed").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 4. Customers Sheet
    if (data.customers && data.customers.length > 0) {
      var custSheet = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
      custSheet.clear();
      var custHeaders = ["Customer ID", "Customer Name", "Phone", "Total Purchases", "Total Paid", "Current Due", "Status"];
      var custRows = [custHeaders];
      data.customers.forEach(function(c) {
        custRows.push([
          c.id || "",
          c.name || "",
          c.phone || "",
          c.totalPurchases || 0,
          c.totalPaid || 0,
          c.currentDue || 0,
          c.status || "Regular"
        ]);
      });
      custSheet.getRange(1, 1, custRows.length, custHeaders.length).setValues(custRows);
      custSheet.getRange(1, 1, 1, custHeaders.length).setBackground("#dc2626").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 5. Due Collections Sheet
    if (data.duePayments && data.duePayments.length > 0) {
      var dueSheet = ss.getSheetByName("Due_Collections") || ss.insertSheet("Due_Collections");
      dueSheet.clear();
      var dueHeaders = ["Collection Date", "Collection ID", "Customer Name", "Phone", "Amount Collected", "Payment Method", "Remaining Due", "Remarks"];
      var dueRows = [dueHeaders];
      data.duePayments.forEach(function(d) {
        dueRows.push([
          d.date || "",
          d.id || "",
          d.customerName || "",
          d.phone || "",
          d.amount || 0,
          d.paymentMethod || "Cash",
          d.remainingDue || 0,
          d.remarks || ""
        ]);
      });
      dueSheet.getRange(1, 1, dueRows.length, dueHeaders.length).setValues(dueRows);
      dueSheet.getRange(1, 1, 1, dueHeaders.length).setBackground("#d97706").setFontColor("#ffffff").setFontWeight("bold");
    }

    // 6. Expenses Sheet
    if (data.expenses && data.expenses.length > 0) {
      var expSheet = ss.getSheetByName("Expenses") || ss.insertSheet("Expenses");
      expSheet.clear();
      var expHeaders = ["Date", "Expense ID", "Category", "Amount", "Note", "Payment Method"];
      var expRows = [expHeaders];
      data.expenses.forEach(function(e) {
        expRows.push([
          e.date || "",
          e.id || "",
          e.category || "",
          e.amount || 0,
          e.note || "",
          e.paymentMethod || "Cash"
        ]);
      });
      expSheet.getRange(1, 1, expRows.length, expHeaders.length).setValues(expRows);
      expSheet.getRange(1, 1, 1, expHeaders.length).setBackground("#0d9488").setFontColor("#ffffff").setFontWeight("bold");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "All 6 tabs synchronized successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0f9d58] text-white px-5 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight">
                গুগল শিট ইন্টিগ্রেশন ও ডাটা সিঙ্ক
              </h2>
              <p className="text-xs text-white/80">
                Google Sheets API & OAuth 2.0 Integration
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('appscript_host')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'appscript_host'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-md shadow-2xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Apps Script-এ চালান (Code.gs ও Index.html)</span>
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'oauth'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>গুগল ড্রাইভ ও শিটস (Direct OAuth API)</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'webhook'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Apps Script Webhook (বিকল্প)</span>
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'csv'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-md shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV / Excel ডাউনলোড</span>
          </button>
        </div>

        {/* Status Message */}
        {syncMessage && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg flex items-center gap-2 text-xs ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : syncStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {syncStatus === 'synced' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : syncStatus === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            )}
            <span className="font-medium">{syncMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {activeTab === 'appscript_host' && (
            <div className="space-y-4">
              {/* Highlight Guide */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Code className="w-4 h-4 text-emerald-700" />
                  <span>গুগল শিট Apps Script-এ সফটওয়্যারটি সরাসরি চালানোর নিয়ম:</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  গুগল অ্যাপস স্ক্রিপ্টে ঠিক <strong>২টি ফাইল</strong> তৈরি করতে হয়: একটি <code>Code.gs</code> এবং অন্যটি <code>Index.html</code>। 
                  নিচের দুটি ফাইল কপি বা ডাউনলোড করে আপনার গুগল শিটের Apps Script-এ পেস্ট করে Deploy করলেই এই পুরো সফটওয়্যারটি গুগল সার্ভার থেকে সরাসরি লাইভ চলবে!
                </p>
              </div>

              {/* 4 Steps */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  সহজ ৪টি ধাপ (Step-by-Step):
                </h4>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <p>আপনার গুগল শিট খুলে মেনু থেকে <strong>Extensions &rarr; Apps Script</strong>-এ যান।</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <p>স্ক্রিপ্টে থাকা <strong>Code.gs</strong> ফাইলের সব কোড মুছে নিচের <strong>Code.gs</strong> কোডটি পেস্ট করুন এবং Save করুন।</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <p>বাম পাশের <strong>Files</strong> এর পাশে <strong><code>+</code> (Add file)</strong>-এ ক্লিক করে <strong>HTML</strong> নির্বাচন করুন এবং ফাইলের নাম দিন ঠিক <strong>Index</strong>। এরপর নিচের <strong>Index.html</strong> এর কোড পেস্ট করে Save করুন।</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <p>উপরে <strong>Deploy &rarr; New deployment &rarr; Web app</strong> সিলেক্ট করে <em>Execute as: Me</em> এবং <em>Who has access: Anyone</em> দিয়ে <strong>Deploy</strong> করুন। প্রাপ্ত লিঙ্কে ঢুকলেই সফটওয়্যার ওপেন হবে!</p>
                  </div>
                </div>
              </div>

              {/* 2 Files Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* File 1: Code.gs */}
                <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold text-white text-xs">১. Code.gs</span>
                        <p className="text-[10px] text-slate-400">Google Apps Script ফাইল (সার্ভার কোড)</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">.gs</span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    এটি গুগল শিটের সাথে যোগাযোগ, মেনু তৈরি এবং ৬টি ট্যাব ফরম্যাট করে।
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const content = codeGsText || fullAppsScript;
                        navigator.clipboard.writeText(content);
                        setCopiedCodeGs(true);
                        setTimeout(() => setCopiedCodeGs(false), 2500);
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedCodeGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeGs ? 'কপি হয়েছে!' : 'Code.gs কপি করুন'}</span>
                    </button>
                    <a
                      href="/google-apps-script/Code.gs"
                      download="Code.gs"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>
                </div>

                {/* File 2: Index.html */}
                <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="font-bold text-white text-xs">২. Index.html</span>
                        <p className="text-[10px] text-slate-400">HTML, CSS ও JavaScript (ইউজার ইন্টারফেস)</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono">.html</span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    এতে সম্পূর্ণ ড্যাশবোর্ড, ক্যাশ মেমো, প্রোডাক্ট এন্ট্রি, বাকি জমা ও ৬টি শিটের ভিউ যুক্ত আছে।
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (indexHtmlText) {
                          navigator.clipboard.writeText(indexHtmlText);
                          setCopiedIndexHtml(true);
                          setTimeout(() => setCopiedIndexHtml(false), 2500);
                        } else {
                          fetch('/google-apps-script/Index.html')
                            .then((r) => r.text())
                            .then((txt) => {
                              navigator.clipboard.writeText(txt);
                              setCopiedIndexHtml(true);
                              setTimeout(() => setCopiedIndexHtml(false), 2500);
                            });
                        }
                      }}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedIndexHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndexHtml ? 'কপি হয়েছে!' : 'Index.html কপি করুন'}</span>
                    </button>
                    <a
                      href="/google-apps-script/Index.html"
                      download="Index.html"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Extra bonus menu note */}
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-900 flex items-start gap-2">
                <span className="text-base">💡</span>
                <p>
                  <strong>শিটের ভেতর কাস্টম মেনু:</strong> এই <code>Code.gs</code> ফাইলটি দিলে আপনার গুগল শিট রিফ্রেশ করলে উপরে <strong>"🏪 POS System"</strong> নামের একটি নতুন মেনু দেখতে পাবেন, যার ভেতর <em>"সফটওয়্যার ড্যাশবোর্ড খুলুন"</em> অপশন থেকে গুগল শিটের ভেতর পপ-আপেই সফটওয়্যার চালানো যাবে!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'oauth' && (
            <div className="space-y-4">
              {/* Account Status Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200 text-sm">
                      {user?.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {user ? user.displayName || 'Google Account' : 'গুগল অ্যাকাউন্ট সংযুক্ত নেই'}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {user ? user.email : 'গুগল শিটস ও ড্রাইভ API ব্যবহারের জন্য সাইন ইন করুন'}
                    </p>
                  </div>
                </div>

                <div>
                  {user ? (
                    <button
                      onClick={googleSignOutAction}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>সাইন আউট</span>
                    </button>
                  ) : (
                    <GoogleSignInButton
                      onClick={googleSignInAction}
                      isLoading={isAuthLoading}
                      label="Sign in with Google"
                    />
                  )}
                </div>
              </div>

              {/* Connected Sheet Details */}
              {connectedSpreadsheetId ? (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {connectedSpreadsheetTitle || 'Shop Google Sheet'}
                          </h4>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            সক্রিয় সংযোগ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: {connectedSpreadsheetId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {connectedSpreadsheetUrl && (
                        <a
                          href={connectedSpreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-2xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>গুগল শিট খুলুন</span>
                        </a>
                      )}
                      <button
                        onClick={disconnectSheet}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-300 text-xs transition"
                      >
                        সংযোগ বিচ্ছিন্ন
                      </button>
                    </div>
                  </div>

                  {/* 2-Way Direct Sync Buttons */}
                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2.5">
                    <button
                      id="btn-sync-to-google-sheet"
                      type="button"
                      onClick={openExportConfirmation}
                      disabled={syncStatus === 'syncing'}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f9d58] hover:bg-[#0b8043] disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition"
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                      <span>গুগল শিটে সব ডাটা পাঠান (Sync to Sheet)</span>
                    </button>

                    <button
                      id="btn-import-from-google-sheet"
                      type="button"
                      onClick={openImportConfirmation}
                      disabled={syncStatus === 'syncing'}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>গুগল শিট থেকে ডাটা আনুন (Import from Sheet)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Create New Sheet Option */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>অপশন ১: ১-ক্লিকে ড্রাইভে নতুন গুগল শিট তৈরি করুন</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      এটি আপনার গুগল ড্রাইভে স্বয়ংক্রিয়ভাবে ৬টি ট্যাব সহ (Products, Stock, Sales, Customers, Due_Collections, Expenses) একটি প্রস্তুত গুগল শিট তৈরি করবে এবং বর্তমান সব ডাটা সিঙ্ক করে দেবে।
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="শিটের নাম (যেমন: Fashion POS Shop)"
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewSheet}
                        disabled={isCreatingSheet || syncStatus === 'syncing'}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition whitespace-nowrap"
                      >
                        {isCreatingSheet ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>নতুন গুগল শিট তৈরি করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Connect Existing Sheet Option */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Link className="w-4 h-4 text-blue-600" />
                      <span>অপশন ২: বিদ্যমান গুগল শিটের লিঙ্ক বা আইডি দিন</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      আপনার পূর্বে তৈরিকৃত গুগল স্প্রেডশিটের URL (যেমন: https://docs.google.com/spreadsheets/d/...) অথবা Spreadsheet ID পেস্ট করুন।
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                        value={sheetInput}
                        onChange={(e) => setSheetInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleConnectExisting}
                        disabled={isConnecting || !sheetInput.trim()}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition whitespace-nowrap"
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>যাচাই হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Link className="w-3.5 h-3.5" />
                            <span>শিট কানেক্ট করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Drive Spreadsheets Browser */}
                  {user && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                          <FolderOpen className="w-4 h-4 text-amber-600" />
                          <span>অপশন ৩: আপনার গুগল ড্রাইভ থেকে শিট পছন্দ করুন</span>
                        </div>
                        <button
                          type="button"
                          onClick={loadUserDriveSheets}
                          disabled={isDriveSheetsLoading}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px]"
                        >
                          <RefreshCw className={`w-3 h-3 ${isDriveSheetsLoading ? 'animate-spin' : ''}`} />
                          <span>রিফ্রেশ</span>
                        </button>
                      </div>

                      {isDriveSheetsLoading ? (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          গুগল ড্রাইভ ফাইল লোড হচ্ছে...
                        </div>
                      ) : userDriveSheets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                          {userDriveSheets.map((file) => (
                            <div
                              key={file.id}
                              onClick={() => handleConnectFromDrive(file.id)}
                              className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg cursor-pointer transition flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 text-xs truncate group-hover:text-emerald-800">
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                                কানেক্ট
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px] italic">
                          আপনার ড্রাইভে কোনো স্প্রেডশিট পাওয়া যায়নি। উপরে 'নতুন গুগল শিট তৈরি করুন' বাটনে ক্লিক করে তৈরি করতে পারেন।
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800">
                  গুগল শিট ওয়েব অ্যাপ ইউআরএল (Google Apps Script Web App URL):
                </label>
                <div className="flex gap-2">
                  <input
                    id="gsheet-webhook-url-input"
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    id="sync-now-btn"
                    type="button"
                    onClick={syncWithGoogleSheet}
                    disabled={syncStatus === 'syncing'}
                    className="px-4 py-2 bg-[#0f9d58] hover:bg-[#0b8043] disabled:opacity-50 text-white font-bold rounded-md flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{syncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে...' : 'Webhook সিঙ্ক'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  আপনার গুগল শিটের <em>Extensions → Apps Script</em> থেকে Web App হিসেবে ডিপ্লয় করে URL টি এখানে দিন।
                </p>
              </div>

              {/* Explanatory note to resolve user confusion */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>গুরুত্বপূর্ণ তথ্য: Web App URL কীভাবে কাজ করে?</span>
                </p>
                <p>
                  ১. Apps Script Web App লিঙ্কটি একটি ব্যাকএন্ড ডাটা রিসিভার (Webhook)। ব্রাউজারে সরাসরি এই লিঙ্কে ঢুকলে এই সফটওয়্যারটি আসবে না, কারণ সফটওয়্যারটি এখানেই চলছে।
                </p>
                <p>
                  ২. আপনি এই স্ক্রিন থেকে হিসাব-নিকাশ করবেন এবং "Webhook সিঙ্ক" বাটনে চাপ দিলে আপনার হিসাব স্বয়ংক্রিয়ভাবে আপনার <strong>আসল গুগল স্প্রেডশিটে (Google Spreadsheet)</strong> চলে যাবে।
                </p>
                <p>
                  ৩. <strong>আরও সহজ পদ্ধতি:</strong> কোনো Apps Script কোড বা URL ছাড়াই সরাসরি ১-ক্লিকে সিঙ্ক করতে উপরের <strong>"গুগল ড্রাইভ ও শিটস (Direct OAuth API)"</strong> ট্যাবটি ব্যবহার করতে পারেন।
                </p>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Google Apps Script কোড:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fullAppsScript);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono overflow-x-auto p-2 bg-slate-950 rounded text-slate-300 max-h-40">
                  {fullAppsScript}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-800 block text-sm">
                সরাসরি CSV ফাইল ডাউনলোড করুন:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => exportToCSV('products')}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Products.csv</span>
                </button>
                <button
                  onClick={() => exportToCSV('stock')}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Stock.csv</span>
                </button>
                <button
                  onClick={() => exportToCSV('sales')}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-purple-600" />
                  <span>Sales.csv</span>
                </button>
                <button
                  onClick={() => exportToCSV('customers')}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-rose-600" />
                  <span>Customers.csv</span>
                </button>
                <button
                  onClick={() => exportToCSV('due_payments' as any)}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Due_Collections.csv</span>
                </button>
                <button
                  onClick={() => exportToCSV('expenses')}
                  className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 font-medium transition shadow-2xs"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>Expenses.csv</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => exportToCSV('all')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-2 transition text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>সবগুলো ফাইল একসাথে ডাউনলোড করুন (.zip/csv)</span>
                </button>
              </div>
            </div>
          )}

          {/* Reset button */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('আপনি কি পূর্বনির্ধারিত স্ক্রিনশটের ডেমো ডাটায় রিসেট করতে চান?')) {
                  resetToSampleData();
                  setActiveModal('none');
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>স্ক্রিনশটের ডেমো ডাটায় রিসেট করুন</span>
            </button>
            <span className="text-[11px] text-slate-400">লোকাল ব্রাউজারে সুরক্ষিত</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

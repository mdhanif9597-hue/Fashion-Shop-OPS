import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { SaleRecord } from '../types';

/**
 * Builds a standalone, self-contained HTML document for the cash memo receipt.
 * Includes inline CSS and an auto-print script so it can be printed directly via iframe,
 * opened in a fresh tab, or downloaded and opened in any browser to trigger instant printing.
 */
export const buildInvoiceHtml = (invoice: SaleRecord): string => {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ক্যাশ মেমো - ${invoice.invoiceNo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      margin: 6mm;
      size: auto;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0f172a;
      padding: 16px;
      font-size: 13px;
      line-height: 1.45;
      max-width: 580px;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #94a3b8;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .shop-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .shop-sub {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .shop-phone {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      margin-top: 2px;
    }
    .meta-box {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 12px;
      font-size: 12px;
    }
    .meta-col {
      line-height: 1.5;
    }
    .meta-right {
      text-align: right;
    }
    .bold {
      font-weight: 700;
      color: #0f172a;
    }
    .invoice-tag {
      color: #15803d;
      font-weight: 800;
      font-family: monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 12px;
    }
    th {
      border-bottom: 2px solid #0f172a;
      text-align: left;
      padding: 6px 4px;
      font-weight: 700;
      color: #0f172a;
    }
    td {
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 4px;
      color: #1e293b;
      vertical-align: top;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .font-mono {
      font-family: monospace;
    }
    .totals {
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      font-size: 12px;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      color: #475569;
    }
    .net-row {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      padding-top: 5px;
      margin-top: 4px;
    }
    .paid-row {
      font-weight: 700;
      color: #15803d;
    }
    .due-row {
      font-weight: 700;
      color: #dc2626;
    }
    .due-alert {
      margin-top: 10px;
      padding: 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      text-align: center;
      color: #b91c1c;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 42px;
      padding: 0 16px;
      font-size: 11px;
      color: #64748b;
    }
    .sig-line {
      border-top: 1px solid #94a3b8;
      width: 120px;
      text-align: center;
      padding-top: 4px;
    }
    .footer {
      text-align: center;
      border-top: 1px dashed #cbd5e1;
      margin-top: 24px;
      padding-top: 10px;
    }
    .footer p {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
    .footer small {
      font-size: 10px;
      color: #94a3b8;
      font-family: monospace;
      margin-top: 3px;
      display: block;
    }
    .no-print-bar {
      margin-bottom: 16px;
      padding: 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      text-align: center;
    }
    .no-print-btn {
      background: #1e824c;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      font-size: 13px;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        padding: 4mm !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="no-print-btn" onclick="window.print()">🖨️ প্রিন্ট করুন (Print Now)</button>
  </div>

  <div class="header">
    <div class="shop-title">Men's & women Fashion</div>
    <div class="shop-sub">প্রিমিয়াম গার্মেন্টস ও লাইফস্টাইল কালেকশন</div>
    <div class="shop-phone">ফোন: 01322-996278 • ঢাকা, বাংলাদেশ</div>
  </div>

  <div class="meta-box">
    <div class="meta-col">
      <div>ইনভয়েস নং: <span class="invoice-tag">${invoice.invoiceNo}</span></div>
      <div>তারিখ: ${invoice.date}</div>
      <div>পেমেন্ট মেথড: <span class="bold">${invoice.paymentMethod}</span></div>
    </div>
    <div class="meta-col meta-right">
      <div>গ্রাহক: <span class="bold">${invoice.customerName}</span></div>
      <div>মোবাইল: <span class="font-mono">${invoice.phone}</span></div>
      ${invoice.remarks ? `<div>নোট: <i>${invoice.remarks}</i></div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 25px;">নং</th>
        <th>বিবরণ (Item)</th>
        <th class="text-center" style="width: 45px;">পরিমাণ</th>
        <th class="text-right" style="width: 70px;">দর (৳)</th>
        <th class="text-right" style="width: 80px;">মোট (৳)</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${item.productName}</strong>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">${item.productId}</div>
          </td>
          <td class="text-center bold">${item.qty}</td>
          <td class="text-right font-mono">৳ ${item.salePrice}</td>
          <td class="text-right bold font-mono">৳ ${item.total}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="tot-row">
      <span>সাবটোটাল (Subtotal):</span>
      <span class="font-mono">৳ ${invoice.subtotal}</span>
    </div>
    ${
      invoice.discount > 0
        ? `
      <div class="tot-row" style="color: #15803d;">
        <span>বিশেষ ডিসকাউন্ট (Discount):</span>
        <span class="font-mono">- ৳ ${invoice.discount}</span>
      </div>
    `
        : ''
    }
    <div class="tot-row net-row">
      <span>সর্বমোট বিল (Net Total):</span>
      <span class="font-mono">৳ ${invoice.netTotal}</span>
    </div>
    <div class="tot-row paid-row">
      <span>পরিশোধিত টাকা (Paid):</span>
      <span class="font-mono">৳ ${invoice.payment}</span>
    </div>
    <div class="tot-row ${invoice.due > 0 ? 'due-row' : ''}">
      <span>বকেয়া (Due):</span>
      <span class="font-mono">${invoice.due > 0 ? `৳ ${invoice.due}` : 'পরিশোধিত'}</span>
    </div>
  </div>

  ${
    invoice.due > 0
      ? `
    <div class="due-alert">
      আপনার বকেয়া ৳${invoice.due} কাস্টমার লেজারে যুক্ত হয়েছে।
    </div>
  `
      : ''
  }

  <div class="signatures">
    <div class="sig-line">গ্রাহকের স্বাক্ষর</div>
    <div class="sig-line">অনুমোদিত স্বাক্ষর</div>
  </div>

  <div class="footer">
    <p>ধন্যবাদ! আবার আসবেন।</p>
    <small>সফটওয়্যার সহযোগিতায়: POS & Inventory System</small>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print error', e);
        }
      }, 350);
    };
  </script>
</body>
</html>`;
};

export const InvoicePrintModal: React.FC = () => {
  const { activeModal, setActiveModal, currentInvoiceForPrint } = useShop();
  const [printStatus, setPrintStatus] = useState<string>('');

  const isOpen = activeModal === 'invoice_print';
  const invoice = currentInvoiceForPrint;

  if (!isOpen || !invoice) return null;

  /**
   * Universal Print Handler:
   * 1. Attempts printing via an isolated invisible iframe to avoid page clipping
   * 2. Calls window.print() simultaneously with specialized @media print CSS
   * 3. Gives visual feedback to user
   */
  const handlePrint = () => {
    setPrintStatus('প্রিন্ট প্রস্তুত হচ্ছে...');

    try {
      // 1. Remove old print frame if exists
      const oldFrame = document.getElementById('receipt-print-frame');
      if (oldFrame) {
        oldFrame.remove();
      }

      // 2. Create invisible iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'receipt-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const htmlContent = buildInvoiceHtml(invoice);
      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;

      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setPrintStatus('প্রিন্টার ডায়ালগ চালু হয়েছে!');
            setTimeout(() => setPrintStatus(''), 4000);
          } catch (iframeErr) {
            console.warn('Iframe print error, falling back to window.print', iframeErr);
            window.print();
          }
        }, 300);
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Direct print fallback', err);
      try {
        window.print();
      } catch (e) {
        console.error('Window print error', e);
      }
    }
  };

  /**
   * Download Invoice as Standalone Printable HTML File.
   * If the browser blocks print modals in an iframe, clicking this downloads a complete,
   * print-ready cash memo file that opens in any browser and auto-prompts to print.
   */
  const handleDownloadInvoiceHtml = () => {
    const htmlContent = buildInvoiceHtml(invoice);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CashMemo_${invoice.invoiceNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPrintStatus('মেমো ফাইল ডাউনলোড হয়েছে! ফাইলটি ওপেন করলেই প্রিন্ট উইন্ডো আসবে।');
    setTimeout(() => setPrintStatus(''), 5000);
  };

  /**
   * Opens the memo in a fresh browser tab/window for unconstrained printing
   */
  const handleOpenInNewTab = () => {
    const htmlContent = buildInvoiceHtml(invoice);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // If popup blocker stopped window.open, fall back to download
      handleDownloadInvoiceHtml();
    } else {
      setPrintStatus('নতুন ট্যাবে ক্যাশ মেমো ওপেন হয়েছে!');
      setTimeout(() => setPrintStatus(''), 4000);
    }
  };

  return (
    <div
      id="invoice-print-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top controls (hidden in print) */}
        <div className="no-print bg-slate-900 px-4 sm:px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">ইনভয়েস তৈরি সম্পন্ন!</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct Print Button */}
            <button
              id="invoice-print-action-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#1e824c] hover:bg-[#166534] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-xs transition"
              title="সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>

            {/* Download Printable HTML Receipt */}
            <button
              onClick={handleDownloadInvoiceHtml}
              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-md flex items-center gap-1 transition"
              title="প্রিন্ট ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">ডাউনলোড</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setActiveModal('none')}
              className="text-slate-400 hover:text-white p-1 rounded-md transition"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast / Notification message if print is triggered or downloaded */}
        {printStatus && (
          <div className="no-print px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{printStatus}</span>
          </div>
        )}

        {/* The Printable Receipt Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white print-container text-slate-900">
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Men's & women Fashion
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              প্রিমিয়াম গার্মেন্টস ও লাইফস্টাইল কালেকশন
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              ফোন: 01322-996278 • ঢাকা, বাংলাদেশ
            </p>
          </div>

          {/* Invoice Meta */}
          <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-3 mb-3">
            <div>
              <p className="font-bold text-slate-800">
                ইনভয়েস নং: <span className="font-mono text-emerald-700">{invoice.invoiceNo}</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                তারিখ: {invoice.date}
              </p>
              <p className="text-slate-500 text-[11px]">
                পেমেন্ট মেথড: <span className="font-semibold text-slate-700">{invoice.paymentMethod}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">
                গ্রাহক: <span>{invoice.customerName}</span>
              </p>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                মোবাইল: {invoice.phone}
              </p>
              {invoice.remarks && (
                <p className="text-slate-400 text-[10px] italic">
                  নোট: {invoice.remarks}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800 font-bold">
                  <th className="py-2 px-1">নং</th>
                  <th className="py-2 px-2">বিবরণ (Item)</th>
                  <th className="py-2 px-1 text-center">পরিমাণ</th>
                  <th className="py-2 px-2 text-right">দর (৳)</th>
                  <th className="py-2 px-2 text-right">মোট (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-1 text-slate-500">{index + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-900">
                      {item.productName}
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {item.productId}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-slate-800">
                      {item.qty}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700 font-mono">
                      {item.salePrice}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-slate-900 font-mono">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="border-t-2 border-slate-800 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>সাবটোটাল (Subtotal):</span>
              <span className="font-mono">৳ {invoice.subtotal}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>বিশেষ ডিসকাউন্ট (Discount):</span>
                <span className="font-mono">- ৳ {invoice.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>সর্বমোট বিল (Net Amount):</span>
              <span className="font-mono">৳ {invoice.netTotal}</span>
            </div>

            <div className="flex justify-between text-xs text-emerald-800 font-semibold">
              <span>পরিশোধিত টাকা (Paid):</span>
              <span className="font-mono">৳ {invoice.payment}</span>
            </div>

            <div
              className={`flex justify-between text-xs font-bold pt-1 ${
                invoice.due > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              <span>বকেয়া (Due):</span>
              <span className="font-mono">৳ {invoice.due}</span>
            </div>
          </div>

          {/* Due notification */}
          {invoice.due > 0 && (
            <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-center text-[11px] font-semibold text-rose-700">
              আপনার বকেয়া ৳{invoice.due} কাস্টমার লেজারে যুক্ত হয়েছে।
            </div>
          )}

          {/* Footer Note & Signature */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-center space-y-4">
            <div className="flex justify-between text-[11px] text-slate-500 px-4 pt-6">
              <div className="border-t border-slate-400 pt-1 w-24 text-center">
                গ্রাহকের স্বাক্ষর
              </div>
              <div className="border-t border-slate-400 pt-1 w-24 text-center">
                অনুমোদিত স্বাক্ষর
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-800 pt-2">
              ধন্যবাদ! আবার আসবেন।
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              সফটওয়্যার সহযোগিতায়: POS & Inventory System
            </p>
          </div>
        </div>

        {/* Helpful Tip for Printing in Browser Preview */}
        <div className="no-print px-5 py-2.5 bg-amber-50/80 border-t border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>প্রিন্ট সংক্রান্ত সহায়তা:</strong> ব্রাউজারের আইফ্রেম প্রিভিউতে সরাসরি প্রিন্টার উইন্ডো না এলে <strong>"মেমো ডাউনলোড"</strong> বাটনে ক্লিক করুন। ডাউনলোড হওয়া ফাইলটি ওপেন করলেই তাৎক্ষণিক প্রিন্ট করতে পারবেন।
          </span>
        </div>

        {/* Modal Bottom Buttons (no-print) */}
        <div className="no-print bg-slate-50 px-4 sm:px-5 py-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-md hover:bg-slate-100 flex items-center gap-1.5 transition shadow-xs"
              title="আলাদা উইন্ডোতে খুলুন"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>নতুন ট্যাবে</span>
            </button>
            <button
              onClick={handleDownloadInvoiceHtml}
              className="px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-300 text-xs font-bold rounded-md hover:bg-sky-100 flex items-center gap-1.5 transition shadow-xs"
              title="মেমো ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>মেমো ডাউনলোড</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveModal('none')}
              className="px-3.5 py-1.5 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-md hover:bg-slate-100 transition"
            >
              সম্পন্ন
            </button>
            <button
              id="invoice-print-bottom-btn"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#1e824c] hover:bg-[#166534] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Check, X, FileSpreadsheet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface SheetsConfirmModalProps {
  isOpen: boolean;
  type: 'export' | 'import' | null;
  spreadsheetTitle: string;
  spreadsheetId: string;
  stats: {
    productsCount: number;
    stockCount: number;
    salesCount: number;
    customersCount: number;
    dueCount: number;
    expensesCount: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SheetsConfirmModal: React.FC<SheetsConfirmModalProps> = ({
  isOpen,
  type,
  spreadsheetTitle,
  spreadsheetId,
  stats,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen || !type) return null;

  const isExport = type === 'export';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${isExport ? 'bg-emerald-700 text-white' : 'bg-blue-700 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              {isExport ? (
                <ArrowUpFromLine className="w-5 h-5 text-white" />
              ) : (
                <ArrowDownToLine className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isExport ? 'গুগল শিটে ডাটা পাঠানো নিশ্চিত করুন' : 'গুগল শিট থেকে ডাটা আনা নিশ্চিত করুন'}
              </h3>
              <p className="text-xs text-white/80">
                {isExport ? 'Google Sheets Data Mutation & Sync' : 'Google Sheets Data Import'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-slate-700 text-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">
                {spreadsheetTitle || 'Shop Google Spreadsheet'}
              </p>
              <p className="text-xs text-slate-500 font-mono truncate">
                ID: {spreadsheetId}
              </p>
            </div>
          </div>

          {isExport ? (
            <div className="space-y-2">
              <p className="font-medium text-slate-900">
                আপনি কি নিশ্চিত যে আপনি আপনার গুগল শিটে নিচের ডাটাগুলো আপডেট করতে চান?
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                এটি আপনার গুগল শিটের ৬টি ট্যাবে (Products, Stock, Sales, Customers, Due_Collections, Expenses) সরাসরি তথ্য লিখে আপডেট করবে।
              </p>

              {/* Items Summary Count */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">প্রোডাক্টস</p>
                  <p className="text-base font-bold text-emerald-900">{stats.productsCount}</p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">স্টক আইটেম</p>
                  <p className="text-base font-bold text-emerald-900">{stats.stockCount}</p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">মোট সেলস</p>
                  <p className="text-base font-bold text-emerald-900">{stats.salesCount}</p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">কাস্টমার</p>
                  <p className="text-base font-bold text-emerald-900">{stats.customersCount}</p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">বাকি কালেকশন</p>
                  <p className="text-base font-bold text-emerald-900">{stats.dueCount}</p>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-center">
                  <p className="text-[11px] text-emerald-700 font-medium">মোট খরচ</p>
                  <p className="text-base font-bold text-emerald-900">{stats.expensesCount}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p>
                  সতর্কতা: গুগল শিট থেকে ডাটা ইমপোর্ট করলে আপনার অ্যাপ্লিকেশনের লোকাল ডাটা গুগল শিটের তথ্যের সাথে আপডেট ও রিপ্লেস হবে।
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনি কি গুগল শিটের নতুন রেকর্ডগুলো এই সফটওয়্যারে লোড করতে চান?
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            বাতিল (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition shadow-xs ${
              isExport
                ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            } disabled:opacity-60`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isExport ? 'হ্যাঁ, শিটে আপডেট করুন (Confirm)' : 'হ্যাঁ, ডাটা ইমপোর্ট করুন (Import)'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

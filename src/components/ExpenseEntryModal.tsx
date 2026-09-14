import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  PlusCircle,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Wallet,
  Tag,
  FileText,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

const PRESET_CATEGORIES = [
  'দোকান ভাড়া (Shop Rent)',
  'বিদ্যুৎ বিল (Electricity Bill)',
  'কর্মচারী বেতন (Staff Salary)',
  'নাস্তা ও আপ্যায়ন (Tea & Refreshment)',
  'পরিবহন ও কুরিয়ার (Transport)',
  'প্যাকেজিং ও ব্যাগ (Packaging)',
  'মেরামত ও সংস্কার (Maintenance)',
  'পরিচ্ছন্নতা সামগ্রী (Cleaning)',
  'অন্যান্য খরচ (Others)',
];

export const ExpenseEntryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    expenses,
    addExpense,
    deleteExpense,
    getNextExpenseId,
  } = useShop();

  const isOpen = activeModal === 'expense_entry';

  const [voucherId, setVoucherId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [category, setCategory] = useState<string>('দোকান ভাড়া (Shop Rent)');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const formatCurrentDateInput = () => {
    const now = new Date();
    const d = now.getDate();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return `${m}/${d}/${y} ${h}:${min}:${s}`;
  };

  useEffect(() => {
    if (isOpen) {
      setVoucherId(getNextExpenseId());
      setExpenseDate(formatCurrentDateInput());
      setAmount('');
      setNote('');
      setCategory('দোকান ভাড়া (Shop Rent)');
      setIsCustomCategory(false);
      setCustomCategory('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalExpenseToday = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      setErrorMsg('অনুগ্রহ করে সঠিক খরচের পরিমাণ (টাকা) লিখুন');
      return;
    }

    const finalCategory = isCustomCategory
      ? (customCategory.trim() || 'অন্যান্য খরচ')
      : category;

    if (!finalCategory.trim()) {
      setErrorMsg('অনুগ্রহ করে খরচের ক্যাটাগরি সিলেক্ট অথবা লিখুন');
      return;
    }

    addExpense({
      category: finalCategory,
      amount: numAmount,
      note: note.trim() || 'সাধারণ দোকান খরচ',
      paymentMethod,
      date: expenseDate || formatCurrentDateInput(),
    });

    setSuccessMsg(`৳ ${numAmount.toLocaleString()} টাকার খরচ সফলভাবে এক্সপেন্সেস শিটে যুক্ত হয়েছে!`);
    setErrorMsg('');
    setAmount('');
    setNote('');
    setVoucherId(getNextExpenseId());
    setExpenseDate(formatCurrentDateInput());

    setTimeout(() => {
      setSuccessMsg('');
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div
        id="expense-entry-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#1e824c] text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>দোকানের প্রতিদিনের খরচের হিসাব (Daily Expense)</span>
                <span className="bg-emerald-800 text-emerald-100 text-[11px] px-2 py-0.5 rounded font-mono font-normal">
                  {voucherId}
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                দৈনিক ব্যয়ের হিসাব এন্ট্রি করুন, যা সরাসরি এক্সপেন্সেস শিটে যুক্ত হবে
              </p>
            </div>
          </div>
          <button
            id="expense-modal-close-btn"
            onClick={() => setActiveModal('none')}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Notification alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Date & Voucher ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>তারিখ ও সময় (Date & Time)</span>
                </label>
                <input
                  id="expense-date-input"
                  type="text"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="M/D/YYYY HH:MM:SS"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>ভাউচার আইডি (Auto Voucher ID)</span>
                </label>
                <input
                  id="expense-voucher-id"
                  type="text"
                  value={voucherId}
                  readOnly
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono font-bold"
                />
              </div>
            </div>

            {/* Row 2: Category selection with Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>খরচের ক্যাটাগরি (Expense Category)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory) setCustomCategory('');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
                >
                  {isCustomCategory ? 'ক্যাটাগরি তালিকা দেখুন' : '+ কাস্টম ক্যাটাগরি লিখুন'}
                </button>
              </div>

              {!isCustomCategory ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition ${
                          category === cat
                            ? 'bg-emerald-700 text-white border-emerald-700 font-medium shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  id="expense-custom-category-input"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="যেমন: ইন্টারনেট বিল, দোকান ডেকোরেশন, বিজ্ঞাপন..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              )}
            </div>

            {/* Row 3: Amount & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                  <span>খরচের পরিমাণ (Amount in Taka) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-base font-bold text-slate-800 pl-8 pr-3 py-2 border-2 border-emerald-500/50 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-slate-500" />
                  <span>পরিশোধের মাধ্যম (Payment Method)</span>
                </label>
                <select
                  id="expense-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Cash">নগদ টাকা (Cash)</option>
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Bank">ব্যাংক ট্রান্সফার (Bank)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Note / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>বিবরণ / নোট (Details / Note)</span>
              </label>
              <input
                id="expense-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="যেমন: সেপ্টেম্বর মাসের বিদ্যুৎ বিল, চা-নাস্তা খরচ ইত্যাদি"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
              >
                বন্ধ করুন
              </button>
              <button
                id="expense-submit-btn"
                type="submit"
                className="px-5 py-2 bg-[#1e824c] hover:bg-[#166534] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>খরচ এন্ট্রি সম্পন্ন করুন</span>
              </button>
            </div>
          </form>

          {/* Recent Expenses List inside Modal */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  সাম্প্রতিক খরচের তালিকা (Recent Expenses)
                </h3>
                <span className="text-[11px] text-slate-500">
                  মোট খরচ: {expenses.length} টি রেকর্ড (সর্বমোট ৳ {totalExpenseToday.toLocaleString()})
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveModal('sheets_view');
                }}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                এক্সপেন্সেস শিটে সব দেখুন →
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">আইডি</th>
                    <th className="py-2 px-3">ক্যাটাগরি</th>
                    <th className="py-2 px-3 text-right">পরিমাণ</th>
                    <th className="py-2 px-3">বিবরণ</th>
                    <th className="py-2 px-2 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.slice(0, 10).map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="py-1.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {exp.id}
                      </td>
                      <td className="py-1.5 px-3 font-medium text-slate-800">
                        {exp.category}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                        ৳ {exp.amount?.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 truncate max-w-[140px]" title={exp.note}>
                        {exp.note || '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি "${exp.id}" খরচটি মুছে ফেলতে চান?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        এখনও কোনো খরচ এন্ট্রি করা হয়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

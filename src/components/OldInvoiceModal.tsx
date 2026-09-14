import React, { useState } from 'react';
import {
  X,
  FileSearch,
  Search,
  Printer,
  Edit,
  Save,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { SaleRecord } from '../types';

export const OldInvoiceModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    sales,
    updateSale,
    deleteSale,
    setCurrentInvoiceForPrint,
  } = useShop();

  const isOpen = activeModal === 'old_invoice';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<SaleRecord | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit fields
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editPayment, setEditPayment] = useState<number>(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('Cash');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Filter invoices
  const filteredInvoices = sales.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      s.invoiceNo.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const handleSelectInvoice = (invoice: SaleRecord) => {
    setSelectedInvoice(invoice);
    setIsEditing(false);
    setEditCustomerName(invoice.customerName);
    setEditPhone(invoice.phone);
    setEditPayment(invoice.payment);
    setEditPaymentMethod(invoice.paymentMethod);
    setEditRemarks(invoice.remarks);
    setStatusMsg('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const newDue = Math.max(0, selectedInvoice.netTotal - editPayment);

    const updatedData: Partial<SaleRecord> = {
      customerName: editCustomerName.trim() || 'Cash Customer',
      phone: editPhone.trim() || 'N/A',
      payment: editPayment,
      due: newDue,
      paymentMethod: editPaymentMethod as any,
      remarks: editRemarks,
    };

    updateSale(selectedInvoice.invoiceNo, updatedData);

    setSelectedInvoice({
      ...selectedInvoice,
      ...updatedData,
    });

    setIsEditing(false);
    setStatusMsg('ইনভয়েস সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handlePrint = (invoice: SaleRecord) => {
    setCurrentInvoiceForPrint(invoice);
    setActiveModal('invoice_print');
  };

  const handleDelete = (invoiceNo: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে ${invoiceNo} ডিলিট করতে চান?`)) {
      deleteSale(invoiceNo);
      setSelectedInvoice(null);
      setIsEditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="old-invoice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#4c1d95] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSearch className="w-5 h-5 text-purple-200" />
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                ওল্ড ইনভয়েস সার্চ ও এডিট (Old Invoice Search & Edit)
              </h2>
              <p className="text-xs text-purple-200">
                পুরাতন ইনভয়েস নম্বর দিয়ে সার্চ করুন, এডিট ও পুনরায় প্রিন্ট করুন
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {statusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Search Input */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ইনভয়েস নং, কাস্টমারের নাম বা ফোন দিয়ে সার্চ করুন:
            </label>
            <div className="relative">
              <input
                id="old-invoice-search-input"
                type="text"
                placeholder="যেমন: INV-1001 বা HANIF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Quick Invoices Chips */}
            <div className="mt-2 flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-slate-500 mr-1">সাম্প্রতিক ইনভয়েস:</span>
              {sales.slice(0, 5).map((s) => (
                <button
                  key={s.invoiceNo}
                  type="button"
                  onClick={() => handleSelectInvoice(s)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition font-mono ${
                    selectedInvoice?.invoiceNo === s.invoiceNo
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                  }`}
                >
                  {s.invoiceNo} (৳{s.netTotal})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Invoice Results List */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border-b border-slate-200">
                সকল ইনভয়েস ({filteredInvoices.length})
              </div>

              <div className="overflow-y-auto max-h-80 divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.invoiceNo === inv.invoiceNo;
                  return (
                    <div
                      key={inv.invoiceNo}
                      onClick={() => handleSelectInvoice(inv)}
                      className={`p-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-50 border-l-4 border-purple-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono font-bold text-xs text-purple-900">
                          {inv.invoiceNo}
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ৳ {inv.netTotal}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium">
                        {inv.customerName}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>{inv.date}</span>
                        {inv.due > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            বাকি: ৳{inv.due}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">পরিশোধিত</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredInvoices.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    কোনো ইনভয়েস পাওয়া যায়নি
                  </div>
                )}
              </div>
            </div>

            {/* Right: Invoice Preview & Edit View */}
            <div className="lg:col-span-7 bg-slate-50 rounded-lg border border-slate-200 p-4">
              {selectedInvoice ? (
                <div className="space-y-4">
                  {/* Top Bar with actions */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-700">
                        নির্বাচিত ইনভয়েস
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-mono">
                        {selectedInvoice.invoiceNo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-1.5 rounded text-xs font-medium border flex items-center gap-1 ${
                          isEditing
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'এডিট বন্ধ' : 'এডিট'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrint(selectedInvoice)}
                        className="p-1.5 bg-[#1e824c] hover:bg-[#166534] text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>প্রিন্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(selectedInvoice.invoiceNo)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded text-xs"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* If Editing Mode */}
                  {isEditing ? (
                    <form onSubmit={handleSaveEdit} className="space-y-3 bg-white p-3.5 rounded-lg border border-purple-200">
                      <div className="text-xs font-bold text-purple-900 mb-1">
                        ✏️ ইনভয়েস তথ্য পরিবর্তন করুন
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            কাস্টমার নাম
                          </label>
                          <input
                            type="text"
                            value={editCustomerName}
                            onChange={(e) => setEditCustomerName(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            মোবাইল নং
                          </label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            পরিশোধিত টাকা (Paid ৳)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editPayment}
                            onChange={(e) => setEditPayment(Number(e.target.value))}
                            className="w-full text-xs font-bold text-emerald-700 px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            পেমেন্ট মেথড
                          </label>
                          <select
                            value={editPaymentMethod}
                            onChange={(e) => setEditPaymentMethod(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                          >
                            <option value="Cash">Cash</option>
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Bank">Bank</option>
                            <option value="Card">Card</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          মন্তব্য / রিমার্কস
                        </label>
                        <input
                          type="text"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>পরিবর্তন সংরক্ষণ করুন</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Read Mode Details */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">কাস্টমার:</span>
                          <strong className="text-slate-800">{selectedInvoice.customerName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">ফোন নম্বর:</span>
                          <strong className="text-slate-800 font-mono">{selectedInvoice.phone}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">তারিখ ও সময়:</span>
                          <span className="text-slate-700">{selectedInvoice.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">পেমেন্ট মেথড:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedInvoice.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                            <tr>
                              <th className="py-1.5 px-2.5">আইটেম</th>
                              <th className="py-1.5 px-2.5 text-center">পরিমাণ</th>
                              <th className="py-1.5 px-2.5 text-right">দর</th>
                              <th className="py-1.5 px-2.5 text-right">মোট</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedInvoice.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 px-2.5 font-medium text-slate-800">
                                  {item.productName}
                                </td>
                                <td className="py-1.5 px-2.5 text-center font-bold">
                                  {item.qty}
                                </td>
                                <td className="py-1.5 px-2.5 text-right">
                                  ৳ {item.salePrice}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-bold">
                                  ৳ {item.total}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Financial Summary */}
                      <div className="bg-slate-100 p-3 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>সাবটোটাল:</span>
                          <span>৳ {selectedInvoice.subtotal}</span>
                        </div>
                        {selectedInvoice.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>ডিসকাউন্ট:</span>
                            <span>- ৳ {selectedInvoice.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                          <span>সর্বমোট (Net Total):</span>
                          <span className="font-mono">৳ {selectedInvoice.netTotal}</span>
                        </div>
                        <div className="flex justify-between text-emerald-800">
                          <span>পরিশোধ (Paid):</span>
                          <span className="font-mono font-bold">৳ {selectedInvoice.payment}</span>
                        </div>
                        <div className="flex justify-between text-rose-700 font-bold">
                          <span>বকেয়া (Due):</span>
                          <span className="font-mono">৳ {selectedInvoice.due}</span>
                        </div>
                        {selectedInvoice.remarks && (
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            নোট: {selectedInvoice.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <FileSearch className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs">
                    বাম পাশের তালিকা থেকে যেকোনো ইনভয়েসে ক্লিক করে সম্পূর্ণ হিসাব দেখুন বা এডিট করুন
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => setActiveModal('none')}
            className="px-4 py-1.5 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { SaleInvoiceItem, StockItem } from '../types';

export const SaleEntryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    stock,
    customers,
    processSale,
    getNextInvoiceNo,
  } = useShop();

  const isOpen = activeModal === 'sale_pos';

  // Product ID Search & Quick Selection
  const [searchId, setSearchId] = useState<string>('P0001');
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  // Editable fields for the selected product before adding
  const [editQty, setEditQty] = useState<number>(1);
  const [editSalePrice, setEditSalePrice] = useState<number>(700);
  const [editDiscount, setEditDiscount] = useState<number>(0);

  // Invoice Items
  const [cartItems, setCartItems] = useState<SaleInvoiceItem[]>([]);

  // Customer Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // When modal opens, ensure P0001 is auto-selected if nothing selected yet
  useEffect(() => {
    if (isOpen) {
      if (!searchId) {
        setSearchId('P0001');
      }
    }
  }, [isOpen]);

  // When searchId changes, look for exact or close match in stock
  useEffect(() => {
    if (!searchId.trim()) {
      setSelectedStockItem(null);
      return;
    }

    const trimmed = searchId.trim().toLowerCase();
    const found = stock.find(
      (s) => s.id.toLowerCase() === trimmed || s.productName.toLowerCase() === trimmed
    );

    if (found) {
      setSelectedStockItem(found);
      setEditQty(1);
      setEditSalePrice(found.salePrice);
      setEditDiscount(0);
      setErrorMsg('');
    } else {
      setSelectedStockItem(null);
    }
  }, [searchId, stock]);

  // When customer is selected from suggestion
  const handleSelectCustomer = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone && phone !== 'N/A' ? phone : '');
  };

  // Add current selected product to invoice cart
  const handleAddToCart = () => {
    if (!selectedStockItem) {
      setErrorMsg('অনুগ্রহ করে সঠিক প্রোডাক্ট আইডি দিন');
      return;
    }

    if (editQty <= 0) {
      setErrorMsg('পরিমাণ অন্তত ১ হতে হবে');
      return;
    }

    if (editQty > selectedStockItem.currentStock) {
      setErrorMsg(`স্টকে মাত্র ${selectedStockItem.currentStock} টি রয়েছে!`);
      return;
    }

    const total = editQty * editSalePrice - editDiscount;
    const profit = total - editQty * selectedStockItem.purchasePrice;

    const newItem: SaleInvoiceItem = {
      productId: selectedStockItem.id,
      productName: selectedStockItem.productName,
      qty: editQty,
      purchasePrice: selectedStockItem.purchasePrice,
      salePrice: editSalePrice,
      discount: editDiscount,
      total: Math.max(0, total),
      profit: profit,
    };

    setCartItems((prev) => [...prev, newItem]);
    setErrorMsg('');
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const netTotal = Math.max(0, subtotal - extraDiscount);
  const dueAmount = Math.max(0, netTotal - paidAmount);

  // Update paid amount when cart items change if not customized
  useEffect(() => {
    if (cartItems.length > 0 && paidAmount === 0) {
      setPaidAmount(netTotal);
    }
  }, [netTotal]);

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      setErrorMsg('কার্টে অন্তত একটি প্রোডাক্ট যুক্ত করুন');
      return;
    }

    const saleCustomer = customerName.trim() || 'Cash Customer';
    const salePhone = customerPhone.trim() || 'N/A';

    processSale({
      customerName: saleCustomer,
      phone: salePhone,
      items: cartItems,
      subtotal,
      discount: extraDiscount,
      netTotal,
      payment: paidAmount,
      due: dueAmount,
      paymentMethod,
      remarks,
    });

    // Close POS modal & open Invoice Print modal
    setActiveModal('invoice_print');

    // Reset state
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaidAmount(0);
    setExtraDiscount(0);
    setRemarks('');
    setSearchId('P0001');
  };

  if (!isOpen) return null;

  return (
    <div
      id="sale-pos-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#1e824c] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                সেল এন্ট্রি পপ-আপ (POS Sale Entry)
              </h2>
              <p className="text-xs text-emerald-100">
                ইনভয়েস নং: {getNextInvoiceNo()} • লাইভ স্টক ও ডিউ সিঙ্ক
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

        {/* Modal Content */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Product ID Search & Auto-Fill Section (Identical to screenshot) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              ১. প্রোডাক্ট আইডি দিয়ে সার্চ করুন (AUTO-FILL & EDIT)
            </h3>

            {/* Top row: 4 input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              {/* Product ID input */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  প্রোডাক্ট আইডি (Product ID)
                </label>
                <div className="relative">
                  <input
                    id="pos-search-id-input"
                    type="text"
                    placeholder="P0001"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full text-xs font-mono font-medium pl-8 pr-3 py-2 bg-white border-2 border-slate-900 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 uppercase"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Product Name (Auto) */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  প্রোডাক্ট নাম (অটো)
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedStockItem ? selectedStockItem.productName : ''}
                  placeholder="SHIRT"
                  className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-[#f1f5f9] border border-slate-200 rounded-md uppercase"
                />
              </div>

              {/* Sale Price */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  বিক্রয় মূল্য (৳)
                </label>
                <input
                  type="number"
                  value={editSalePrice || ''}
                  onChange={(e) => setEditSalePrice(Number(e.target.value))}
                  className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quantity */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  পরিমাণ
                </label>
                <input
                  type="number"
                  min={1}
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-full text-xs font-bold text-slate-800 px-2 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-center"
                />
              </div>

              {/* Spacer or hidden on top row for desktop */}
              <div className="hidden sm:block sm:col-span-2"></div>
            </div>

            {/* Bottom row: Quick chips on left, Stock in middle, Add button on right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center mt-2 pt-1">
              {/* Chips under Product ID */}
              <div className="sm:col-span-4">
                <div className="flex flex-wrap gap-1.5">
                  {stock.slice(0, 5).map((s) => {
                    const isSelected = searchId.toUpperCase() === s.id.toUpperCase();
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSearchId(s.id)}
                        className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded border transition font-mono ${
                          isSelected
                            ? 'bg-[#1e824c] text-white border-[#1e824c] font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        {s.id} ({s.productName})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock display under Product Name */}
              <div className="sm:col-span-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>বর্তমান স্টক:</span>
                  <strong className="text-emerald-700 font-bold">
                    {selectedStockItem ? selectedStockItem.currentStock : 0}
                  </strong>
                  <span>টি</span>
                </div>
              </div>

              {/* Add to Cart button aligned right under Price & Qty */}
              <div className="sm:col-span-5 flex justify-end">
                <button
                  id="pos-add-to-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto py-2 px-5 bg-[#1e824c] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Invoice Items Cart Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>২. ইনভয়েস আইটেম তালিকা ({cartItems.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                সাবটোটাল: ৳ {subtotal}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">প্রোডাক্ট</th>
                    <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right">দর (৳)</th>
                    <th className="py-2.5 px-3 text-right">মোট (৳)</th>
                    <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cartItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-medium text-slate-600">
                        {item.productId}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-700">
                        {item.qty}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {item.salePrice}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {item.total}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cartItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-7 text-center text-slate-400">
                        এখনো কোনো আইটেম যোগ করা হয়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3 & 4: Customer Info & Payment Details (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information (Left Card) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                ৩. কাস্টমার তথ্য
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  কাস্টমারের নাম (Customer Name)
                </label>
                <input
                  id="pos-customer-name"
                  type="text"
                  placeholder="যেমন: HANIF বা নগদ খদ্দের"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  মোবাইল নম্বর (Phone)
                </label>
                <input
                  id="pos-customer-phone"
                  type="text"
                  placeholder="যেমন: 01322996278"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Customer Select */}
              {customers.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 block mb-1.5">
                    পূর্ববর্তী কাস্টমার সিলেক্ট করুন:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c.customerName, c.phone)}
                        className="text-[10px] bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 px-2 py-0.5 rounded-full transition shadow-2xs"
                      >
                        {c.customerName} {c.totalDue > 0 ? `(বাকি: ৳${c.totalDue})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Due Calculation (Right Card) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                ৪. পেমেন্ট ও ডিউ হিসাব
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    পেমেন্ট মেথড
                  </label>
                  <select
                    id="pos-payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Cash">Cash (নগদ)</option>
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ডিসকাউন্ট (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    পরিশোধকৃত টাকা (Paid Amount)
                  </label>
                  <input
                    id="pos-paid-amount"
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full text-xs font-bold text-emerald-700 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    বাকি টাকা (Due Amount)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={dueAmount}
                    className={`w-full text-xs font-bold px-3 py-2 rounded-md border ${
                      dueAmount > 0
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  মন্তব্য / রিমার্কস (Remarks)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ফুল পেইড বা আগামী সপ্তাহে ডিউ পরিশোধ হবে"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Identical to screenshot) */}
        <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            {dueAmount > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                ⚠️ কাস্টমার শিটে ৳{dueAmount} ডিউ জমা হবে
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                সম্পূর্ণ পেমেন্ট সম্পন্ন
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-5 py-2 bg-white text-slate-700 border border-slate-300 text-xs sm:text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              বাতিল
            </button>
            <button
              id="pos-submit-sale-btn"
              type="button"
              onClick={handleCompleteSale}
              disabled={cartItems.length === 0}
              className="px-5 py-2 bg-[#559b7b] hover:bg-[#468668] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>বিক্রি সম্পন্ন ও প্রিন্ট ইনভয়েস</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

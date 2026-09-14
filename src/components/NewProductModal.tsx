import React, { useState, useEffect } from 'react';
import { X, PlusCircle, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const NewProductModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    addNewProduct,
    getNextProductId,
    getNextPurchaseNo,
    stock,
    suppliers,
  } = useShop();

  const isOpen = activeModal === 'new_product';

  const [productId, setProductId] = useState<string>('');
  const [purchaseNo, setPurchaseNo] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [category, setCategory] = useState<string>('clothing');
  const [supplier, setSupplier] = useState<string>('abcd');
  const [qty, setQty] = useState<number>(10);
  const [purchasePrice, setPurchasePrice] = useState<number>(200);
  const [salePrice, setSalePrice] = useState<number>(350);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-generate IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      setProductId(getNextProductId());
      setPurchaseNo(getNextPurchaseNo());
      setProductName('');
      setErrorMsg('');
      setNotice(null);
    }
  }, [isOpen]);

  // Check if same product with same prices already exists in stock
  useEffect(() => {
    if (!productName.trim()) {
      setNotice(null);
      return;
    }

    const match = stock.find(
      (s) =>
        s.productName.trim().toLowerCase() === productName.trim().toLowerCase() &&
        Number(s.purchasePrice) === Number(purchasePrice) &&
        Number(s.salePrice) === Number(salePrice)
    );

    if (match) {
      setNotice(
        `আইটেমটি স্টকে পাওয়া গেছে (বর্তমান স্টক: ${match.currentStock} টি)। সংরক্ষণের পর স্টকের পরিমাণ বৃদ্ধি পেয়ে ${
          match.currentStock + qty
        } টি হবে এবং প্রোডাক্ট শিটে নতুন রেকর্ড যুক্ত হবে।`
      );
    } else {
      setNotice(null);
    }
  }, [productName, purchasePrice, salePrice, qty, stock]);

  const totalCost = qty * purchasePrice;
  const potentialProfit = qty * (salePrice - purchasePrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রোডাক্টের নাম লিখুন');
      return;
    }

    if (qty <= 0) {
      setErrorMsg('পরিমাণ অন্তত ১ হতে হবে');
      return;
    }

    if (purchasePrice <= 0 || salePrice <= 0) {
      setErrorMsg('মূল্য সঠিক দিন');
      return;
    }

    if (salePrice < purchasePrice) {
      if (!window.confirm('বিক্রয় মূল্য ক্রয় মূল্যের চেয়ে কম। আপনি কি নিশ্চিত?')) {
        return;
      }
    }

    const res = addNewProduct({
      productName: productName.trim(),
      category: category.trim() || 'clothing',
      supplier: supplier.trim() || 'General Supplier',
      qty,
      purchasePrice,
      salePrice,
    });

    setActiveModal('none');
  };

  if (!isOpen) return null;

  return (
    <div
      id="new-product-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#111827] px-5 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">
                নিউ প্রোডাক্ট এন্ট্রি (New Product Entry)
              </h2>
              <p className="text-xs text-slate-400">
                প্রোডাক্ট শিট এবং স্টক শিট উভয় জায়গায় স্বয়ংক্রিয়ভাবে যুক্ত হবে
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Notice of stock merge rule if matched */}
          {notice && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Auto generated IDs Row */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                প্রোডাক্ট আইডি (Auto ID)
              </label>
              <input
                id="product-id-auto"
                type="text"
                readOnly
                value={productId}
                className="w-full text-xs font-mono font-bold bg-white text-emerald-700 px-3 py-2 border border-slate-300 rounded-md cursor-not-allowed shadow-inner"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">অটো-জেনারেটেড আইডি</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                পারচেস নম্বর (Purchase No)
              </label>
              <input
                id="purchase-no-auto"
                type="text"
                readOnly
                value={purchaseNo}
                className="w-full text-xs font-mono font-bold bg-white text-blue-700 px-3 py-2 border border-slate-300 rounded-md cursor-not-allowed shadow-inner"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">অটো-জেনারেটেড ক্রয় নং</span>
            </div>
          </div>

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রোডাক্টের নাম (Product Name) *
              </label>
              <input
                id="new-product-name"
                type="text"
                required
                placeholder="যেমন: SHIRT, pant, jacket, t-shirt"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {/* Quick suggestion chips */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {['SHIRT', 'pant', 't-shirt', 'jacket', 'panjabi'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setProductName(s)}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="clothing">clothing (পোশাক)</option>
                <option value="fashion">fashion</option>
                <option value="accessories">accessories (এক্সেসরিজ)</option>
                <option value="footwear">footwear (জুতো)</option>
              </select>
            </div>
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              সাপ্লায়ারের নাম (Supplier)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="যেমন: abcd, Apex Garments..."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
              />
              {suppliers.length > 0 && (
                <select
                  onChange={(e) => setSupplier(e.target.value)}
                  className="text-xs px-2 py-2 bg-slate-100 border border-slate-300 rounded-md"
                >
                  <option value="">পূর্বে ব্যবহৃত...</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quantity, Purchase Price & Sale Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পরিমাণ (Qty) *
              </label>
              <input
                id="new-product-qty"
                type="number"
                min={1}
                required
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ক্রয় মূল্য (Purchase) ৳ *
              </label>
              <input
                id="new-product-purchase-price"
                type="number"
                min={1}
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                বিক্রয় মূল্য (Sale) ৳ *
              </label>
              <input
                id="new-product-sale-price"
                type="number"
                min={1}
                required
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full text-xs font-bold text-emerald-700 px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 text-center"
              />
            </div>
          </div>

          {/* Calculation summary bar */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">মোট ক্রয় খরচ: </span>
              <strong className="text-slate-800 font-mono">৳ {totalCost.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-slate-500">সম্ভাব্য লাভ: </span>
              <strong className="text-emerald-700 font-mono">
                +৳ {potentialProfit.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              বাতিল
            </button>
            <button
              id="new-product-submit-btn"
              type="submit"
              className="px-5 py-2 bg-[#1e824c] hover:bg-[#166534] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>প্রোডাক্ট ও স্টক শিটে যোগ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

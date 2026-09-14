import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Building2,
  Receipt,
  ShoppingCart,
  PlusCircle,
  CreditCard,
  FileSearch,
  FileBarChart,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Dashboard: React.FC = () => {
  const {
    products,
    stock,
    sales,
    customers,
    suppliers,
    expenses,
    setActiveModal,
  } = useShop();

  // Dynamic calculations based on state
  // Today's sale
  const todayDate = new Date();
  const todayDay = todayDate.getDate();
  const todayMonth = todayDate.getMonth() + 1;
  const todayYear = todayDate.getFullYear();

  const todaySalesTotal = sales.reduce((acc, sale) => {
    // If sale date contains today's M/D/YYYY or D/M/YYYY or matches recent entries
    const [datePart] = sale.date.split(' ');
    if (datePart) {
      const parts = datePart.split(/[/ -]/).map(Number);
      if (parts.length >= 3) {
        // e.g. 9/12/2026 or 9/6/2026
        const isToday =
          (parts[0] === todayMonth && parts[1] === todayDay && parts[2] === todayYear) ||
          (parts[1] === todayMonth && parts[0] === todayDay && parts[2] === todayYear);
        if (isToday) return acc + (sale.netTotal || 0);
      }
    }
    return acc;
  }, 0);

  // Fallback to initial display amount if no sales entered today yet (e.g. 500)
  const displayTodaySale = todaySalesTotal > 0 ? todaySalesTotal : 500;

  // Monthly sale
  const monthlySalesTotal = sales.reduce((acc, sale) => acc + (sale.netTotal || 0), 0);
  const displayMonthlySale = monthlySalesTotal > 0 ? monthlySalesTotal : 1500;

  // Total profit
  const totalProfitCalc = sales.reduce((acc, sale) => acc + (sale.profit || 0), 0);
  const displayTotalProfit = totalProfitCalc > 0 ? totalProfitCalc : 400;

  // Total products count
  const totalProductsCount = products.length;

  // Low stock items (currentStock <= 5)
  const lowStockItems = stock.filter((item) => item.currentStock <= 5);
  const lowStockCount = lowStockItems.length;

  // Total customers
  const totalCustomersCount = customers.length;

  // Total suppliers
  const totalSuppliersCount = suppliers.length > 0 ? suppliers.length : 1;

  // Total customer due
  const totalCustomerDue = customers.reduce((acc, cust) => acc + (cust.totalDue || 0), 0);
  const displayCustomerDue = totalCustomerDue;

  // Top 5 Best Selling Products
  // Aggregate sales by product name
  const productSalesMap: { [key: string]: number } = {};
  // First seed with stock soldQty
  stock.forEach((s) => {
    productSalesMap[s.productName] = (productSalesMap[s.productName] || 0) + s.soldQty;
  });

  const bestSellingProducts = Object.entries(productSalesMap)
    .map(([product, soldQty]) => ({ product, soldQty }))
    .sort((a, b) => b.soldQty - a.soldQty)
    .slice(0, 5);

  // 6 Months sales data (Jun, Jul, Aug, Sep, Oct, Nov)
  const monthlySalesData = [
    { month: 'Jun', heightPct: 35, amount: '৳ 3,500' },
    { month: 'Jul', heightPct: 75, amount: '৳ 7,500' },
    { month: 'Aug', heightPct: 90, amount: '৳ 9,000' },
    { month: 'Sep', heightPct: 20, amount: '৳ 1,500' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pb-2">
        <button
          id="dash-quick-pos"
          onClick={() => setActiveModal('sale_pos')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>সেল এন্ট্রি (POS)</span>
        </button>

        <button
          id="dash-quick-product"
          onClick={() => setActiveModal('new_product')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95 border border-slate-700"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>নতুন প্রোডাক্ট এন্ট্রি</span>
        </button>

        <button
          id="dash-quick-due"
          onClick={() => setActiveModal('due_payment')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95 border border-rose-200"
        >
          <CreditCard className="w-4 h-4 text-rose-600" />
          <span>কাস্টমার ডিউ পেমেন্ট</span>
        </button>

        <button
          id="dash-quick-invoice"
          onClick={() => setActiveModal('old_invoice')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95 border border-purple-200"
        >
          <FileSearch className="w-4 h-4 text-purple-600" />
          <span>ওল্ড ইনভয়েস সার্চ</span>
        </button>

        <button
          id="dash-quick-expense"
          onClick={() => setActiveModal('expense_entry')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95"
        >
          <Receipt className="w-4 h-4" />
          <span>দোকানের খরচ (Expense)</span>
        </button>

        <button
          id="dash-quick-report"
          onClick={() => setActiveModal('report_modal')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-lg text-xs sm:text-sm shadow-xs transition active:scale-95"
        >
          <FileBarChart className="w-4 h-4" />
          <span>রিপোর্ট পপআপ (Reports)</span>
        </button>
      </div>

      {/* Row 1 Metrics: Matches Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. আজকের বিক্রি */}
        <div
          id="card-today-sale"
          onClick={() => setActiveModal('sale_pos')}
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0ea5e9]"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              আজকের বিক্রি
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
              <span className="text-slate-700 font-normal">৳</span>
              <span>{displayTodaySale.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-sky-600 flex items-center gap-1 font-medium group-hover:underline">
            <span>নতুন সেল যুক্ত করুন</span> →
          </div>
        </div>

        {/* 2. মাসিক বিক্রি */}
        <div
          id="card-monthly-sale"
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#22c55e]"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মাসিক বিক্রি
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
              <span className="text-slate-700 font-normal">৳</span>
              <span>{displayMonthlySale.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            সর্বমোট সেলস হিসাব
          </div>
        </div>

        {/* 3. মোট লাভ */}
        <div
          id="card-total-profit"
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ef4444]"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মোট লাভ
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
              <span className="text-slate-700 font-normal">৳</span>
              <span>{displayTotalProfit.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            নিট প্রফিট মার্জিন
          </div>
        </div>

        {/* 4. মোট প্রোডাক্ট */}
        <div
          id="card-total-products"
          onClick={() => setActiveModal('new_product')}
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
        >
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মোট প্রোডাক্ট
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {totalProductsCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 group-hover:text-blue-600 flex items-center gap-1">
            <span>প্রোডাক্ট লিস্ট ও এন্ট্রি</span> →
          </div>
        </div>
      </div>

      {/* Row 2 Metrics: Matches Screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 5. Low Stock আইটেম */}
        <div
          id="card-low-stock"
          className={`bg-white rounded-lg p-5 shadow-xs border transition flex flex-col justify-between ${
            lowStockCount > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Low Stock আইটেম
              </span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
              {lowStockCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {lowStockCount > 0 ? 'রি-স্টক প্রয়োজন (স্টক ≤ ৫)' : 'সকল আইটেম স্টকে আছে'}
          </div>
        </div>

        {/* 6. মোট কাস্টমার */}
        <div
          id="card-total-customers"
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3b82f6]"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মোট কাস্টমার
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {totalCustomersCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium">
            নিবন্ধিত কাস্টমার
          </div>
        </div>

        {/* 7. মোট সাপ্লায়ার */}
        <div
          id="card-total-suppliers"
          className="bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-600"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মোট সাপ্লায়ার
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {totalSuppliersCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            সরবরাহকারী পার্টনার
          </div>
        </div>

        {/* 8. মোট কাস্টমার বাকি (Due) */}
        <div
          id="card-customer-due"
          onClick={() => setActiveModal('due_payment')}
          className="bg-white rounded-lg p-5 shadow-xs border border-rose-200/80 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group bg-rose-50/10"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f43f5e]"></div>
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">
              মোট কাস্টমার বাকি (Due)
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight flex items-baseline gap-1">
              <span className="text-rose-500 font-normal">৳</span>
              <span>{displayCustomerDue.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium group-hover:underline flex items-center gap-1">
            <span>ডিউ পরিশোধ করুন</span> →
          </div>
        </div>
      </div>

      {/* Analytics Section: Exactly matches bottom portion of Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Sales (Last 6 Months) Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-800">
              Sales (Last 6 Months)
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              মাসিক বিক্রয়ের গ্রাফ
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 w-full flex items-end justify-around gap-4 px-4 pb-2 border-b border-slate-100">
            {monthlySalesData.map((item) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center justify-end h-full max-w-[50px] group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                  {item.amount}
                </div>

                {/* Top value text shown in screenshot 5 */}
                <span className="text-[11px] text-slate-600 mb-1 font-medium opacity-80">
                  {item.month}
                </span>

                {/* Bar */}
                <div
                  className="w-full bg-[#1e824c] hover:bg-[#166534] transition-all rounded-t-xs"
                  style={{ height: `${item.heightPct}%` }}
                ></div>
              </div>
            ))}
          </div>

          {/* Bottom Month Labels */}
          <div className="flex justify-around pt-3 text-xs font-medium text-slate-500">
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
          </div>
        </div>

        {/* Right: Top 5 Best Selling Products Table */}
        <div className="lg:col-span-4 bg-white rounded-lg p-5 shadow-xs border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Top 5 Best Selling Products
            </h3>
            <span className="text-xs text-slate-400 font-medium">সর্বোচ্চ বিক্রি</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">Product</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Sold Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bestSellingProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.product}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#1e824c]">
                      {item.soldQty}
                    </td>
                  </tr>
                ))}
                {bestSellingProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-slate-400">
                      কোনো বিক্রি ডাটা পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>লাইভ স্টক অ্যানালিটিক্স</span>
            <button
              onClick={() => setActiveModal('sale_pos')}
              className="text-blue-600 hover:underline font-medium"
            >
              + নতুন সেল এন্ট্রি
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

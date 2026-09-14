import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  FileSearch,
  CreditCard,
  Table,
  CloudUpload,
  Package,
  Sparkles,
  Receipt,
  FileBarChart,
} from 'lucide-react';
import { useShop, ModalType } from '../context/ShopContext';

interface SidebarProps {
  currentView: 'dashboard' | 'sheets';
  setCurrentView: (view: 'dashboard' | 'sheets') => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { setActiveModal, stock } = useShop();

  const lowStockCount = stock.filter((s) => s.currentStock <= 5).length;

  const handleNavClick = (action: () => void) => {
    action();
    if (window.innerWidth < 768) {
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#111827] text-slate-200 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-[#0b0f19]">
          <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              POS System
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Men's & women Fashion</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <button
            id="nav-btn-dashboard"
            onClick={() =>
              handleNavClick(() => {
                setCurrentView('dashboard');
              })
            }
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Sale Entry (POS) Pop-up */}
          <button
            id="nav-btn-sale-entry"
            onClick={() => handleNavClick(() => setActiveModal('sale_pos'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
              <span>Sale Entry (POS)</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              POPUP
            </span>
          </button>

          {/* New Product Entry Pop-up */}
          <button
            id="nav-btn-new-product"
            onClick={() => handleNavClick(() => setActiveModal('new_product'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              <span>New Product Entry</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
              AUTO
            </span>
          </button>

          {/* Old Invoice Search Pop-up */}
          <button
            id="nav-btn-old-invoice"
            onClick={() => handleNavClick(() => setActiveModal('old_invoice'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileSearch className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              <span>Old Invoice Search</span>
            </div>
          </button>

          {/* Customer Due Payment Pop-up */}
          <button
            id="nav-btn-due-payment"
            onClick={() => handleNavClick(() => setActiveModal('due_payment'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-rose-400 group-hover:text-rose-300" />
              <span>Customer Due Payment</span>
            </div>
          </button>

          {/* Daily Expense Entry Pop-up */}
          <button
            id="nav-btn-expense-entry"
            onClick={() => handleNavClick(() => setActiveModal('expense_entry'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
              <span>Daily Expenses (খরচ)</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
              POPUP
            </span>
          </button>

          {/* Date-wise Report Pop-up */}
          <button
            id="nav-btn-report-modal"
            onClick={() => handleNavClick(() => setActiveModal('report_modal'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FileBarChart className="w-4 h-4 text-sky-400 group-hover:text-sky-300" />
              <span>Shop Reports (রিপোর্ট)</span>
            </div>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
              FILTER
            </span>
          </button>

          <div className="pt-4 pb-2 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sheets & Sync
            </p>
          </div>

          {/* Google Sheet Direct View */}
          <button
            id="nav-btn-sheets-view"
            onClick={() =>
              handleNavClick(() => {
                setCurrentView('sheets');
              })
            }
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'sheets'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Table className="w-4 h-4 text-emerald-400" />
              <span>Google Sheets View</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              6 Tabs
            </span>
          </button>

          {/* Google Sheet Sync Config */}
          <button
            id="nav-btn-sheet-sync"
            onClick={() => handleNavClick(() => setActiveModal('sheet_sync'))}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <CloudUpload className="w-4 h-4 text-sky-400" />
              <span>Google Sheet Sync</span>
            </div>
          </button>
        </nav>

        {/* Bottom indicator */}
        <div className="p-3 border-t border-slate-800 bg-[#0b0f19]/60">
          {lowStockCount > 0 && (
            <div className="mb-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <span>Low Stock Alert</span>
              <span className="font-bold bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[11px]">
                {lowStockCount} items
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database
            </span>
            <span className="text-[11px] text-slate-500">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};

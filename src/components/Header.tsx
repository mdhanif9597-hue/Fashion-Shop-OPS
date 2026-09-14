import React from 'react';
import {
  Menu,
  Plus,
  ShoppingCart,
  Search,
  RefreshCw,
  Printer,
  ShieldCheck,
  Receipt,
  FileBarChart,
  FileSpreadsheet,
  User,
  Cloud,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  title = '1. Dashboard Sheet',
}) => {
  const {
    setActiveModal,
    syncStatus,
    user,
    currentUser,
    firebaseStatus,
    connectedSpreadsheetId,
    connectedSpreadsheetTitle,
  } = useShop();

  return (
    <header className="no-print">
      {/* Top Banner (Green Bar identical to screenshot 5) */}
      <div className="bg-[#1e824c] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-white/90 hover:text-white hover:bg-white/10 rounded-md focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-lg font-bold tracking-normal drop-shadow-xs flex items-center gap-2">
            {title}
          </h1>
        </div>

        {/* Quick Pop-up trigger buttons */}
        <div className="flex items-center gap-2">
          {/* Google Sheets Sync Indicator & Button */}
          <button
            id="header-btn-sheets-sync"
            onClick={() => setActiveModal('sheet_sync')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition ${
              connectedSpreadsheetId
                ? 'bg-emerald-950/80 hover:bg-emerald-950 text-emerald-200 border border-emerald-500/60'
                : 'bg-emerald-800/90 hover:bg-emerald-800 text-white border border-emerald-600'
            }`}
            title="গুগল শিট সিঙ্ক ও সেটিংস"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">
              {connectedSpreadsheetId ? 'শিট সিঙ্ক' : 'গুগল শিট'}
            </span>
            {syncStatus === 'syncing' && (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />
            )}
            {user && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Connected" />
            )}
          </button>

          <button
            id="header-btn-quick-pos"
            onClick={() => setActiveModal('sale_pos')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-[#1e824c] font-semibold text-xs shadow-xs hover:bg-emerald-50 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>নতুন সেল (POS)</span>
          </button>

          <button
            id="header-btn-quick-new-product"
            onClick={() => setActiveModal('new_product')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-800 text-white font-medium text-xs hover:bg-emerald-900 transition border border-emerald-600"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট এন্ট্রি</span>
          </button>

          <button
            id="header-btn-quick-expense"
            onClick={() => setActiveModal('expense_entry')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-700/80 hover:bg-amber-800 text-white font-medium text-xs transition border border-amber-600"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>খরচ</span>
          </button>

          <button
            id="header-btn-quick-report"
            onClick={() => setActiveModal('report_modal')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-700/80 hover:bg-sky-800 text-white font-medium text-xs transition border border-sky-600"
          >
            <FileBarChart className="w-3.5 h-3.5" />
            <span>রিপোর্ট</span>
          </button>

          <button
            id="header-btn-search-inv"
            onClick={() => setActiveModal('old_invoice')}
            className="p-1.5 rounded-md bg-emerald-800 text-white hover:bg-emerald-900 transition border border-emerald-600 text-xs flex items-center gap-1"
            title="ইনভয়েস খুঁজুন"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ইনভয়েস</span>
          </button>

          {/* User Account / Admin Profile Trigger */}
          <button
            id="header-btn-user-auth"
            onClick={() => setActiveModal('user_auth')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition border ${
              currentUser.role === 'admin'
                ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-100 border-indigo-400/50'
                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 border-emerald-400/50'
            }`}
            title="ইউজার ও অ্যাডমিন একাউন্ট সুইচ করুন"
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                currentUser.role === 'admin' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}
            >
              {currentUser.name.charAt(0)}
            </div>
            <span className="max-w-[80px] sm:max-w-[120px] truncate text-left">
              {currentUser.name}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/20 uppercase font-mono hidden sm:inline">
              {currentUser.role}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                firebaseStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
              title={firebaseStatus === 'connected' ? 'ফায়ারবেস ক্লাউড কানেক্টেড' : 'কানেক্ট হচ্ছে...'}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

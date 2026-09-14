import React, { useState } from 'react';
import { ShopProvider } from './context/ShopContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { SaleEntryModal } from './components/SaleEntryModal';
import { NewProductModal } from './components/NewProductModal';
import { DuePaymentModal } from './components/DuePaymentModal';
import { OldInvoiceModal } from './components/OldInvoiceModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { SheetSyncModal } from './components/SheetSyncModal';
import { ExpenseEntryModal } from './components/ExpenseEntryModal';
import { ReportModal } from './components/ReportModal';
import { SheetsConfirmModal } from './components/SheetsConfirmModal';
import { UserAuthModal } from './components/UserAuthModal';
import { useShop } from './context/ShopContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'sheets'>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const {
    confirmModalState,
    connectedSpreadsheetTitle,
    connectedSpreadsheetId,
    products,
    stock,
    sales,
    customers,
    duePayments,
    expenses,
    executeConfirmedSync,
    closeConfirmationModal,
  } = useShop();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Sidebar - identical to screenshot 5 */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Banner (Screenshot 5 green banner) */}
        <Header
          onToggleMobileMenu={() => setIsOpenMobile((prev) => !prev)}
          title={currentView === 'dashboard' ? '1. Dashboard Sheet' : 'Men\'s & women Fashion - Google Sheets'}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? <Dashboard /> : <GoogleSheetsView />}
        </main>
      </div>

      {/* All Pop-up Modals requested by user */}
      <SaleEntryModal />
      <NewProductModal />
      <DuePaymentModal />
      <OldInvoiceModal />
      <InvoicePrintModal />
      <SheetSyncModal />
      <ExpenseEntryModal />
      <ReportModal />
      <UserAuthModal />

      {/* Google Sheets Workspace Integration Safe Confirmation Modal */}
      <SheetsConfirmModal
        isOpen={confirmModalState.isOpen}
        type={confirmModalState.type}
        spreadsheetTitle={connectedSpreadsheetTitle}
        spreadsheetId={connectedSpreadsheetId}
        stats={{
          productsCount: products.length,
          stockCount: stock.length,
          salesCount: sales.length,
          customersCount: customers.length,
          dueCount: duePayments.length,
          expensesCount: expenses.length,
        }}
        onConfirm={executeConfirmedSync}
        onCancel={closeConfirmationModal}
        isLoading={confirmModalState.isLoading}
      />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

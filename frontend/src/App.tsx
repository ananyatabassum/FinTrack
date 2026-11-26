import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { categoriesApi, transactionsApi } from './api/services';
import { extractApiError } from './api/client';
import type { Category, DateRange, Transaction, TransactionPayload } from './types';
import { getDateRangeForPreset } from './utils/format';
import { AppLayout } from './components/AppLayout';
import { TransactionModal } from './components/TransactionModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedShell() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { formatMoney } = useCurrency();

  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getDateRangeForPreset('THIS_MONTH')
  );
  const [quickSearch, setQuickSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    categoriesApi
      .list(dateRange.startDate, dateRange.endDate)
      .then(setCategories)
      .catch(() => {
        // Handled cleanly in page views
      });
  }, [isAuthenticated, dateRange.startDate, dateRange.endDate, refreshKey]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenAdd = () => {
    setEditingTx(null);
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };

  const handleSaveTx = async (payload: TransactionPayload, id?: number) => {
    try {
      if (id) {
        await transactionsApi.update(id, payload);
        showToast(`Updated "${payload.title}"`);
      } else {
        await transactionsApi.create(payload);
        showToast(`Added "${payload.title}"`);
      }
      triggerRefresh();
    } catch (err) {
      throw new Error(extractApiError(err, 'Failed to save transaction'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx) return;
    setDeletingBusy(true);
    try {
      await transactionsApi.remove(deletingTx.id);
      showToast(`Deleted "${deletingTx.title}"`);
      setDeletingTx(null);
      triggerRefresh();
    } catch (err) {
      showToast(extractApiError(err, 'Failed to delete transaction'), 'error');
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <AppLayout
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        quickSearch={quickSearch}
        onQuickSearchChange={setQuickSearch}
        onOpenAddTransaction={handleOpenAdd}
      >
        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                dateRange={dateRange}
                refreshKey={refreshKey}
                onEditTransaction={handleEditTx}
                onDeleteTransaction={setDeletingTx}
                onOpenAddTransaction={handleOpenAdd}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <TransactionsPage
                categories={categories}
                dateRange={dateRange}
                quickSearch={quickSearch}
                onQuickSearchChange={setQuickSearch}
                refreshKey={refreshKey}
                onOpenAddTransaction={handleOpenAdd}
                onEditTransaction={handleEditTx}
                onDeleteTransaction={setDeletingTx}
              />
            }
          />
          <Route
            path="/budgets"
            element={
              <BudgetsPage
                dateRange={dateRange}
                refreshKey={refreshKey}
                onCategoriesUpdated={triggerRefresh}
              />
            }
          />
          <Route
            path="/analytics"
            element={<AnalyticsPage dateRange={dateRange} refreshKey={refreshKey} />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        categories={categories}
        editingTransaction={editingTx}
        onSave={handleSaveTx}
      />

      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => !deletingBusy && setDeletingTx(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827]"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Delete Transaction?
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {deletingTx.title}
              </span>{' '}
              (<span className="tabular-nums">{formatMoney(deletingTx.amount)}</span>)? This
              action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingBusy}
                onClick={() => setDeletingTx(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingBusy}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[#F43F5E] px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {deletingBusy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PublicLoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<PublicLoginRoute />} />
                <Route path="/*" element={<ProtectedShell />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

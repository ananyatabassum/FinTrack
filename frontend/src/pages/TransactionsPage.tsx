import { useEffect, useState } from 'react';
import {
  Download,
  Pencil,
  Trash2,
  Repeat,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { transactionsApi } from '../api/services';
import { extractApiError } from '../api/client';
import type {
  Category,
  DateRange,
  PagedResponse,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types';
import {
  downloadBlob,
  formatShortDate,
  paymentMethodLabel,
} from '../utils/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { SkeletonRows } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionsPageProps {
  categories: Category[];
  dateRange: DateRange;
  quickSearch: string;
  onQuickSearchChange: (val: string) => void;
  refreshKey: number;
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export function TransactionsPage({
  categories,
  dateRange,
  quickSearch,
  onQuickSearchChange,
  refreshKey,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionsPageProps) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | ''>('');
  const [useHeaderDateRange, setUseHeaderDateRange] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PagedResponse<Transaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();
  const { currency, formatMoney } = useCurrency();

  useEffect(() => {
    setPage(0);
  }, [quickSearch, typeFilter, categoryFilter, paymentFilter, useHeaderDateRange, dateRange]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    transactionsApi
      .list({
        keyword: quickSearch,
        type: typeFilter,
        categoryId: categoryFilter,
        paymentMethod: paymentFilter,
        startDate: useHeaderDateRange ? dateRange.startDate : undefined,
        endDate: useHeaderDateRange ? dateRange.endDate : undefined,
        page,
        size: 12,
      })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) showToast(extractApiError(err, 'Failed to load transactions'), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    quickSearch,
    typeFilter,
    categoryFilter,
    paymentFilter,
    useHeaderDateRange,
    dateRange.startDate,
    dateRange.endDate,
    page,
    refreshKey,
    showToast,
  ]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await transactionsApi.exportCsv({
        keyword: quickSearch,
        type: typeFilter,
        categoryId: categoryFilter,
        paymentMethod: paymentFilter,
        startDate: useHeaderDateRange ? dateRange.startDate : undefined,
        endDate: useHeaderDateRange ? dateRange.endDate : undefined,
        currency,
      });
      downloadBlob(blob, 'fintrack-transactions.csv');
      showToast('Exported filtered transactions to CSV');
    } catch (err) {
      showToast(extractApiError(err, 'Failed to export CSV'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    onQuickSearchChange('');
    setTypeFilter('');
    setCategoryFilter('');
    setPaymentFilter('');
    setUseHeaderDateRange(false);
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    quickSearch || typeFilter || categoryFilter || paymentFilter || useHeaderDateRange
  );

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data
              ? `${data.totalElements} matching ${data.totalElements === 1 ? 'record' : 'records'}`
              : 'Manage income, expenses, and shared splits'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4 text-[#6366F1]" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card dark:border-slate-800 dark:bg-[#111827]">
        <select
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
          className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">All Types</option>
          <option value="EXPENSE">Expenses Only</option>
          <option value="INCOME">Income Only</option>
        </select>

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value ? Number(e.target.value) : '')
          }
          className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by payment method"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentMethod | '')}
          className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="">All Payment Methods</option>
          <option value="CARD">Card</option>
          <option value="CASH">Cash</option>
          <option value="UPI_BANK">UPI / Bank</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <input
            type="checkbox"
            checked={useHeaderDateRange}
            onChange={(e) => setUseHeaderDateRange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
          />
          <span>
            Filter by selected range ({formatShortDate(dateRange.startDate)} –{' '}
            {formatShortDate(dateRange.endDate)})
          </span>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Transactions Table Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-card dark:border-slate-800 dark:bg-[#111827]">
        {loading ? (
          <SkeletonRows count={8} />
        ) : data && data.content.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Method</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {data.content.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-slate-50/75 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: tx.categoryColor }}
                          >
                            <CategoryIcon icon={tx.categoryIcon} className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-semibold text-slate-900 dark:text-white">
                                {tx.title}
                              </span>
                              {tx.isRecurring && (
                                <span
                                  title="Recurring monthly"
                                  className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300"
                                >
                                  <Repeat className="h-2.5 w-2.5" />
                                  Recurring
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              {tx.notes && <span className="truncate max-w-[200px]">{tx.notes}</span>}
                              {tx.splitWith && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  <Users className="h-2.5 w-2.5" />
                                  Split: {tx.splitWith}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tx.categoryColor }}
                          />
                          {tx.categoryName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {paymentMethodLabel(tx.paymentMethod)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {formatShortDate(tx.date)}
                      </td>
                      <td className="tabular-nums whitespace-nowrap px-3 py-3 text-right font-bold">
                        <span
                          className={
                            tx.type === 'INCOME'
                              ? 'text-[#10B981]'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                          {formatMoney(tx.amount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            aria-label={`Edit ${tx.title}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#6366F1] dark:hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx)}
                            aria-label={`Delete ${tx.title}`}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-[#F43F5E] dark:hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>
                Page {data.page + 1} of {Math.max(data.totalPages, 1)} ({data.totalElements} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={data.page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No matching transactions"
            description="Try adjusting your search keyword, category filter, or date range."
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAddTransaction}
                  className="rounded-xl bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                >
                  + Add Transaction
                </button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

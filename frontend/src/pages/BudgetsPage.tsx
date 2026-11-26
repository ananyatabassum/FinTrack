import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { categoriesApi } from '../api/services';
import { extractApiError } from '../api/client';
import type { Category, CategoryPayload, DateRange } from '../types';
import { formatShortDate } from '../utils/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { CategoryModal } from '../components/CategoryModal';
import { SkeletonCard } from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

interface BudgetsPageProps {
  dateRange: DateRange;
  refreshKey: number;
  onCategoriesUpdated: () => void;
}

export function BudgetsPage({
  dateRange,
  refreshKey,
  onCategoriesUpdated,
}: BudgetsPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [inlineBudgetId, setInlineBudgetId] = useState<number | null>(null);
  const [inlineBudgetVal, setInlineBudgetVal] = useState('');
  const { showToast } = useToast();
  const { currencyInfo, formatMoney, formatCompactMoney } = useCurrency();

  useEffect(() => {
    let active = true;
    setLoading(true);
    categoriesApi
      .list(dateRange.startDate, dateRange.endDate)
      .then((res) => {
        if (active) setCategories(res);
      })
      .catch((err) => {
        if (active) showToast(extractApiError(err, 'Failed to load categories'), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dateRange.startDate, dateRange.endDate, refreshKey, showToast]);

  const handleSaveCategory = async (payload: CategoryPayload, id?: number) => {
    if (id) {
      await categoriesApi.update(id, payload);
      showToast(`Updated "${payload.name}"`);
    } else {
      await categoriesApi.create(payload);
      showToast(`Created category "${payload.name}"`);
    }
    onCategoriesUpdated();
  };

  const handleSaveInlineBudget = async (cat: Category) => {
    const num = inlineBudgetVal.trim() === '' ? null : parseFloat(inlineBudgetVal);
    if (num !== null && (Number.isNaN(num) || num < 0)) {
      showToast('Budget cap must be 0 or greater', 'error');
      return;
    }
    try {
      await categoriesApi.updateBudget(cat.id, num);
      setInlineBudgetId(null);
      showToast(`Updated monthly cap for ${cat.name}`);
      onCategoriesUpdated();
    } catch (err) {
      showToast(extractApiError(err, 'Failed to update budget'), 'error');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    try {
      await categoriesApi.remove(cat.id);
      showToast(`Deleted category "${cat.name}"`);
      onCategoriesUpdated();
    } catch (err) {
      showToast(extractApiError(err, 'Unable to delete category'), 'error');
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const totalBudget = expenseCategories.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);
  const totalSpent = expenseCategories.reduce((sum, c) => sum + (c.spentInPeriod || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budgets &amp; Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tracking spend from {formatShortDate(dateRange.startDate)} to{' '}
            {formatShortDate(dateRange.endDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCat(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Overall Budget Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Monthly Cap
          </span>
          <p className="tabular-nums mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(totalBudget)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Period Spending
          </span>
          <p className="tabular-nums mt-2 text-2xl font-bold text-[#F43F5E]">
            {formatMoney(totalSpent)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Remaining Headroom
          </span>
          <p
            className={`tabular-nums mt-2 text-2xl font-bold ${
              totalBudget - totalSpent >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
            }`}
          >
            {formatMoney(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Expense Categories Grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Expense Categories &amp; Monthly Caps
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : expenseCategories.map((cat) => {
                const pct = cat.utilizationPercent ?? 0;
                const isExceeded = cat.monthlyBudget && pct >= 100;
                const isWarning = cat.monthlyBudget && pct >= 80 && pct < 100;
                const barClass = isExceeded
                  ? 'bg-[#F43F5E]'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-[#10B981]';

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card transition hover:shadow-card-hover dark:border-slate-800 dark:bg-[#111827]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon icon={cat.icon} className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {cat.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {cat.transactionCount}{' '}
                              {cat.transactionCount === 1 ? 'transaction' : 'transactions'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCat(cat);
                              setModalOpen(true);
                            }}
                            aria-label={`Edit ${cat.name}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#6366F1] dark:hover:bg-slate-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!cat.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              aria-label={`Delete ${cat.name}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#F43F5E] dark:hover:bg-rose-500/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="tabular-nums text-lg font-bold text-slate-900 dark:text-white">
                          {formatMoney(cat.spentInPeriod)}
                        </span>
                        <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
                          {cat.monthlyBudget
                            ? `of ${formatCompactMoney(cat.monthlyBudget)} cap`
                            : 'No cap set'}
                        </span>
                      </div>

                      {cat.monthlyBudget ? (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full transition-all ${barClass}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            {isExceeded ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#F43F5E]">
                                <AlertTriangle className="h-3 w-3" />
                                Over budget ({pct.toFixed(0)}%)
                              </span>
                            ) : isWarning ? (
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Approaching cap ({pct.toFixed(0)}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-medium text-[#10B981]">
                                <CheckCircle2 className="h-3 w-3" />
                                On track ({pct.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2.5 text-xs text-slate-400">
                          Set a monthly cap to enable threshold alerts.
                        </p>
                      )}
                    </div>

                    {/* Quick Inline Budget Cap Editor */}
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {inlineBudgetId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={inlineBudgetVal}
                            onChange={(e) => setInlineBudgetVal(e.target.value)}
                            placeholder={`Cap (${currencyInfo.symbol})`}
                            className="tabular-nums w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineBudget(cat)}
                            className="rounded-lg bg-[#6366F1] px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlineBudgetId(null)}
                            className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setInlineBudgetId(cat.id);
                            setInlineBudgetVal(
                              cat.monthlyBudget !== null ? String(cat.monthlyBudget) : ''
                            );
                          }}
                          className="text-xs font-semibold text-[#6366F1] hover:underline"
                        >
                          {cat.monthlyBudget ? 'Adjust Monthly Cap' : '+ Set Monthly Cap'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Income Categories */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Income Sources
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card dark:border-slate-800 dark:bg-[#111827]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon icon={cat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{cat.name}</p>
                  <p className="tabular-nums text-xs font-semibold text-[#10B981]">
                    +{formatMoney(cat.spentInPeriod)}
                  </p>
                </div>
              </div>
              {!cat.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#F43F5E] dark:hover:bg-rose-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingCategory={editingCat}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

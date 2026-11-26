import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Category, CategoryPayload, TransactionType } from '../types';
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from './CategoryIcon';
import { useCurrency } from '../context/CurrencyContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory?: Category | null;
  onSave: (payload: CategoryPayload, id?: number) => Promise<void>;
}

const COLOR_SWATCHES = [
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#F43F5E',
  '#06B6D4',
  '#8B5CF6',
  '#EC4899',
  '#3B82F6',
  '#14B8A6',
  '#64748B',
];

export function CategoryModal({
  isOpen,
  onClose,
  editingCategory,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('tag');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currencyInfo } = useCurrency();

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingCategory) {
      setName(editingCategory.name);
      setType(editingCategory.type);
      setColor(editingCategory.color);
      setIcon(editingCategory.icon);
      setMonthlyBudget(
        editingCategory.monthlyBudget !== null ? String(editingCategory.monthlyBudget) : ''
      );
    } else {
      setName('');
      setType('EXPENSE');
      setColor('#6366F1');
      setIcon('tag');
      setMonthlyBudget('300');
    }
  }, [isOpen, editingCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    const parsedBudget =
      type === 'EXPENSE' && monthlyBudget.trim() !== '' ? parseFloat(monthlyBudget) : null;
    if (parsedBudget !== null && (Number.isNaN(parsedBudget) || parsedBudget < 0)) {
      setError('Budget limit must be 0 or greater.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          type,
          color,
          icon,
          monthlyBudget: parsedBudget,
        },
        editingCategory?.id
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827]"
      >
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {editingCategory ? 'Edit Category' : 'Create Custom Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pets & Vet"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            {type === 'EXPENSE' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monthly Cap ({currencyInfo.shortLabel})
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    {currencyInfo.symbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="Optional"
                    className="tabular-nums w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-7 pr-3 text-sm text-slate-900 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === swatch
                      ? 'scale-110 ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-[#111827]'
                      : 'hover:scale-105'
                  }`}
                  aria-label={`Select color ${swatch}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIcon(opt.id)}
                  title={opt.label}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] transition ${
                    icon === opt.id
                      ? 'border-[#6366F1] bg-indigo-50 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <CategoryIcon icon={opt.id} className="h-4 w-4" />
                  <span className="truncate max-w-full">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#6366F1] px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingCategory ? 'Save Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

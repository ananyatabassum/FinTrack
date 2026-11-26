import React, { useEffect, useMemo, useState } from 'react';
import { X, Repeat, Users, CreditCard, Banknote, Landmark } from 'lucide-react';
import type {
  Category,
  CurrencyCode,
  PaymentMethod,
  Transaction,
  TransactionPayload,
  TransactionType,
} from '../types';
import { toIsoDate } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingTransaction?: Transaction | null;
  onSave: (payload: TransactionPayload, id?: number) => Promise<void>;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CARD', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'CASH', label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
  { value: 'UPI_BANK', label: 'UPI / Bank', icon: <Landmark className="h-4 w-4" /> },
];

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  editingTransaction,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [splitWith, setSplitWith] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currency, currencyInfo, currencies, setCurrency } = useCurrency();

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
      setIsRecurring(editingTransaction.isRecurring);
      setSplitWith(editingTransaction.splitWith || '');
    } else {
      setType('EXPENSE');
      setTitle('');
      setAmount('');
      const firstExpense = categories.find((c) => c.type === 'EXPENSE');
      setCategoryId(firstExpense ? firstExpense.id : '');
      setPaymentMethod('CARD');
      setDate(toIsoDate(new Date()));
      setNotes('');
      setIsRecurring(false);
      setSplitWith('');
    }
  }, [isOpen, editingTransaction, categories]);

  useEffect(() => {
    if (!isOpen) return;
    const existsInType = filteredCategories.some((c) => c.id === categoryId);
    if (!existsInType) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [type, filteredCategories, categoryId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please enter a transaction title.');
      return;
    }
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(
        {
          title: title.trim(),
          amount: parsedAmount,
          type,
          categoryId: Number(categoryId),
          paymentMethod,
          date,
          notes: notes.trim() || undefined,
          isRecurring,
          splitWith: splitWith.trim() || undefined,
        },
        editingTransaction?.id
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#111827]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record personal or shared cash flow activity
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Type switcher */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  type === 'EXPENSE'
                    ? 'bg-white text-[#F43F5E] shadow-sm dark:bg-[#111827]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  type === 'INCOME'
                    ? 'bg-white text-[#10B981] shadow-sm dark:bg-[#111827]'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="tx-title"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Title / Merchant
              </label>
              <input
                id="tx-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Whole Foods Market"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="tx-amount"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Amount ({currencyInfo.shortLabel})
                </label>
                <select
                  aria-label="Transaction display currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 outline-none focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.shortLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {currencyInfo.symbol}
                </span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="tabular-nums w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tx-date"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tx-category"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Category
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const active = paymentMethod === pm.value;
                return (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? 'border-[#6366F1] bg-indigo-50 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pm.icon}
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="tx-split"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Split With (Optional)</span>
            </label>
            <input
              id="tx-split"
              type="text"
              value={splitWith}
              onChange={(e) => setSplitWith(e.target.value)}
              placeholder="e.g., Maya Chen, Liam Patel"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-[#6366F1] dark:bg-indigo-500/15">
                <Repeat className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Recurring Transaction
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Repeats every month (rent, payroll, SaaS)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#6366F1] focus:ring-[#6366F1]"
            />
          </label>

          <div>
            <label
              htmlFor="tx-notes"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Notes (Optional)
            </label>
            <textarea
              id="tx-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context or receipt details..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => {
              const form = (e.currentTarget.closest('[role="dialog"]')?.querySelector('form'));
              form?.requestSubmit();
            }}
            className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-60"
          >
            {submitting
              ? 'Saving...'
              : editingTransaction
              ? 'Save Changes'
              : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ReceiptText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/70 text-[#6366F1] dark:border-indigo-500/20 dark:bg-indigo-500/10">
        <ReceiptText className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-white dark:ring-[#111827]" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

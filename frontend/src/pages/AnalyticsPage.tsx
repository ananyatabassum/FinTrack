import { useEffect, useState } from 'react';
import { Users, Repeat, CreditCard, Banknote, Landmark } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { dashboardApi } from '../api/services';
import { extractApiError } from '../api/client';
import type { DashboardResponse, DateRange } from '../types';
import { formatShortDate } from '../utils/format';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

interface AnalyticsPageProps {
  dateRange: DateRange;
  refreshKey: number;
}

export function AnalyticsPage({ dateRange, refreshKey }: AnalyticsPageProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { formatMoney, formatCompactMoney } = useCurrency();

  useEffect(() => {
    let active = true;
    setLoading(true);
    dashboardApi
      .getSummary(dateRange.startDate, dateRange.endDate)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) showToast(extractApiError(err, 'Failed to load analytics'), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dateRange.startDate, dateRange.endDate, refreshKey, showToast]);

  const paymentIcon = (method: string) => {
    if (method === 'CARD') return <CreditCard className="h-4 w-4 text-[#6366F1]" />;
    if (method === 'CASH') return <Banknote className="h-4 w-4 text-[#10B981]" />;
    return <Landmark className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Spending Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Deep insights from {formatShortDate(dateRange.startDate)} to{' '}
          {formatShortDate(dateRange.endDate)}
        </p>
      </div>

      {/* Shared & Recurring Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Shared / Split Expenses
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="tabular-nums mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {formatMoney(data.sharedSummary.totalSharedAmount)}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Across {data.sharedSummary.sharedTransactionCount} shared roommate or group{' '}
              {data.sharedSummary.sharedTransactionCount === 1 ? 'entry' : 'entries'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recurring Commitments
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#F43F5E] dark:bg-rose-500/15 dark:text-rose-300">
                <Repeat className="h-4 w-4" />
              </div>
            </div>
            <p className="tabular-nums mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {formatMoney(data.sharedSummary.recurringMonthlyTotal)}
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Across {data.sharedSummary.recurringCount} recurring bills &amp; subscriptions
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Spending Categories Bar Chart */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-7">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Top Expense Categories
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Ranked by total outflow in the selected range
          </p>

          {loading ? (
            <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          ) : data && data.categoryBreakdown.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categoryBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(v) => formatCompactMoney(Number(v))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={115}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: number) => formatMoney(val)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(148,163,184,0.25)',
                      backgroundColor: 'rgba(15, 23, 42, 0.94)',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {data.categoryBreakdown.map((entry) => (
                      <Cell key={entry.categoryId} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No expense analytics"
              description="Record expenses in this date range to compare category volume."
            />
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Payment Method Mix
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            How expenses are funded across Card, Cash, and UPI / Bank
          </p>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60"
                />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {data.paymentMethodBreakdown.map((pm) => (
                <div
                  key={pm.paymentMethod}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                        {paymentIcon(pm.paymentMethod)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {pm.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {pm.count} {pm.count === 1 ? 'transaction' : 'transactions'}
                        </p>
                      </div>
                    </div>
                    <div className="tabular-nums text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatMoney(pm.total)}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {pm.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#6366F1]"
                      style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

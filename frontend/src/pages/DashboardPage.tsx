import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Pencil,
  Trash2,
  Repeat,
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../api/services';
import { extractApiError } from '../api/client';
import type { DashboardResponse, DateRange, Transaction } from '../types';
import {
  formatShortDate,
  paymentMethodLabel,
} from '../utils/format';
import { CategoryIcon } from '../components/CategoryIcon';
import { SkeletonCard, SkeletonRows } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';

interface DashboardPageProps {
  dateRange: DateRange;
  refreshKey: number;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
  onOpenAddTransaction: () => void;
}

export function DashboardPage({
  dateRange,
  refreshKey,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddTransaction,
}: DashboardPageProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendMode, setTrendMode] = useState<'area' | 'bar'>('area');
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
        if (active) showToast(extractApiError(err, 'Failed to load dashboard'), 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dateRange.startDate, dateRange.endDate, refreshKey, showToast]);

  const kpiCards = data
    ? [
        {
          label: 'Total Balance',
          value: formatMoney(data.kpis.totalBalance),
          delta: data.kpis.balanceDeltaPct,
          deltaSuffix: '%',
          positiveIsGood: true,
          icon: Wallet,
          iconBg: 'bg-indigo-50 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300',
        },
        {
          label: 'Monthly Income',
          value: formatMoney(data.kpis.monthlyIncome),
          delta: data.kpis.incomeDeltaPct,
          deltaSuffix: '%',
          positiveIsGood: true,
          icon: TrendingUp,
          iconBg: 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/15 dark:text-emerald-300',
        },
        {
          label: 'Monthly Expenses',
          value: formatMoney(data.kpis.monthlyExpenses),
          delta: data.kpis.expensesDeltaPct,
          deltaSuffix: '%',
          positiveIsGood: false,
          icon: TrendingDown,
          iconBg: 'bg-rose-50 text-[#F43F5E] dark:bg-rose-500/15 dark:text-rose-300',
        },
        {
          label: 'Savings Rate',
          value: `${data.kpis.savingsRate.toFixed(1)}%`,
          delta: data.kpis.savingsRateDeltaPct,
          deltaSuffix: ' pts',
          positiveIsGood: true,
          icon: PiggyBank,
          iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing activity from {formatShortDate(dateRange.startDate)} to{' '}
            {formatShortDate(dateRange.endDate)}
          </p>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              const isPositive = kpi.delta >= 0;
              const isGood = kpi.positiveIsGood ? isPositive : !isPositive;
              return (
                <div
                  key={kpi.label}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card transition duration-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-[#111827]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.iconBg}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="tabular-nums mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {kpi.value}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                    <span
                      className={`tabular-nums inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${
                        isGood
                          ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-rose-50 text-[#F43F5E] dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {isPositive ? '+' : ''}
                      {kpi.delta.toFixed(1)}
                      {kpi.deltaSuffix}
                    </span>
                    <span className="text-slate-400">vs. last period</span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Bento Row: Cash Flow Trend (7 cols) + Spending by Category Donut (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cash Flow Trend */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Cash Flow Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Income vs. Expenses over the selected period
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setTrendMode('area')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  trendMode === 'area'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-[#111827] dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Area
              </button>
              <button
                type="button"
                onClick={() => setTrendMode('bar')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  trendMode === 'bar'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-[#111827] dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          ) : data && data.cashFlowTrend.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {trendMode === 'area' ? (
                  <AreaChart
                    data={data.cashFlowTrend}
                    margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatCompactMoney(Number(v))}
                    />
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        formatMoney(val),
                        name === 'income' ? 'Income' : 'Expenses',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(148,163,184,0.25)',
                        backgroundColor: 'rgba(15, 23, 42, 0.94)',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGrad)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={data.cashFlowTrend}
                    margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatCompactMoney(Number(v))}
                    />
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        formatMoney(val),
                        name === 'income' ? 'Income' : 'Expenses',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(148,163,184,0.25)',
                        backgroundColor: 'rgba(15, 23, 42, 0.94)',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No cash flow data"
              description="Add income or expense entries in this date range to visualize trends."
            />
          )}
        </div>

        {/* Spending by Category Donut */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Spending by Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expense distribution breakdown
              </p>
            </div>
            <span className="tabular-nums text-xs font-semibold text-slate-500 dark:text-slate-400">
              {data ? formatMoney(data.kpis.monthlyExpenses) : formatMoney(0)}
            </span>
          </div>

          {loading ? (
            <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          ) : data && data.categoryBreakdown.length > 0 ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
              <div className="h-48 w-full shrink-0 sm:w-5/12 lg:w-full xl:w-5/12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {data.categoryBreakdown.map((item) => (
                        <Cell key={item.categoryId} fill={item.color} stroke="none" />
                      ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-56">
                {data.categoryBreakdown.map((item) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {item.name}
                      </span>
                    </div>
                    <div className="tabular-nums shrink-0 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatMoney(item.amount)}
                      </span>
                      <span className="ml-1.5 text-slate-400">{item.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Expense breakdown appears once you record spending in this period."
            />
          )}
        </div>
      </div>

      {/* Bottom Bento Row: Budget Health (5 cols) + Recent Transactions Feed (7 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Budget Health Panel */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Budget Health
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alerts trigger at 80% &amp; 100%+ usage
              </p>
            </div>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6366F1] hover:underline"
            >
              <span>Manage</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonRows count={5} />
          ) : data && data.budgetHealth.length > 0 ? (
            <div className="space-y-4">
              {data.budgetHealth.slice(0, 6).map((item) => {
                const barWidth = Math.min(item.utilizationPercent, 100);
                const barColor =
                  item.status === 'EXCEEDED'
                    ? 'bg-[#F43F5E]'
                    : item.status === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-[#10B981]';
                return (
                  <div key={item.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <CategoryIcon icon={item.icon} className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {item.categoryName}
                        </span>
                        {item.status === 'EXCEEDED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#F43F5E] dark:bg-rose-500/15 dark:text-rose-300">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Over Budget
                          </span>
                        )}
                        {item.status === 'WARNING' && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                            Near Cap
                          </span>
                        )}
                      </div>
                      <div className="tabular-nums shrink-0 text-right">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCompactMoney(item.spent)}
                        </span>
                        <span className="text-slate-400">
                          {' '}
                          / {formatCompactMoney(item.limit)} ({item.utilizationPercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No budgets configured"
              description="Set monthly spending caps on categories to monitor budget health."
            />
          )}
        </div>

        {/* Recent Transactions Feed */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-card dark:border-slate-800 dark:bg-[#111827] lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 6 entries across all accounts
              </p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6366F1] hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonRows count={6} />
          ) : data && data.recentTransactions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: tx.categoryColor }}
                    >
                      <CategoryIcon icon={tx.categoryIcon} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {tx.title}
                        </p>
                        {tx.isRecurring && (
                          <span
                            title="Recurring"
                            className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300"
                          >
                            <Repeat className="h-2.5 w-2.5" />
                          </span>
                        )}
                        {tx.splitWith && (
                          <span
                            title={`Split with ${tx.splitWith}`}
                            className="hidden items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex"
                          >
                            <Users className="h-2.5 w-2.5" />
                            {tx.splitWith}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.categoryName}</span>
                        <span>•</span>
                        <span>{formatShortDate(tx.date)}</span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {paymentMethodLabel(tx.paymentMethod)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`tabular-nums text-sm font-bold ${
                        tx.type === 'INCOME'
                          ? 'text-[#10B981]'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        aria-label={`Edit ${tx.title}`}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#6366F1] dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx)}
                        aria-label={`Delete ${tx.title}`}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-[#F43F5E] dark:hover:bg-rose-500/15"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No transactions yet"
              description="Record your first transaction to see live cash flow activity here."
              action={
                <button
                  type="button"
                  onClick={onOpenAddTransaction}
                  className="rounded-xl bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600"
                >
                  + Add Transaction
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

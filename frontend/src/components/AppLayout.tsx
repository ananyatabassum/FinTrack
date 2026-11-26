import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  Settings,
  Search,
  Sun,
  Moon,
  Plus,
  Calendar,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import type { CurrencyCode, DateRange, DateRangePreset } from '../types';
import { getDateRangeForPreset } from '../utils/format';

interface AppLayoutProps {
  children: React.ReactNode;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  quickSearch: string;
  onQuickSearchChange: (val: string) => void;
  onOpenAddTransaction: () => void;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets & Categories', shortLabel: 'Budgets', icon: PiggyBank },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Export & Settings', shortLabel: 'Settings', icon: Settings },
];

export function AppLayout({
  children,
  dateRange,
  onDateRangeChange,
  quickSearch,
  onQuickSearchChange,
  onOpenAddTransaction,
}: AppLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { currency, currencies, setCurrency } = useCurrency();
  const navigate = useNavigate();

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === 'CUSTOM') {
      onDateRangeChange({ ...dateRange, preset: 'CUSTOM' });
    } else {
      onDateRangeChange(getDateRangeForPreset(preset));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/transactions');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#E2E8F0] bg-white px-4 py-5 dark:border-slate-800 dark:bg-[#111827] md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1] text-white shadow-sm shadow-indigo-500/30">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              FinTrack
            </span>
            <p className="text-[11px] font-medium text-slate-400">Personal &amp; Shared</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile card at bottom */}
        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/70">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-[#6366F1] dark:bg-indigo-500/20 dark:text-indigo-300">
                {user?.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'FT'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {user?.fullName}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200/70 hover:text-rose-500 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col pb-20 md:pl-64 md:pb-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#111827]/85 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            {/* Mobile Brand + Quick Search */}
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366F1] text-white md:hidden">
                <Wallet className="h-4 w-4" />
              </div>
              <form onSubmit={handleSearchSubmit} className="relative min-w-[200px] max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={quickSearch}
                  onChange={(e) => onQuickSearchChange(e.target.value)}
                  placeholder="Search transactions, notes, split..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6366F1] focus:bg-white focus:ring-2 focus:ring-[#6366F1]/15 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:bg-slate-900"
                />
              </form>
            </div>

            {/* Date Range + Theme + Add CTA */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700/80 dark:bg-slate-900/70">
                <Calendar className="ml-1.5 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
                {(['THIS_MONTH', 'LAST_MONTH', 'CUSTOM'] as DateRangePreset[]).map((preset) => {
                  const active = dateRange.preset === preset;
                  const label =
                    preset === 'THIS_MONTH'
                      ? 'This Month'
                      : preset === 'LAST_MONTH'
                      ? 'Last Month'
                      : 'Custom';
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetChange(preset)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        active
                          ? 'bg-white text-slate-900 shadow-sm dark:bg-[#1E293B] dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {dateRange.preset === 'CUSTOM' && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    aria-label="Custom start date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, startDate: e.target.value })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    aria-label="Custom end date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, endDate: e.target.value })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <select
                aria-label="Select currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-[#6366F1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.shortLabel}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={onOpenAddTransaction}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-600 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-[#111827]/95 md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                  isActive
                    ? 'text-[#6366F1] dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.shortLabel || item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

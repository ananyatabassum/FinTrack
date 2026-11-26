import { useState } from 'react';
import { Download, Sun, Moon, LogOut, ShieldCheck, Database, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { transactionsApi } from '../api/services';
import { extractApiError } from '../api/client';
import { downloadBlob } from '../utils/format';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currency, currencies, setCurrency } = useCurrency();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const blob = await transactionsApi.exportCsv({ currency });
      downloadBlob(blob, 'fintrack-full-ledger.csv');
      showToast('Full transaction ledger exported to CSV');
    } catch (err) {
      showToast(extractApiError(err, 'Unable to export CSV'), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Export &amp; Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account preferences, appearance, and financial reports
        </p>
      </div>

      {/* Account Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-base font-bold text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300">
              {user?.fullName
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'FT'}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {user?.fullName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-sm font-semibold text-[#F43F5E] transition hover:bg-rose-100/80 dark:border-rose-500/30 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Currency Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[#6366F1]" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Display Currency
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose how amounts are formatted across dashboards, budgets, and CSV exports.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {currencies.map((c) => {
            const active = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  showToast(`Currency switched to ${c.name} (${c.symbol})`);
                }}
                className={`flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition ${
                  active
                    ? 'border-[#6366F1] bg-indigo-50/70 text-[#6366F1] dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base font-bold">{c.symbol}</span>
                <span className="mt-1 text-xs font-semibold">{c.shortLabel}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card dark:border-slate-800 dark:bg-[#111827]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Interface Theme
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose between crisp light mode and deep slate dark mode.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              theme === 'light'
                ? 'border-[#6366F1] bg-indigo-50/70 text-[#6366F1]'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              theme === 'dark'
                ? 'border-[#6366F1] bg-indigo-500/15 text-indigo-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* CSV Export Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-card dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Full Ledger CSV Export
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Download all recorded transactions with categories, split tags, and notes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportAll}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? 'Preparing CSV...' : 'Download All CSV'}</span>
          </button>
        </div>
      </div>

      {/* Security & Runtime Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" />
            <span>JWT Authentication</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Stateless HMAC-SHA256 Bearer tokens with BCrypt credential hashing.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Database className="h-4 w-4 text-[#6366F1]" />
            <span>Spring Boot + JPA Storage</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Running on H2 zero-setup storage with ready-to-enable PostgreSQL profile.
          </p>
        </div>
      </div>
    </div>
  );
}

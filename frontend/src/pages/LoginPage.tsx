import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../api/client';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Welcome back to FinTrack');
      } else {
        await register(fullName, email, password);
        showToast('Account created with default categories');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(extractApiError(err, 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await demoLogin();
      showToast('Signed in to demo workspace (Alex Rivera)');
      navigate('/dashboard');
    } catch (err) {
      setError(extractApiError(err, 'Unable to sign in to demo account'));
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] lg:flex-row">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-300"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      {/* Left Fintech Hero Panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-slate-200 bg-slate-900 p-12 text-white dark:border-slate-800 lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#6366F1]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#10B981]/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1] shadow-lg shadow-indigo-500/30">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">FinTrack</span>
            <p className="text-xs text-slate-400">Personal &amp; Shared Ledger</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for clarity, budgets, and shared splits</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Every dollar accounted for,{' '}
            <span className="text-[#10B981]">without the spreadsheet chaos.</span>
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            Track personal income, shared apartment bills, recurring subscriptions, and monthly
            category caps with real-time cash flow analytics.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <TrendingUp className="h-5 w-5 text-[#10B981]" />
              <p className="mt-3 text-sm font-semibold">Cash Flow</p>
              <p className="mt-1 text-xs text-slate-400">Live income vs. spend trends</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <PieChart className="h-5 w-5 text-[#6366F1]" />
              <p className="mt-3 text-sm font-semibold">Budget Caps</p>
              <p className="mt-1 text-xs text-slate-400">80% &amp; 100% smart alerts</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              <p className="mt-3 text-sm font-semibold">JWT Secured</p>
              <p className="mt-1 text-xs text-slate-400">Instant CSV exports anytime</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          Demo workspace pre-seeded with 10 categories &amp; 35 realistic transactions.
        </p>
      </div>

      {/* Right Auth Card */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1] text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">FinTrack</span>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-card dark:border-slate-800 dark:bg-[#111827]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign in to FinTrack' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login'
                  ? 'Access your ledger or launch the pre-seeded demo.'
                  : 'Get started with 10 pre-configured categories.'}
              </p>
            </div>

            {/* One-Click Demo Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-sm font-semibold text-[#6366F1] transition hover:bg-indigo-100/80 disabled:opacity-60 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
            >
              <Sparkles className="h-4 w-4" />
              <span>{demoLoading ? 'Launching Demo...' : 'One-Click Demo Login'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="relative mb-5 flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="mx-3 shrink-0 text-xs font-medium uppercase tracking-wider text-slate-400">
                or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label
                    htmlFor="auth-fullname"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@fintrack.app"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#6366F1] py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-600 disabled:opacity-60"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="font-semibold text-[#6366F1] hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-semibold text-[#6366F1] hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Demo credentials: <code className="font-mono">demo@fintrack.app</code> /{' '}
            <code className="font-mono">Demo@1234</code>
          </p>
        </div>
      </div>
    </div>
  );
}

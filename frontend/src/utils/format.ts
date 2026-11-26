import type { CurrencyCode, DateRange, DateRangePreset, PaymentMethod } from '../types';

export interface CurrencyConfig {
  code: CurrencyCode;
  shortLabel: string;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', shortLabel: 'USD ($)', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'BDT', shortLabel: 'TK (৳)', name: 'Bangladeshi Taka', symbol: '৳', locale: 'en-US' },
  { code: 'INR', shortLabel: 'INR (₹)', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'EUR', shortLabel: 'EUR (€)', name: 'Euro', symbol: '€', locale: 'en-US' },
  { code: 'GBP', shortLabel: 'GBP (£)', name: 'British Pound', symbol: '£', locale: 'en-GB' },
];

export function getCurrencyInfo(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  const num = Number(value ?? 0);
  const info = getCurrencyInfo(currency);
  const formatted = new Intl.NumberFormat(info.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return `${num < 0 ? '-' : ''}${info.symbol}${formatted}`;
}

export function formatCompactCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  const num = Number(value ?? 0);
  const info = getCurrencyInfo(currency);
  const formatted = new Intl.NumberFormat(info.locale, {
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
  return `${num < 0 ? '-' : ''}${info.symbol}${formatted}`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRangeForPreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  if (preset === 'LAST_MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      preset,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
    };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    preset: preset === 'CUSTOM' ? 'CUSTOM' : 'THIS_MONTH',
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
}

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'CARD':
      return 'Card';
    case 'CASH':
      return 'Cash';
    case 'UPI_BANK':
      return 'UPI / Bank';
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

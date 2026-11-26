import React, { createContext, useCallback, useContext, useState } from 'react';
import type { CurrencyCode } from '../types';
import {
  CURRENCIES,
  type CurrencyConfig,
  formatCompactCurrency,
  formatCurrency,
  getCurrencyInfo,
} from '../utils/format';

interface CurrencyContextValue {
  currency: CurrencyCode;
  currencyInfo: CurrencyConfig;
  currencies: CurrencyConfig[];
  setCurrency: (code: CurrencyCode) => void;
  formatMoney: (value: number) => string;
  formatCompactMoney: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const VALID_CODES = new Set<CurrencyCode>(CURRENCIES.map((c) => c.code));

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('fintrack_currency') as CurrencyCode | null;
    return saved && VALID_CODES.has(saved) ? saved : 'USD';
  });

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('fintrack_currency', code);
  }, []);

  const currencyInfo = getCurrencyInfo(currency);

  const formatMoney = useCallback(
    (value: number) => formatCurrency(value, currency),
    [currency]
  );

  const formatCompactMoney = useCallback(
    (value: number) => formatCompactCurrency(value, currency),
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyInfo,
        currencies: CURRENCIES,
        setCurrency,
        formatMoney,
        formatCompactMoney,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}

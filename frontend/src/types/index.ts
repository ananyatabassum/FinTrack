export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CARD' | 'CASH' | 'UPI_BANK';
export type DateRangePreset = 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';
export type CurrencyCode = 'USD' | 'BDT' | 'INR' | 'EUR' | 'GBP';

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  monthlyBudget: number | null;
  isDefault: boolean;
  spentInPeriod: number;
  utilizationPercent: number | null;
  transactionCount: number;
}

export interface CategoryPayload {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  monthlyBudget: number | null;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  paymentMethod: PaymentMethod;
  date: string;
  notes: string | null;
  isRecurring: boolean;
  splitWith: string | null;
}

export interface TransactionPayload {
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  isRecurring: boolean;
  splitWith?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardKpis {
  totalBalance: number;
  balanceDeltaPct: number;
  monthlyIncome: number;
  incomeDeltaPct: number;
  monthlyExpenses: number;
  expensesDeltaPct: number;
  savingsRate: number;
  savingsRateDeltaPct: number;
}

export interface CategoryBreakdownItem {
  categoryId: number;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPoint {
  label: string;
  income: number;
  expenses: number;
}

export interface BudgetHealthItem {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  spent: number;
  limit: number;
  utilizationPercent: number;
  status: 'HEALTHY' | 'WARNING' | 'EXCEEDED';
}

export interface PaymentMethodBreakdownItem {
  paymentMethod: PaymentMethod;
  label: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SharedExpenseSummary {
  totalSharedAmount: number;
  sharedTransactionCount: number;
  recurringMonthlyTotal: number;
  recurringCount: number;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  categoryBreakdown: CategoryBreakdownItem[];
  cashFlowTrend: CashFlowPoint[];
  budgetHealth: BudgetHealthItem[];
  recentTransactions: Transaction[];
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
  sharedSummary: SharedExpenseSummary;
}

export interface DateRange {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

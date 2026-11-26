import { apiClient } from './client';
import type {
  AuthResponse,
  Category,
  CategoryPayload,
  DashboardResponse,
  PagedResponse,
  PaymentMethod,
  Transaction,
  TransactionPayload,
  TransactionType,
  User,
} from '../types';

export interface TransactionFilterQuery {
  keyword?: string;
  type?: TransactionType | '';
  categoryId?: number | '';
  paymentMethod?: PaymentMethod | '';
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  currency?: string;
}

export const authApi = {
  register: async (payload: { fullName: string; email: string; password: string }) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  demoLogin: async () => {
    const { data } = await apiClient.post<AuthResponse>('/auth/demo');
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};

export const dashboardApi = {
  getSummary: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard', {
      params: { startDate, endDate },
    });
    return data;
  },
};

export const transactionsApi = {
  list: async (filters: TransactionFilterQuery) => {
    const params: Record<string, string | number> = {};
    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();
    if (filters.type) params.type = filters.type;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    params.page = filters.page ?? 0;
    params.size = filters.size ?? 12;

    const { data } = await apiClient.get<PagedResponse<Transaction>>('/transactions', { params });
    return data;
  },
  create: async (payload: TransactionPayload) => {
    const { data } = await apiClient.post<Transaction>('/transactions', payload);
    return data;
  },
  update: async (id: number, payload: TransactionPayload) => {
    const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    await apiClient.delete(`/transactions/${id}`);
  },
  exportCsv: async (filters: TransactionFilterQuery) => {
    const params: Record<string, string | number> = {};
    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim();
    if (filters.type) params.type = filters.type;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.currency) params.currency = filters.currency;

    const response = await apiClient.get('/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export const categoriesApi = {
  list: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get<Category[]>('/categories', {
      params: { startDate, endDate },
    });
    return data;
  },
  create: async (payload: CategoryPayload) => {
    const { data } = await apiClient.post<Category>('/categories', payload);
    return data;
  },
  update: async (id: number, payload: CategoryPayload) => {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, payload);
    return data;
  },
  updateBudget: async (id: number, monthlyBudget: number | null) => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}/budget`, {
      monthlyBudget,
    });
    return data;
  },
  remove: async (id: number) => {
    await apiClient.delete(`/categories/${id}`);
  },
};

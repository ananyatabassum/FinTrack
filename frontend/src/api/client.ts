import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/demo');
      if (!isAuthEndpoint) {
        localStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_user');
        window.dispatchEvent(new Event('fintrack:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; validationErrors?: Record<string, string> }
      | undefined;
    if (data?.validationErrors) {
      const firstError = Object.values(data.validationErrors)[0];
      if (firstError) return firstError;
    }
    if (data?.message) return data.message;
  }
  return fallback;
}

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/services';
import type { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fintrack_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('fintrack_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  const persistSession = (auth: AuthResponse) => {
    localStorage.setItem('fintrack_token', auth.token);
    localStorage.setItem('fintrack_user', JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('fintrack:unauthorized', handler);
    return () => window.removeEventListener('fintrack:unauthorized', handler);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persistSession(res);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await authApi.register({ fullName, email, password });
    persistSession(res);
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    persistSession(res);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

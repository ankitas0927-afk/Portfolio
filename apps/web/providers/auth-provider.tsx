'use client';

import axios, { type AxiosRequestConfig } from 'axios';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { webEnv } from '@/lib/env';

type AdminSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt?: string | null;
};

type AuthContextValue = {
  admin: AdminSummary | null;
  accessToken: string | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  apiRequest: <T>(config: AxiosRequestConfig, retry?: boolean) => Promise<T>;
};

const authClient = axios.create({
  baseURL: webEnv.browserApiBaseUrl,
  withCredentials: true,
});

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSummary | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await authClient.post('/auth/refresh');
      setAdmin(response.data.data.admin as AdminSummary);
      const nextAccessToken = response.data.data.accessToken as string;
      setAccessToken(nextAccessToken);
      return nextAccessToken;
    } catch {
      setAdmin(null);
      setAccessToken(null);
      return null;
    } finally {
      setIsHydrating(false);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authClient.post('/auth/login', { email, password });
    setAdmin(response.data.data.admin as AdminSummary);
    setAccessToken(response.data.data.accessToken as string);
  };

  const logout = async () => {
    try {
      await authClient.post('/auth/logout');
    } finally {
      setAdmin(null);
      setAccessToken(null);
    }
  };

  const apiRequest = async <T,>(config: AxiosRequestConfig, retry = true): Promise<T> => {
    const token = accessToken ?? (await refreshSession());
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await authClient.request({
        ...config,
        headers: {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${accessToken ?? token}`,
        },
      });
      return response.data.data as T;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401 && retry) {
        const refreshedToken = await refreshSession();
        if (refreshedToken) {
          const retryResponse = await authClient.request({
            ...config,
            headers: {
              ...(config.headers ?? {}),
              Authorization: `Bearer ${refreshedToken}`,
            },
          });
          return retryResponse.data.data as T;
        }
      }
      throw error;
    }
  };

  const value: AuthContextValue = {
    admin,
    accessToken,
    isHydrating,
    login,
    logout,
    refreshSession,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi, setAccessToken, type AdminUser } from "@/services/admin-api";

type AuthContextValue = {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .post<{ admin: AdminUser; accessToken: string }>("/auth/refresh")
      .then((response) => {
        if (cancelled) {
          return;
        }
        setAccessToken(response.data.accessToken);
        setAdmin(response.data.admin);
      })
      .catch(() => {
        if (!cancelled) {
          setAccessToken(null);
          setAdmin(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      loading,
      login: async (email, password) => {
        const response = await adminApi.post<{ admin: AdminUser; accessToken: string }>("/auth/login", {
          email,
          password
        });
        setAccessToken(response.data.accessToken);
        setAdmin(response.data.admin);
      },
      logout: async () => {
        await adminApi.post("/auth/logout").catch(() => undefined);
        setAccessToken(null);
        setAdmin(null);
      }
    }),
    [admin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

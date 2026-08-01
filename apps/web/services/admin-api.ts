"use client";

import axios from "axios";
import { env } from "@/lib/env";

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export const adminApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 15000
});

adminApi.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ListResponse = {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
};

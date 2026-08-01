"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@ankita-portfolio/validation";
import { useAuth } from "@/providers/auth-provider";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues): Promise<void> {
    setError(null);
    try {
      await login(values.email, values.password);
      router.push("/admin/dashboard");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <h1 className="text-2xl font-semibold text-ink dark:text-white">Administrator Login</h1>
      <label className="mt-6 block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
        <span className="mt-1 flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <Mail className="h-4 w-4 text-slate-400" aria-hidden />
          <input className="w-full bg-transparent outline-none" type="email" {...register("email")} />
        </span>
        {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span> : null}
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
        <span className="mt-1 flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <Lock className="h-4 w-4 text-slate-400" aria-hidden />
          <input className="w-full bg-transparent outline-none" type="password" {...register("password")} />
        </span>
        {errors.password ? <span className="mt-1 block text-sm text-red-600">{errors.password.message}</span> : null}
      </label>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-aqua px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        <LogIn className="h-5 w-5" aria-hidden />
        Login
      </button>
    </form>
  );
}

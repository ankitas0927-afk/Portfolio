'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { loginSchema } from '@ankita-portfolio/validation';
import type { z } from 'zod';

import { useAuth } from '@/providers/auth-provider';

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      router.replace('/admin');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
          toast.error(apiMessage);
          return;
        }

        if (error.code === 'ERR_NETWORK') {
          toast.error('Unable to reach the administrator service right now.');
          return;
        }
      }

      toast.error('Unable to sign in right now.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground/72" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
          {...form.register('email')}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground/72" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
          {...form.register('password')}
        />
      </div>
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white"
      >
        {form.formState.isSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <LockKeyhole className="h-4 w-4" />
        )}
        Sign in
      </button>
    </form>
  );
}

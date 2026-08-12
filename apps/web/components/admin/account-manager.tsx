'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { changePasswordSchema } from '@ankita-portfolio/validation';

import { useAuth } from '@/providers/auth-provider';

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function AccountManager() {
  const { apiRequest, logout } = useAuth();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const sessionsQuery = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: () => apiRequest<Array<Record<string, unknown>>>({ url: '/auth/sessions' }),
  });

  const meQuery = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => apiRequest<Record<string, unknown>>({ url: '/auth/me' }),
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      apiRequest({
        url: '/auth/change-password',
        method: 'PATCH',
        data: values,
      }),
    onSuccess: async () => {
      toast.success('Password changed. Please sign in again.');
      await logout();
    },
    onError: () => {
      toast.error('Unable to change password');
    },
  });

  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="premium-panel p-6">
        <h2 className="font-display text-2xl font-semibold">Administrator</h2>
        <p className="mt-4 text-sm text-foreground/72">{String(meQuery.data?.name ?? '')}</p>
        <p className="text-sm text-foreground/62">{String(meQuery.data?.email ?? '')}</p>

        <div className="mt-8">
          <h3 className="font-semibold">Active sessions</h3>
          <div className="mt-4 space-y-3">
            {(sessionsQuery.data ?? []).map((session) => (
              <div key={String(session.id)} className="metric-card text-sm">
                <p>{String(session.ipAddress)}</p>
                <p className="text-xs text-foreground/55">{String(session.userAgent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => changePasswordMutation.mutate(values))}
        className="premium-panel p-6"
      >
        <h2 className="font-display text-2xl font-semibold">Change password</h2>
        <div className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="Current password"
            className="glass-input"
            {...form.register('currentPassword')}
          />
          <input
            type="password"
            placeholder="New password"
            className="glass-input"
            {...form.register('newPassword')}
          />
        </div>
        <button
          type="submit"
          className="gradient-button mt-6"
        >
          {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </section>
  );
}

'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';

type ContactCollection = {
  items: Array<Record<string, unknown>>;
  pagination: { page: number; totalPages: number };
};

export function ContactManager() {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const query = useQuery({
    queryKey: ['admin-contact', page, deferredSearch],
    queryFn: () =>
      apiRequest<ContactCollection>({
        url: '/admin/contact-messages',
        params: { page, limit: 8, search: deferredSearch },
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest({
        url: `/admin/contact-messages/${id}/status`,
        method: 'PATCH',
        data: { status },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
    },
  });

  return (
    <section className="premium-panel space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Contact Messages</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Messages are stored in MongoDB with safe metadata and status tracking.
          </p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search messages"
          className="glass-input rounded-full"
        />
      </div>

      <div className="space-y-4">
        {(query.data?.items ?? []).map((message) => (
          <article key={String(message.id)} className="section-card hover-lift px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{String(message.fullName)}</p>
                <p className="text-sm text-foreground/68">{String(message.email)}</p>
              </div>
              <span className="info-chip text-xs uppercase tracking-[0.2em]">
                {String(message.status)}
              </span>
            </div>
            <p className="mt-4 text-sm text-foreground/72">{String(message.messagePreview)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['unread', 'read', 'replied', 'archived'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => statusMutation.mutate({ id: String(message.id), status })}
                  className="ghost-button px-3 py-2 text-xs"
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="section-card flex items-center justify-between px-4 py-3 text-sm">
        <button type="button" className="ghost-button px-3 py-2 text-xs" onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </button>
        <span>
          Page {query.data?.pagination.page ?? 1} of {query.data?.pagination.totalPages ?? 1}
        </span>
        <button
          type="button"
          className="ghost-button px-3 py-2 text-xs"
          onClick={() =>
            setPage((current) => Math.min(query.data?.pagination.totalPages ?? current, current + 1))
          }
        >
          Next
        </button>
      </div>
    </section>
  );
}

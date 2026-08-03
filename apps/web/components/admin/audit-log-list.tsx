'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';

type AuditLogCollection = {
  items: Array<Record<string, unknown>>;
  pagination: { page: number; totalPages: number };
};

export function AuditLogList() {
  const { apiRequest } = useAuth();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: () =>
      apiRequest<AuditLogCollection>({
        url: '/admin/audit-logs',
        params: { page, limit: 10 },
      }),
  });

  return (
    <section className="space-y-6 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
      <div>
        <h2 className="font-display text-2xl font-semibold">Audit Logs</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Authentication, content, and media actions are recorded here.
        </p>
      </div>
      <div className="space-y-4">
        {(query.data?.items ?? []).map((entry) => (
          <article key={String(entry.id)} className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{String(entry.action)}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                {String(entry.resourceType)}
              </p>
            </div>
            <p className="mt-2 text-sm text-foreground/68">{String(entry.requestId ?? '')}</p>
          </article>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </button>
        <span>
          Page {query.data?.pagination.page ?? 1} of {query.data?.pagination.totalPages ?? 1}
        </span>
        <button
          type="button"
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

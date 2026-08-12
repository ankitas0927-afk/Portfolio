'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { FieldConfig } from '@/lib/admin-config';
import { getApiErrorMessage } from '@/lib/api-error';
import { DynamicFields, toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import { useAuth } from '@/providers/auth-provider';
import { formatLabel } from '@/lib/utils';

type CollectionResponse = {
  items: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export function CollectionManager({
  title,
  endpoint,
  fields,
  description,
}: {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  description?: string;
}) {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const deferredSearch = useDeferredValue(search);

  const form = useForm<Record<string, unknown>>({
    defaultValues: toFormDefaults(fields),
  });

  const query = useQuery({
    queryKey: ['admin-collection', endpoint, page, deferredSearch],
    queryFn: () =>
      apiRequest<CollectionResponse>({
        url: `/admin/${endpoint}`,
        params: { page, limit: 6, search: deferredSearch },
      }),
  });

  const resetForCreate = () => {
    setEditingItem(null);
    form.reset(toFormDefaults(fields));
  };

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const payload = toPayload(fields, values);
      const method = editingItem?.id ? 'PATCH' : 'POST';
      const url = editingItem?.id ? `/admin/${endpoint}/${editingItem.id}` : `/admin/${endpoint}`;
      return apiRequest<Record<string, unknown>>({ url, method, data: payload });
    },
    onSuccess: () => {
      toast.success(`${title} saved`);
      resetForCreate();
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', endpoint] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, `Unable to save ${title.toLowerCase()}`));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/${endpoint}/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      toast.success(`${title} item deleted`);
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', endpoint] });
    },
    onError: () => {
      toast.error(`Unable to delete ${title.toLowerCase()} item`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, publicationStatus }: { id: string; publicationStatus: string }) =>
      apiRequest({
        url: `/admin/${endpoint}/${id}/status`,
        method: 'PATCH',
        data: { publicationStatus },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', endpoint] });
    },
  });

  const items = query.data?.items ?? [];

  const summaryFields = useMemo(
    () => ['title', 'name', 'label', 'jobTitle', 'qualification', 'organisation'],
    [],
  );

  return (
    <section className="premium-panel p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          {description ? <p className="mt-2 text-sm text-foreground/70">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}`}
            className="glass-input rounded-full"
          />
          <button
            type="button"
            onClick={resetForCreate}
            className="ghost-button"
          >
            Add new
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {items.map((item) => {
            const primaryValue =
              summaryFields.map((field) => item[field]).find(Boolean) ??
              item.id ??
              `${title} item`;
            return (
              <article key={String(item.id)} className="section-card hover-lift px-5 py-5">
                <p className="text-sm font-semibold text-foreground">{String(primaryValue)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-foreground/45">
                  {formatLabel(String(item.publicationStatus ?? 'draft'))}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      form.reset(toFormDefaults(fields, item));
                    }}
                    className="ghost-button px-3 py-2 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(String(item.id))}
                    className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 dark:bg-rose-500/10"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      statusMutation.mutate({
                        id: String(item.id),
                        publicationStatus:
                          item.publicationStatus === 'published' ? 'draft' : 'published',
                      })
                    }
                    className="ghost-button px-3 py-2 text-xs"
                  >
                    {item.publicationStatus === 'published' ? 'Move to draft' : 'Publish'}
                  </button>
                </div>
              </article>
            );
          })}

          <div className="section-card flex items-center justify-between px-4 py-3 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="ghost-button px-3 py-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {query.data?.pagination.page ?? 1} of {query.data?.pagination.totalPages ?? 1}
            </span>
            <button
              type="button"
              disabled={page >= (query.data?.pagination.totalPages ?? 1)}
              onClick={() =>
                setPage((current) =>
                  Math.min(query.data?.pagination.totalPages ?? current, current + 1),
                )
              }
              className="ghost-button px-3 py-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))} className="section-card space-y-6 px-5 py-5">
          <div>
            <h3 className="font-display text-xl font-semibold">
              {editingItem ? `Edit ${title}` : `Create ${title}`}
            </h3>
            <p className="mt-2 text-sm text-foreground/68">
              {editingItem ? 'Update the selected record.' : 'Add a new record to this section.'}
            </p>
          </div>
          <DynamicFields fields={fields} register={form.register} />
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="gradient-button"
          >
            {saveMutation.isPending ? 'Saving...' : editingItem ? 'Update item' : 'Create item'}
          </button>
        </form>
      </div>
    </section>
  );
}

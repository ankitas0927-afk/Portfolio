'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { FieldConfig } from '@/lib/admin-config';
import { DynamicFields, toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import { useAuth } from '@/providers/auth-provider';

export function SingletonEditor({
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
  const form = useForm<Record<string, unknown>>({
    defaultValues: toFormDefaults(fields),
  });

  const query = useQuery({
    queryKey: ['admin-singleton', endpoint],
    queryFn: () => apiRequest<Record<string, unknown> | null>({ url: `/admin/${endpoint}` }),
  });

  useEffect(() => {
    if (query.data) {
      form.reset(toFormDefaults(fields, query.data));
    }
  }, [fields, form, query.data]);

  const mutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiRequest<Record<string, unknown>>({
        url: `/admin/${endpoint}`,
        method: 'PATCH',
        data: toPayload(fields, values),
      }),
    onSuccess: () => {
      toast.success(`${title} saved`);
      void queryClient.invalidateQueries({ queryKey: ['admin-singleton', endpoint] });
    },
    onError: () => {
      toast.error(`Unable to save ${title.toLowerCase()}`);
    },
  });

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {description ? <p className="mt-2 text-sm text-foreground/70">{description}</p> : null}
      </div>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
        <DynamicFields fields={fields} register={form.register} />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white"
        >
          {mutation.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

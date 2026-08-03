'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { formatBytes } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { webEnv } from '@/lib/env';

const categoryOptions = [
  'profile-image',
  'hero-image',
  'about-image',
  'project-thumbnail',
  'project-gallery',
  'resume',
  'document',
  'certificate-image',
  'certificate-pdf',
  'logo',
  'favicon',
  'og-image',
  'organisation-logo',
  'institution-logo',
];

type MediaCollection = {
  items: Array<Record<string, unknown>>;
  pagination: { page: number; totalPages: number };
};

export function MediaLibrary() {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [formState, setFormState] = useState({
    category: 'profile-image',
    isPublic: true,
    altText: '',
    caption: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const query = useQuery({
    queryKey: ['admin-media', page, deferredSearch],
    queryFn: () =>
      apiRequest<MediaCollection>({
        url: '/admin/media',
        params: { page, limit: 8, search: deferredSearch },
      }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Please choose a file to upload');
      }
      const data = new FormData();
      data.append('file', file);
      data.append('category', formState.category);
      data.append('isPublic', String(formState.isPublic));
      data.append('altText', formState.altText);
      data.append('caption', formState.caption);
      return apiRequest({
        url: '/admin/media/upload',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Media uploaded');
      setFile(null);
      setFormState({ category: 'profile-image', isPublic: true, altText: '', caption: '' });
      void queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/media/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Media deleted');
      void queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
  });

  return (
    <section className="space-y-8 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
      <div>
        <h2 className="font-display text-2xl font-semibold">Media Library</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Uploads are processed in memory, stored in GridFS, and never written to a local uploads directory.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            uploadMutation.mutate();
          }}
          className="space-y-4 rounded-[1.75rem] border border-border/60 bg-background/70 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/72">File</label>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/72">Category</label>
            <select
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <input
            value={formState.altText}
            onChange={(event) => setFormState((current) => ({ ...current, altText: event.target.value }))}
            placeholder="Alt text"
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
          />
          <textarea
            value={formState.caption}
            onChange={(event) => setFormState((current) => ({ ...current, caption: event.target.value }))}
            rows={3}
            placeholder="Caption"
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
          />
          <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={formState.isPublic}
              onChange={(event) => setFormState((current) => ({ ...current, isPublic: event.target.checked }))}
            />
            Public file
          </label>
          <button
            type="submit"
            className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload media'}
          </button>
        </form>

        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search media"
            className="w-full rounded-full border border-border/70 bg-background px-4 py-3 text-sm"
          />
          {(query.data?.items ?? []).map((item) => (
            <article key={String(item.id)} className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5">
              <p className="font-semibold text-foreground">{String(item.originalName)}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-foreground/45">
                {String(item.category)} • {formatBytes(Number(item.size ?? 0))}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.isPublic ? (
                  <a
                    href={`${webEnv.browserApiBaseUrl}/public/media/${String(item.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border/70 px-3 py-2 text-xs font-semibold"
                  >
                    Preview
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(String(item.id))}
                  className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
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
                setPage((current) =>
                  Math.min(query.data?.pagination.totalPages ?? current, current + 1),
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

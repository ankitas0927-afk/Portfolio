'use client';

import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getAcceptedFileTypes } from '@/lib/media';
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
    <section className="premium-panel space-y-8 p-6">
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
          className="section-card space-y-4 px-5 py-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/72">File</label>
            <input
              type="file"
              accept={getAcceptedFileTypes(formState.category)}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="glass-input"
            />
            <p className="mt-2 text-xs leading-6 text-foreground/48">
              Accepted formats depend on category. Resumes and documents support PDF, DOC, and DOCX. Images support
              JPG, JPEG, PNG, WebP, GIF, and AVIF, while logo and favicon uploads also accept ICO.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/72">Category</label>
            <select
              value={formState.category}
              onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
              className="glass-input"
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
            className="glass-input"
          />
          <textarea
            value={formState.caption}
            onChange={(event) => setFormState((current) => ({ ...current, caption: event.target.value }))}
            rows={3}
            placeholder="Caption"
            className="glass-input"
          />
          <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
            <input
              type="checkbox"
              checked={formState.isPublic}
              onChange={(event) => setFormState((current) => ({ ...current, isPublic: event.target.checked }))}
            />
            Public file
          </label>
          <button
            type="submit"
            className="gradient-button"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload media'}
          </button>
        </form>

        <div className="space-y-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search media"
            className="glass-input rounded-full"
          />
          {(query.data?.items ?? []).map((item) => {
            const metaLabel = `${String(item.category)} | ${formatBytes(Number(item.size ?? 0))}`;

            return (
              <article key={String(item.id)} className="section-card hover-lift px-5 py-5">
                <p className="font-semibold text-foreground">{String(item.originalName)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-foreground/45">{metaLabel}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.isPublic ? (
                    <a
                      href={`${webEnv.browserApiBaseUrl}/public/media/${String(item.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ghost-button px-3 py-2 text-xs"
                    >
                      Preview
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(String(item.id))}
                    className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 dark:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
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
        </div>
      </div>
    </section>
  );
}

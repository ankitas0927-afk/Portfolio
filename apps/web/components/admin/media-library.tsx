'use client';

import type { MediaAssetSummary } from '@ankita-portfolio/shared-types';
import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PortfolioImage } from '@/components/common/portfolio-image';
import { getApiErrorMessage } from '@/lib/api-error';
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

type MediaItem = MediaAssetSummary & {
  altText?: string;
  caption?: string;
  publicUrl?: string;
  sourceAssetId?: string | null;
};

type MediaCollection = {
  items: MediaItem[];
  pagination: { page: number; totalPages: number };
};

type ImageAssignmentField =
  | 'profileImageId'
  | 'heroImageId'
  | 'aboutImageId'
  | 'logoId'
  | 'faviconId'
  | 'openGraphImageId'
  | 'defaultOpenGraphImageId';

type ImageAssignmentTarget = {
  key: ImageAssignmentField;
  endpoint: 'profile' | 'hero' | 'about' | 'siteSettings' | 'seo';
  label: string;
  shortLabel: string;
  hint: string;
};

type ImageAssignmentState = Record<ImageAssignmentField, string | null>;

const imageAssignmentTargets: ImageAssignmentTarget[] = [
  {
    key: 'profileImageId',
    endpoint: 'profile',
    label: 'Use as profile photo',
    shortLabel: 'Profile',
    hint: 'Main public profile image used across the portfolio.',
  },
  {
    key: 'heroImageId',
    endpoint: 'hero',
    label: 'Use as hero image',
    shortLabel: 'Hero',
    hint: 'Primary visual used in the homepage hero section.',
  },
  {
    key: 'aboutImageId',
    endpoint: 'about',
    label: 'Use as about image',
    shortLabel: 'About',
    hint: 'Image used in the About page story section.',
  },
  {
    key: 'logoId',
    endpoint: 'siteSettings',
    label: 'Use as logo',
    shortLabel: 'Logo',
    hint: 'Header brand mark shown across the public website.',
  },
  {
    key: 'faviconId',
    endpoint: 'siteSettings',
    label: 'Use as favicon',
    shortLabel: 'Favicon',
    hint: 'Browser tab icon generated from the database-driven site settings.',
  },
  {
    key: 'openGraphImageId',
    endpoint: 'siteSettings',
    label: 'Use as Open Graph image',
    shortLabel: 'Site OG',
    hint: 'Default social sharing image stored in website settings.',
  },
  {
    key: 'defaultOpenGraphImageId',
    endpoint: 'seo',
    label: 'Use as SEO Open Graph image',
    shortLabel: 'SEO OG',
    hint: 'Primary metadata image used by search and social platforms.',
  },
];

function formatCategoryLabel(value: string) {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function readAssignedId(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function isPublicImageAsset(item: MediaItem) {
  return item.isPublic && item.mimeType.startsWith('image/');
}

function isIconAsset(item: MediaItem) {
  return item.mimeType === 'image/x-icon' || item.extension.toLowerCase() === 'ico';
}

function getAssignableTargets(item: MediaItem) {
  if (!item.mimeType.startsWith('image/')) {
    return [];
  }

  if (isIconAsset(item)) {
    return imageAssignmentTargets.filter((target) => ['logoId', 'faviconId'].includes(target.key));
  }

  return imageAssignmentTargets;
}

function getReferenceAssetId(item: MediaItem) {
  return item.sourceAssetId ?? item.id;
}

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

  const assignmentsQuery = useQuery({
    queryKey: ['admin-media-assignments'],
    queryFn: async (): Promise<ImageAssignmentState> => {
      const [profile, hero, about, siteSettings, seo] = await Promise.all([
        apiRequest<Record<string, unknown> | null>({ url: '/admin/profile' }),
        apiRequest<Record<string, unknown> | null>({ url: '/admin/hero' }),
        apiRequest<Record<string, unknown> | null>({ url: '/admin/about' }),
        apiRequest<Record<string, unknown> | null>({ url: '/admin/siteSettings' }),
        apiRequest<Record<string, unknown> | null>({ url: '/admin/seo' }),
      ]);

      return {
        profileImageId: readAssignedId(profile?.profileImageId),
        heroImageId: readAssignedId(hero?.heroImageId),
        aboutImageId: readAssignedId(about?.aboutImageId),
        logoId: readAssignedId(siteSettings?.logoId),
        faviconId: readAssignedId(siteSettings?.faviconId),
        openGraphImageId: readAssignedId(siteSettings?.openGraphImageId),
        defaultOpenGraphImageId: readAssignedId(seo?.defaultOpenGraphImageId),
      };
    },
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete media right now.'));
    },
  });

  const copyMediaId = async (mediaId: string) => {
    try {
      await navigator.clipboard.writeText(mediaId);
      toast.success('Media ID copied');
    } catch {
      toast.error('Unable to copy media ID');
    }
  };

  const assignImageMutation = useMutation({
    mutationFn: async ({
      assetId,
      target,
      assetIsPublic,
    }: {
      assetId: string;
      target: ImageAssignmentTarget;
      assetIsPublic: boolean;
    }) => {
      if (!assetIsPublic) {
        await apiRequest({
          url: `/admin/media/${assetId}`,
          method: 'PATCH',
          data: { isPublic: true },
        });
      }

      return apiRequest({
        url: `/admin/${target.endpoint}`,
        method: 'PATCH',
        data: { [target.key]: assetId },
      });
    },
    onSuccess: async (_response, variables) => {
      toast.success(`${variables.target.shortLabel} image updated`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-media'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-media-assignments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-singleton', variables.target.endpoint] }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to apply this image right now.'));
    },
  });

  const useEverywhereMutation = useMutation({
    mutationFn: async ({ assetId, assetIsPublic }: { assetId: string; assetIsPublic: boolean }) => {
      if (!assetIsPublic) {
        await apiRequest({
          url: `/admin/media/${assetId}`,
          method: 'PATCH',
          data: { isPublic: true },
        });
      }

      await Promise.all([
        apiRequest({ url: '/admin/profile', method: 'PATCH', data: { profileImageId: assetId } }),
        apiRequest({ url: '/admin/hero', method: 'PATCH', data: { heroImageId: assetId } }),
        apiRequest({ url: '/admin/about', method: 'PATCH', data: { aboutImageId: assetId } }),
        apiRequest({
          url: '/admin/siteSettings',
          method: 'PATCH',
          data: {
            logoId: assetId,
            faviconId: assetId,
            openGraphImageId: assetId,
          },
        }),
        apiRequest({
          url: '/admin/seo',
          method: 'PATCH',
          data: { defaultOpenGraphImageId: assetId },
        }),
      ]);
    },
    onSuccess: async () => {
      toast.success('Image applied across profile, branding, and public content');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-media'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-media-assignments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-singleton'] }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to apply this image across the site right now.'));
    },
  });

  return (
    <section className="premium-panel space-y-8 p-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Media Library</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Uploads are processed in memory, stored in GridFS, and never written to a local uploads directory.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-foreground/48">
          Upload once, assign instantly, and keep logo, favicon, profile, hero, about, and SEO images fully synced
          from the database.
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
          <div className="section-card space-y-4 px-5 py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold">Stored Assets</h3>
                <p className="mt-1 text-sm text-foreground/62">
                  Public-facing image assignments update the database and are fetched by both admin and public pages.
                </p>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search media"
                className="glass-input rounded-full lg:max-w-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-foreground/56">
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                Public image slots are auto-published when assigned
              </span>
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                Current usage is shown on each media card
              </span>
            </div>
          </div>

          {(query.data?.items ?? []).map((item) => {
            const metaLabel = `${formatCategoryLabel(item.category)} | ${formatBytes(item.size)}`;
            const referenceAssetId = getReferenceAssetId(item);
            const assignableTargets = getAssignableTargets(item);
            const activeAssignments = assignableTargets.filter(
              (target) =>
                assignmentsQuery.data?.[target.key] === item.id ||
                assignmentsQuery.data?.[target.key] === referenceAssetId,
            );
            const showImagePreview = isPublicImageAsset(item);
            const showUseEverywhere = !isIconAsset(item) && assignableTargets.length > 0;

            return (
              <article key={item.id} className="section-card hover-lift space-y-5 px-5 py-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,160px)_1fr]">
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/75">
                      {showImagePreview ? (
                        <PortfolioImage
                          src={item.publicUrl}
                          alt={item.altText?.trim() || item.originalName}
                          width={item.width ?? 360}
                          height={item.height ?? 360}
                          className="aspect-square w-full object-cover"
                          sizes="160px"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_52%),linear-gradient(135deg,rgba(255,255,255,0.6),rgba(191,219,254,0.25))] px-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-foreground/58 dark:bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.16),_transparent_52%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.86))]">
                          {item.extension.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-foreground/48">
                      <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                        {item.isPublic ? 'Public' : 'Private'}
                      </span>
                      <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                        {item.variant ?? 'original'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{item.originalName}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-foreground/45">{metaLabel}</p>
                        {item.caption ? (
                          <p className="mt-3 text-sm leading-6 text-foreground/68">{item.caption}</p>
                        ) : null}
                        {item.altText ? (
                          <p className="mt-2 text-xs text-foreground/50">Alt text: {item.altText}</p>
                        ) : null}
                      </div>
                      {activeAssignments.length > 0 ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {activeAssignments.map((target) => (
                            <span
                              key={target.key}
                              className="rounded-full border border-sky-200/80 bg-sky-50/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"
                            >
                              In use: {target.shortLabel}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-4 break-all text-xs text-foreground/58">Media ID: {item.id}</p>
                    {item.sourceAssetId ? (
                      <p className="mt-1 break-all text-xs text-foreground/44">
                        Assignment source ID: {item.sourceAssetId}
                      </p>
                    ) : null}

                    {assignableTargets.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {assignableTargets.map((target) => {
                            const isActive =
                              assignmentsQuery.data?.[target.key] === item.id ||
                              assignmentsQuery.data?.[target.key] === referenceAssetId;

                            return (
                              <button
                                key={target.key}
                                type="button"
                                onClick={() =>
                                  assignImageMutation.mutate({
                                    assetId: referenceAssetId,
                                    target,
                                    assetIsPublic: item.isPublic,
                                  })
                                }
                                disabled={assignImageMutation.isPending || useEverywhereMutation.isPending}
                                className={
                                  isActive
                                    ? 'rounded-full border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:-translate-y-0.5 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200'
                                    : 'ghost-button px-3 py-2 text-xs'
                                }
                                title={target.hint}
                              >
                                {isActive ? `${target.shortLabel} active` : target.label}
                              </button>
                            );
                          })}
                          {showUseEverywhere ? (
                            <button
                              type="button"
                              onClick={() =>
                                useEverywhereMutation.mutate({
                                  assetId: referenceAssetId,
                                  assetIsPublic: item.isPublic,
                                })
                              }
                              disabled={assignImageMutation.isPending || useEverywhereMutation.isPending}
                              className="gradient-button px-4 py-2.5 text-xs shadow-[0_18px_36px_-24px_rgba(37,99,235,0.9)]"
                            >
                              {useEverywhereMutation.isPending ? 'Applying...' : 'Use everywhere'}
                            </button>
                          ) : null}
                        </div>
                        <p className="text-xs leading-6 text-foreground/48">
                          Assigning to public slots automatically marks the file as public so it can be fetched by the
                          live portfolio.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <button
                    type="button"
                    onClick={() => copyMediaId(item.id)}
                    className="ghost-button px-3 py-2 text-xs"
                  >
                    Copy ID
                  </button>
                  {item.isPublic && item.publicUrl ? (
                    <a
                      href={item.publicUrl || `${webEnv.browserApiBaseUrl}/public/media/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ghost-button px-3 py-2 text-xs"
                    >
                      Preview
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
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

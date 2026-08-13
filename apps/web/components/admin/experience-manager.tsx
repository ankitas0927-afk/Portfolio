'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExperienceRecord, PaginatedResponse } from '@ankita-portfolio/shared-types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { collectionFields } from '@/lib/admin-config';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLabel } from '@/lib/utils';
import { DynamicFields, toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import { useAuth } from '@/providers/auth-provider';

const experienceFields = collectionFields.experience;
type AdminExperienceRecord = ExperienceRecord & { featured?: boolean };

export function ExperienceManager() {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminExperienceRecord | null>(null);
  const deferredSearch = useDeferredValue(search);

  const form = useForm<Record<string, unknown>>({
    defaultValues: toFormDefaults(experienceFields),
  });

  const experienceQuery = useQuery({
    queryKey: ['admin-collection', 'experience', deferredSearch],
    queryFn: () =>
      apiRequest<PaginatedResponse<AdminExperienceRecord>>({
        url: '/admin/experience',
        params: { page: 1, limit: 100, search: deferredSearch },
      }),
  });

  const items = experienceQuery.data?.items ?? [];
  const publishedCount = items.filter((item) => item.publicationStatus === 'published').length;

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset(toFormDefaults(experienceFields));
  };

  const openCreateModal = () => {
    setEditingItem(null);
    form.reset(toFormDefaults(experienceFields));
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminExperienceRecord) => {
    setEditingItem(item);
    form.reset(toFormDefaults(experienceFields, item as unknown as Record<string, unknown>));
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        setEditingItem(null);
        form.reset(toFormDefaults(experienceFields));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, form]);

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const payload = toPayload(experienceFields, values);
      const method = editingItem?.id ? 'PATCH' : 'POST';
      const url = editingItem?.id ? `/admin/experience/${editingItem.id}` : '/admin/experience';
      return apiRequest<ExperienceRecord>({ url, method, data: payload });
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Experience updated' : 'Experience created');
      closeModal();
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', 'experience'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save experience'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/experience/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Experience deleted');
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', 'experience'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete experience'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, publicationStatus }: { id: string; publicationStatus: string }) =>
      apiRequest({
        url: `/admin/experience/${id}/status`,
        method: 'PATCH',
        data: { publicationStatus },
      }),
    onSuccess: () => {
      toast.success('Experience status updated');
      void queryClient.invalidateQueries({ queryKey: ['admin-collection', 'experience'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update experience status'));
    },
  });

  return (
    <>
      <section className="premium-panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="premium-pill inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
              Database-backed experience manager
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold">Experience</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-foreground/70">
                Every experience record here is fetched from the database and any create, edit,
                publish, or delete action updates the stored data used by both the admin dashboard
                and the public portfolio.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search experience"
              className="glass-input rounded-full"
            />
            <button type="button" onClick={openCreateModal} className="gradient-button">
              Add More Experience
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="metric-card">
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
              Total records
            </p>
            <p className="mt-3 font-display text-3xl font-semibold">
              {experienceQuery.data?.pagination.totalItems ?? 0}
            </p>
          </div>
          <div className="metric-card">
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">Published</p>
            <p className="mt-3 font-display text-3xl font-semibold">{publishedCount}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
              Search results
            </p>
            <p className="mt-3 font-display text-3xl font-semibold">{items.length}</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {experienceQuery.isPending ? (
            <div className="section-card px-6 py-6 text-sm text-foreground/68">
              Loading experience records from the database...
            </div>
          ) : null}

          {experienceQuery.isError ? (
            <div className="section-card px-6 py-6 text-sm text-rose-600 dark:text-rose-300">
              Unable to load the experience list right now.
            </div>
          ) : null}

          {!experienceQuery.isPending && !experienceQuery.isError && items.length === 0 ? (
            <div className="section-card px-6 py-8 text-center">
              <h3 className="font-display text-2xl font-semibold">No experience records yet</h3>
              <p className="mt-3 text-sm text-foreground/70">
                Create the first experience entry and it will be stored in the database and shown
                across the site.
              </p>
              <button type="button" onClick={openCreateModal} className="gradient-button mt-6">
                Add More Experience
              </button>
            </div>
          ) : null}

          {items.map((item) => (
            <article key={item.id} className="section-card hover-lift px-6 py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="premium-pill inline-flex text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                        {formatLabel(item.publicationStatus)}
                      </span>
                      {item.featured ? (
                        <span className="premium-pill inline-flex text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/72">
                          Featured
                        </span>
                      ) : null}
                      {item.isCurrentPosition ? (
                        <span className="premium-pill inline-flex text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/72">
                          Current role
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                      {item.jobTitle}
                    </h3>
                    <p className="mt-1 text-base text-foreground/72">{item.organisation}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.employmentType ? (
                      <span className="info-chip">{item.employmentType}</span>
                    ) : null}
                    {item.location ? <span className="info-chip">{item.location}</span> : null}
                    {item.approximateDuration ? (
                      <span className="info-chip">{item.approximateDuration}</span>
                    ) : null}
                    {item.startDate ? (
                      <span className="info-chip">
                        {item.startDate}
                        {item.endDate ? ` - ${item.endDate}` : item.isCurrentPosition ? ' - Present' : ''}
                      </span>
                    ) : null}
                  </div>

                  {item.professionalSummary ? (
                    <p className="max-w-3xl text-sm leading-7 text-foreground/72">
                      {item.professionalSummary}
                    </p>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="metric-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
                        Responsibilities
                      </p>
                      <p className="mt-3 text-2xl font-semibold">{item.responsibilities.length}</p>
                    </div>
                    <div className="metric-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
                        Achievements
                      </p>
                      <p className="mt-3 text-2xl font-semibold">{item.keyAchievements.length}</p>
                    </div>
                    <div className="metric-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
                        Research areas
                      </p>
                      <p className="mt-3 text-2xl font-semibold">{item.researchAreas.length}</p>
                    </div>
                    <div className="metric-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
                        Tools
                      </p>
                      <p className="mt-3 text-2xl font-semibold">{item.toolsUsed.length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:w-[15.5rem] lg:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="ghost-button px-4 py-2 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      statusMutation.mutate({
                        id: item.id,
                        publicationStatus:
                          item.publicationStatus === 'published' ? 'draft' : 'published',
                      })
                    }
                    disabled={statusMutation.isPending}
                    className="ghost-button px-4 py-2 text-xs disabled:opacity-60"
                  >
                    {item.publicationStatus === 'published' ? 'Move to draft' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-full border border-rose-200/80 bg-rose-50/80 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-rose-500/10 dark:text-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8"
          onClick={closeModal}
        >
          <div
            className="premium-panel w-full max-w-5xl p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="premium-pill inline-flex text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                  Experience form
                </span>
                <h3 className="mt-4 font-display text-3xl font-semibold">
                  {editingItem ? 'Edit experience' : 'Add more experience'}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/68">
                  Save this form to write the experience record to the database and immediately
                  refresh the admin list. The same stored data is used on the public portfolio.
                </p>
              </div>
              <button type="button" onClick={closeModal} className="ghost-button">
                Close
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="mt-6 space-y-6"
            >
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <DynamicFields fields={experienceFields} register={form.register} />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="ghost-button">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="gradient-button"
                >
                  {saveMutation.isPending
                    ? 'Saving...'
                    : editingItem
                      ? 'Update experience'
                      : 'Save experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

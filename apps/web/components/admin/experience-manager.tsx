'use client';

import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExperienceRecord, PaginatedResponse } from '@ankita-portfolio/shared-types';
import {
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  CirclePlus,
  PencilLine,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { collectionFields } from '@/lib/admin-config';
import { getApiErrorMessage } from '@/lib/api-error';
import { formatLabel } from '@/lib/utils';
import { toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import { useAuth } from '@/providers/auth-provider';

const experienceFields = collectionFields.experience;
const publicationStatusOptions =
  experienceFields.find((field) => field.name === 'publicationStatus')?.options ?? [];
const datePrecisionOptions =
  experienceFields.find((field) => field.name === 'datePrecision')?.options ?? [];

type AdminExperienceRecord = ExperienceRecord & { featured?: boolean };

function getStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  return String(value);
}

function splitCommaValues(value: unknown) {
  return getStringValue(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseExperienceDate(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  if (/^\d{4}$/.test(value)) {
    return new Date(Date.UTC(Number(value), 0, 1));
  }

  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1));
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed);
}

function formatDurationPart(value: number, unit: 'year' | 'month') {
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}

function calculateApproximateDuration(startDate: string, endDate: string, isCurrentPosition: boolean) {
  const start = parseExperienceDate(startDate);
  const end = parseExperienceDate(endDate);

  if (!start) {
    return '';
  }

  const comparisonDate = isCurrentPosition ? new Date() : end;
  if (!comparisonDate) {
    return '';
  }

  const totalMonths =
    (comparisonDate.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (comparisonDate.getUTCMonth() - start.getUTCMonth()) +
    1;

  if (totalMonths <= 0) {
    return '';
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [
    years > 0 ? formatDurationPart(years, 'year') : null,
    months > 0 ? formatDurationPart(months, 'month') : null,
  ].filter(Boolean);

  return parts.join(' ');
}

function formatDisplayDate(value: string) {
  const parsed = parseExperienceDate(value);
  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function getStatusChipClassName(status: string) {
  if (status === 'published') {
    return 'border-emerald-300/80 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200';
  }

  if (status === 'archived') {
    return 'border-slate-300/80 bg-slate-500/12 text-slate-700 dark:text-slate-200';
  }

  return 'border-amber-300/80 bg-amber-500/12 text-amber-700 dark:text-amber-200';
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-card space-y-5 px-5 py-5 sm:px-6">
      <div>
        <h4 className="font-display text-xl font-semibold text-foreground">{title}</h4>
        <p className="mt-2 text-sm leading-7 text-foreground/66">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-foreground/82">{label}</span>
      {children}
      {hint ? (
        <span className="block text-xs uppercase tracking-[0.18em] text-foreground/42">{hint}</span>
      ) : null}
    </label>
  );
}

function MetricPreview({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center gap-3 text-foreground/55">
        <span className="rounded-2xl bg-white/55 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-white/5">
          {icon}
        </span>
        <p className="text-xs uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-4 text-base font-semibold leading-7 text-foreground">{value}</p>
    </div>
  );
}

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

  const watchedValues = useWatch({
    control: form.control,
    name: [
      'jobTitle',
      'organisation',
      'employmentType',
      'location',
      'startDate',
      'endDate',
      'isCurrentPosition',
      'approximateDuration',
      'publicationStatus',
      'featured',
      'responsibilities',
      'keyAchievements',
      'researchAreas',
      'toolsUsed',
    ],
  });

  const [
    jobTitleValue,
    organisationValue,
    employmentTypeValue,
    locationValue,
    startDateValue,
    endDateValue,
    isCurrentPositionValue,
    approximateDurationValue,
    publicationStatusValue,
    featuredValue,
    responsibilitiesValue,
    keyAchievementsValue,
    researchAreasValue,
    toolsUsedValue,
  ] = watchedValues;

  const jobTitle = getStringValue(jobTitleValue);
  const organisation = getStringValue(organisationValue);
  const employmentType = getStringValue(employmentTypeValue);
  const location = getStringValue(locationValue);
  const startDate = getStringValue(startDateValue);
  const endDate = getStringValue(endDateValue);
  const isCurrentPosition = Boolean(isCurrentPositionValue);
  const publicationStatus = getStringValue(publicationStatusValue) || 'draft';
  const isFeatured = Boolean(featuredValue);
  const calculatedDuration = calculateApproximateDuration(startDate, endDate, isCurrentPosition);
  const savedDuration = getStringValue(approximateDurationValue);
  const previewDuration = calculatedDuration || savedDuration || 'Select dates to calculate duration';
  const responsibilityCount = splitCommaValues(responsibilitiesValue).length;
  const achievementCount = splitCommaValues(keyAchievementsValue).length;
  const researchAreaCount = splitCommaValues(researchAreasValue).length;
  const toolsCount = splitCommaValues(toolsUsedValue).length;

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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.reset(toFormDefaults(experienceFields));
  }, [form]);

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
        closeModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    const nextDuration = calculatedDuration.trim();
    if (form.getValues('approximateDuration') === nextDuration) {
      return;
    }

    form.setValue('approximateDuration', nextDuration, {
      shouldDirty: nextDuration.length > 0,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [calculatedDuration, form]);

  useEffect(() => {
    if (!isCurrentPosition || !endDate) {
      return;
    }

    form.setValue('endDate', '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  }, [endDate, form, isCurrentPosition]);

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
    mutationFn: ({ id, publicationStatus: nextPublicationStatus }: { id: string; publicationStatus: string }) =>
      apiRequest({
        url: `/admin/experience/${id}/status`,
        method: 'PATCH',
        data: { publicationStatus: nextPublicationStatus },
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
            <button
              type="button"
              onClick={openCreateModal}
              className="gradient-button min-w-[15rem] px-6 py-3 text-sm shadow-[0_24px_48px_-24px_rgba(37,99,235,0.95)]"
            >
              <CirclePlus className="h-4 w-4" />
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
              <button
                type="button"
                onClick={openCreateModal}
                className="gradient-button mt-6 min-w-[15rem] px-6 py-3 text-sm"
              >
                <CirclePlus className="h-4 w-4" />
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
                      <span
                        className={`premium-pill inline-flex border text-[11px] font-semibold uppercase tracking-[0.24em] ${getStatusChipClassName(
                          item.publicationStatus,
                        )}`}
                      >
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
                        {formatDisplayDate(item.startDate)}
                        {item.endDate
                          ? ` - ${formatDisplayDate(item.endDate)}`
                          : item.isCurrentPosition
                            ? ' - Present'
                            : ''}
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

                <div className="flex flex-wrap gap-2 lg:w-[18rem] lg:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-300/80 bg-sky-500/12 px-4 py-2.5 text-xs font-semibold text-sky-700 shadow-[0_18px_36px_-26px_rgba(14,165,233,0.95)] transition hover:-translate-y-0.5 hover:bg-sky-500/18 dark:text-sky-200"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
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
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-500/12 px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-[0_18px_36px_-26px_rgba(16,185,129,0.95)] transition hover:-translate-y-0.5 hover:bg-emerald-500/18 disabled:opacity-60 dark:text-emerald-200"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {item.publicationStatus === 'published' ? 'Move to draft' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-300/80 bg-rose-500/12 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-[0_18px_36px_-26px_rgba(244,63,94,0.95)] transition hover:-translate-y-0.5 hover:bg-rose-500/18 disabled:opacity-60 dark:text-rose-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-5 backdrop-blur-md sm:px-6 lg:px-8"
          onClick={closeModal}
        >
          <div
            className="premium-panel w-full max-w-6xl overflow-hidden p-0 shadow-[0_40px_120px_rgba(3,7,18,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(244,248,252,0.58))] px-6 py-6 dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_34%),linear-gradient(135deg,rgba(9,17,29,0.92),rgba(12,24,41,0.82))] sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <span className="premium-pill inline-flex text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                    Experience form
                  </span>
                  <div>
                    <h3 className="font-display text-3xl font-semibold">
                      {editingItem ? 'Edit experience' : 'Add more experience'}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/68">
                      Build a complete experience record with timeline, role summary, impact, and
                      publishing controls. Duration is calculated automatically from the selected dates.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="ghost-button min-w-[8rem] px-5 py-3 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={form.handleSubmit((values) => saveMutation.mutate(values))}
                    disabled={saveMutation.isPending}
                    className="gradient-button min-w-[11rem] px-6 py-3 text-sm shadow-[0_24px_52px_-24px_rgba(37,99,235,0.92)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {saveMutation.isPending
                      ? 'Saving...'
                      : editingItem
                        ? 'Update Experience'
                        : 'Save Experience'}
                  </button>
                </div>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="space-y-6"
            >
              <div className="max-h-[72vh] overflow-y-auto px-6 py-6 sm:px-8">
                <div className="grid gap-4 lg:grid-cols-4">
                  <MetricPreview
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    label="Role preview"
                    value={
                      [jobTitle, organisation].filter(Boolean).join(' at ') || 'New experience record'
                    }
                  />
                  <MetricPreview
                    icon={<CalendarRange className="h-4 w-4" />}
                    label="Auto duration"
                    value={previewDuration}
                  />
                  <MetricPreview
                    icon={<Building2 className="h-4 w-4" />}
                    label="Status"
                    value={`${formatLabel(publicationStatus)}${isFeatured ? ' | Featured' : ''}`}
                  />
                  <MetricPreview
                    icon={<Wrench className="h-4 w-4" />}
                    label="Role context"
                    value={
                      [
                        employmentType || 'Employment type pending',
                        location || 'Location pending',
                        `${responsibilityCount} responsibilities`,
                        `${achievementCount} achievements`,
                        `${researchAreaCount} research areas`,
                        `${toolsCount} tools`,
                      ].join(' | ')
                    }
                  />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <SectionBlock
                      title="Role overview"
                      description="Capture the headline information that appears first in the admin list and the public portfolio."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell label="Job title">
                          <input
                            className="glass-input"
                            placeholder="Research Analyst"
                            {...form.register('jobTitle')}
                          />
                        </FieldShell>
                        <FieldShell label="Organisation">
                          <input
                            className="glass-input"
                            placeholder="Royal Research"
                            {...form.register('organisation')}
                          />
                        </FieldShell>
                        <FieldShell label="Employment type">
                          <input
                            className="glass-input"
                            placeholder="Full-time, Contract, Internship"
                            {...form.register('employmentType')}
                          />
                        </FieldShell>
                        <FieldShell label="Location">
                          <input
                            className="glass-input"
                            placeholder="Kolkata, West Bengal"
                            {...form.register('location')}
                          />
                        </FieldShell>
                      </div>

                      <FieldShell label="Professional summary">
                        <textarea
                          rows={5}
                          className="glass-input"
                          placeholder="Summarize the role, contribution, and professional impact."
                          {...form.register('professionalSummary')}
                        />
                      </FieldShell>
                    </SectionBlock>

                    <SectionBlock
                      title="Impact and scope"
                      description="Use clean comma-separated lists so the portfolio can display this experience in a structured way."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell
                          label={`Responsibilities (${responsibilityCount})`}
                          hint="Separate values with commas"
                        >
                          <textarea
                            rows={4}
                            className="glass-input"
                            placeholder="Led analysis, prepared reports, reviewed datasets"
                            {...form.register('responsibilities')}
                          />
                        </FieldShell>
                        <FieldShell
                          label={`Achievements (${achievementCount})`}
                          hint="Separate values with commas"
                        >
                          <textarea
                            rows={4}
                            className="glass-input"
                            placeholder="Reduced turnaround time, improved accuracy, supported audits"
                            {...form.register('keyAchievements')}
                          />
                        </FieldShell>
                        <FieldShell
                          label={`Research areas (${researchAreaCount})`}
                          hint="Separate values with commas"
                        >
                          <textarea
                            rows={4}
                            className="glass-input"
                            placeholder="Pharmaceutical analysis, quality control, reporting"
                            {...form.register('researchAreas')}
                          />
                        </FieldShell>
                        <FieldShell
                          label={`Tools used (${toolsCount})`}
                          hint="Separate values with commas"
                        >
                          <textarea
                            rows={4}
                            className="glass-input"
                            placeholder="SPSS, NVivo, MySQL, Excel"
                            {...form.register('toolsUsed')}
                          />
                        </FieldShell>
                      </div>
                    </SectionBlock>
                  </div>

                  <div className="space-y-6">
                    <SectionBlock
                      title="Timeline and publishing"
                      description="Select dates for automatic duration calculation and define how the record should appear on the site."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell
                          label="Start month"
                          hint="Use month values for reliable auto-calculation"
                        >
                          <input
                            type="month"
                            className="glass-input"
                            {...form.register('startDate')}
                          />
                        </FieldShell>
                        <FieldShell
                          label="End month"
                          hint={isCurrentPosition ? 'Disabled while current position is enabled' : 'Leave empty for current roles'}
                        >
                          <input
                            type="month"
                            className="glass-input"
                            disabled={isCurrentPosition}
                            {...form.register('endDate')}
                          />
                        </FieldShell>
                        <FieldShell label="Date precision">
                          <select className="glass-input" {...form.register('datePrecision')}>
                            <option value="">Select an option</option>
                            {datePrecisionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </FieldShell>
                        <FieldShell label="Display order">
                          <input
                            type="number"
                            min="0"
                            className="glass-input"
                            placeholder="0"
                            {...form.register('displayOrder')}
                          />
                        </FieldShell>
                        <FieldShell label="Publication status">
                          <select className="glass-input" {...form.register('publicationStatus')}>
                            <option value="">Select an option</option>
                            {publicationStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </FieldShell>
                        <FieldShell
                          label="Organisation logo media ID"
                          hint="Paste a media ID from the Media Library."
                        >
                          <input
                            className="glass-input"
                            placeholder="Media ID"
                            {...form.register('organisationLogoId')}
                          />
                        </FieldShell>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="section-card flex cursor-pointer items-start gap-3 px-4 py-4">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-border/70"
                            {...form.register('isCurrentPosition')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Current position</p>
                            <p className="mt-1 text-sm text-foreground/66">
                              Keep the role active and calculate duration up to the current month.
                            </p>
                          </div>
                        </label>

                        <label className="section-card flex cursor-pointer items-start gap-3 px-4 py-4">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-border/70"
                            {...form.register('featured')}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Featured record</p>
                            <p className="mt-1 text-sm text-foreground/66">
                              Highlight this experience more prominently in admin and portfolio views.
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="section-card space-y-3 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Auto-generated duration</p>
                            <p className="mt-1 text-sm text-foreground/66">
                              This value is stored in the database when you save the form.
                            </p>
                          </div>
                          <span
                            className={`premium-pill inline-flex border text-[11px] font-semibold uppercase tracking-[0.22em] ${getStatusChipClassName(
                              publicationStatus,
                            )}`}
                          >
                            {formatLabel(publicationStatus)}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-[1.4rem] border border-border/70 bg-background/75 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-foreground/46">
                              Timeline preview
                            </p>
                            <p className="mt-3 text-sm font-semibold text-foreground">
                              {startDate
                                ? `${formatDisplayDate(startDate)}${endDate ? ` - ${formatDisplayDate(endDate)}` : isCurrentPosition ? ' - Present' : ''}`
                                : 'Add start and end dates to preview the timeline'}
                            </p>
                          </div>
                          <div className="rounded-[1.4rem] border border-border/70 bg-background/75 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-foreground/46">
                              Duration preview
                            </p>
                            <p className="mt-3 text-sm font-semibold text-foreground">{previewDuration}</p>
                          </div>
                        </div>
                      </div>
                    </SectionBlock>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 px-6 py-5 sm:px-8">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground/64">
                    The saved record is written to MongoDB and refetched across admin and public pages.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="ghost-button min-w-[9rem] px-5 py-3 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="gradient-button min-w-[12rem] px-6 py-3 text-sm shadow-[0_24px_52px_-24px_rgba(37,99,235,0.92)]"
                    >
                      <Sparkles className="h-4 w-4" />
                      {saveMutation.isPending
                        ? 'Saving...'
                        : editingItem
                          ? 'Update Experience'
                          : 'Save Experience'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

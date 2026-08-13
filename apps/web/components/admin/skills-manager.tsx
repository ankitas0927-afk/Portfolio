'use client';

import type {
  PaginatedResponse,
  PersonalSkillRecord,
  SkillCategoryRecord,
  SkillRecord,
} from '@ankita-portfolio/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CirclePlus,
  Layers3,
  PencilLine,
  Search,
  Sparkles,
  Star,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { type ReactNode, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { CollectionManager } from '@/components/admin/collection-manager';
import { DynamicFields, toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import { collectionFields, type FieldConfig } from '@/lib/admin-config';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn, formatLabel } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

type AdminSkillRecord = SkillRecord & {
  categoryId: string;
  logoId?: string | null;
};

type SkillMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'accent';
};

const skillBaseFields = collectionFields.skills;

function getStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  return String(value);
}

function getStatusChipClassName(status: string) {
  if (status === 'published') {
    return 'border-emerald-300/80 bg-emerald-500/12 text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-200';
  }

  if (status === 'archived') {
    return 'border-slate-300/80 bg-slate-500/12 text-slate-700 dark:border-slate-400/20 dark:text-slate-200';
  }

  return 'border-amber-300/80 bg-amber-500/12 text-amber-700 dark:border-amber-400/20 dark:text-amber-200';
}

function getProficiencyChipClassName(level: string) {
  if (level === 'expert' || level === 'advanced') {
    return 'border-sky-300/80 bg-sky-500/12 text-sky-700 dark:border-sky-400/20 dark:text-sky-200';
  }

  if (level === 'intermediate') {
    return 'border-violet-300/80 bg-violet-500/12 text-violet-700 dark:border-violet-400/20 dark:text-violet-200';
  }

  if (level === 'beginner' || level === 'familiar') {
    return 'border-amber-300/80 bg-amber-500/12 text-amber-700 dark:border-amber-400/20 dark:text-amber-200';
  }

  return 'border-slate-300/80 bg-slate-500/12 text-slate-700 dark:border-slate-400/20 dark:text-slate-200';
}

function formatExperienceYears(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Not set';
  }

  if (value === 1) {
    return '1 year';
  }

  return `${value} years`;
}

function buildCreateDefaults(fields: FieldConfig[], defaultCategoryId?: string) {
  const defaults = toFormDefaults(fields);

  if (defaultCategoryId) {
    defaults.categoryId = defaultCategoryId;
  }

  return defaults;
}

function SkillMetricCard({ icon, label, value, tone = 'default' }: SkillMetricCardProps) {
  return (
    <article
      className={cn(
        'section-card px-5 py-5',
        tone === 'accent'
          ? 'bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(45,212,191,0.16))] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.2),rgba(13,148,136,0.16))]'
          : '',
      )}
    >
      <div className="flex items-center gap-3 text-foreground/58">
        <span className="rounded-2xl bg-white/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] dark:bg-white/8">
          {icon}
        </span>
        <p className="text-xs uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}

export function SkillsManager() {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkillRecord | null>(null);
  const deferredSearch = useDeferredValue(search);

  const categoriesQuery = useQuery({
    queryKey: ['admin-skill-categories-options'],
    queryFn: () =>
      apiRequest<PaginatedResponse<SkillCategoryRecord>>({
        url: '/admin/skillCategories',
        params: { page: 1, limit: 100 },
      }),
  });

  const personalSkillsSummaryQuery = useQuery({
    queryKey: ['admin-skill-personal-skills-summary'],
    queryFn: () =>
      apiRequest<PaginatedResponse<PersonalSkillRecord>>({
        url: '/admin/personalSkills',
        params: { page: 1, limit: 1 },
      }),
  });

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data?.items ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoriesQuery.data],
  );

  const categoryLookup = useMemo(
    () =>
      new Map((categoriesQuery.data?.items ?? []).map((category) => [category.id, category.name])),
    [categoriesQuery.data],
  );

  const skillFields = useMemo(
    () =>
      skillBaseFields.map((field) =>
        field.name === 'categoryId' ? { ...field, options: categoryOptions } : field,
      ),
    [categoryOptions],
  );

  const form = useForm<Record<string, unknown>>({
    defaultValues: buildCreateDefaults(skillFields, categoryOptions[0]?.value),
  });

  const watchedValues = useWatch({
    control: form.control,
    name: [
      'name',
      'description',
      'categoryId',
      'proficiencyLevel',
      'proficiencyPercentage',
      'yearsOfExperience',
      'featured',
      'publicationStatus',
      'displayOrder',
      'logoId',
    ],
  });

  const [
    nameValue,
    descriptionValue,
    categoryIdValue,
    proficiencyLevelValue,
    proficiencyPercentageValue,
    yearsOfExperienceValue,
    featuredValue,
    publicationStatusValue,
    displayOrderValue,
    logoIdValue,
  ] = watchedValues;

  const skillNamePreview = getStringValue(nameValue) || 'New skill title';
  const skillDescriptionPreview =
    getStringValue(descriptionValue) ||
    'A concise skill summary will appear here while you build the record.';
  const selectedCategoryId = getStringValue(categoryIdValue);
  const selectedCategoryPreview =
    categoryLookup.get(selectedCategoryId) ?? (categoryOptions.length > 0 ? 'Select category' : 'Create category first');
  const selectedProficiencyLevel = getStringValue(proficiencyLevelValue) || 'unselected';
  const selectedStatus = getStringValue(publicationStatusValue) || 'draft';
  const selectedDisplayOrder = getStringValue(displayOrderValue) || '0';
  const selectedLogoId = getStringValue(logoIdValue);
  const selectedProficiencyPercentage =
    proficiencyPercentageValue === '' || proficiencyPercentageValue == null
      ? null
      : Number(proficiencyPercentageValue);
  const selectedYearsOfExperience =
    yearsOfExperienceValue === '' || yearsOfExperienceValue == null
      ? null
      : Number(yearsOfExperienceValue);

  const skillsQuery = useQuery({
    queryKey: ['admin-collection', 'skills', page, deferredSearch],
    queryFn: () =>
      apiRequest<PaginatedResponse<AdminSkillRecord>>({
        url: '/admin/skills',
        params: { page, limit: 10, search: deferredSearch },
      }),
  });

  const items = skillsQuery.data?.items ?? [];
  const featuredOnPageCount = items.filter((item) => item.featured).length;
  const publishedOnPageCount = items.filter((item) => item.publicationStatus === 'published').length;

  const closeSkillModal = useCallback(() => {
    setIsSkillModalOpen(false);
    setEditingSkill(null);
    form.reset(buildCreateDefaults(skillFields, categoryOptions[0]?.value));
  }, [categoryOptions, form, skillFields]);

  const openCreateModal = () => {
    setEditingSkill(null);
    form.reset(buildCreateDefaults(skillFields, categoryOptions[0]?.value));
    setIsSkillModalOpen(true);
  };

  const openEditModal = (skill: AdminSkillRecord) => {
    setEditingSkill(skill);
    form.reset(toFormDefaults(skillFields, skill as unknown as Record<string, unknown>));
    setIsSkillModalOpen(true);
  };

  useEffect(() => {
    if (!isSkillModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSkillModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSkillModal, isSkillModalOpen]);

  useEffect(() => {
    if (!isSkillModalOpen || editingSkill || categoryOptions.length === 0) {
      return;
    }

    const currentCategory = getStringValue(form.getValues('categoryId'));
    if (currentCategory) {
      return;
    }

    form.setValue('categoryId', categoryOptions[0].value, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [categoryOptions, editingSkill, form, isSkillModalOpen]);

  const saveSkillMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      const payload = toPayload(skillFields, values);
      const method = editingSkill?.id ? 'PATCH' : 'POST';
      const url = editingSkill?.id ? `/admin/skills/${editingSkill.id}` : '/admin/skills';
      return apiRequest<AdminSkillRecord>({ url, method, data: payload });
    },
    onSuccess: async () => {
      toast.success(editingSkill ? 'Skill updated' : 'Skill created');
      closeSkillModal();
      await queryClient.invalidateQueries({ queryKey: ['admin-collection', 'skills'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save skill right now.'));
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/skills/${id}`, method: 'DELETE' }),
    onSuccess: async () => {
      toast.success('Skill deleted');
      await queryClient.invalidateQueries({ queryKey: ['admin-collection', 'skills'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete this skill right now.'));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, publicationStatus }: { id: string; publicationStatus: string }) =>
      apiRequest({
        url: `/admin/skills/${id}/status`,
        method: 'PATCH',
        data: { publicationStatus },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-collection', 'skills'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update skill status right now.'));
    },
  });

  return (
    <div className="space-y-8">
      <section className="premium-panel p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/48">Skills Control Room</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
                Manage every skill in a polished database-driven table
              </h2>
              <p className="mt-3 text-sm leading-7 text-foreground/68">
                Every skill row on this page is loaded from MongoDB, and every create, update, publish, or delete
                action writes back to the same database records used by the public portfolio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block min-w-[18rem]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/42" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search skills, levels, or descriptions"
                  className="glass-input rounded-full pl-11"
                />
              </label>
              <button
                type="button"
                onClick={openCreateModal}
                className="gradient-button flex items-center justify-center gap-2 px-6"
              >
                <CirclePlus className="h-4 w-4" />
                Add Skill
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <SkillMetricCard
              icon={<Sparkles className="h-4 w-4" />}
              label="Total Skills"
              value={String(skillsQuery.data?.pagination.totalItems ?? 0)}
              tone="accent"
            />
            <SkillMetricCard
              icon={<Layers3 className="h-4 w-4" />}
              label="Categories"
              value={String(categoriesQuery.data?.pagination.totalItems ?? 0)}
            />
            <SkillMetricCard
              icon={<Star className="h-4 w-4" />}
              label="Featured On Page"
              value={String(featuredOnPageCount)}
            />
            <SkillMetricCard
              icon={<UserRoundCheck className="h-4 w-4" />}
              label="Personal Skills"
              value={String(personalSkillsSummaryQuery.data?.pagination.totalItems ?? 0)}
            />
          </div>

          {categoryOptions.length === 0 ? (
            <div className="section-card rounded-[1.75rem] border border-amber-300/80 bg-amber-50/70 px-5 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
              Create at least one skill category below before saving a new skill. The `Add Skill` button is ready, but
              the category selector needs a real database category first.
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[1.9rem] border border-border/60 bg-white/70 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Skill Inventory</h3>
                <p className="mt-1 text-sm text-foreground/62">
                  Table view for skills fetched from the database, with fast edit and publish controls.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-foreground/55">
                <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                  Published on page: {publishedOnPageCount}
                </span>
                <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                  Current page: {items.length}
                </span>
              </div>
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left">
                  <thead className="bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(226,232,240,0.4))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.7))]">
                    <tr className="text-xs uppercase tracking-[0.22em] text-foreground/46">
                      <th className="px-5 py-4 font-semibold">Skill</th>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Proficiency</th>
                      <th className="px-5 py-4 font-semibold">Experience</th>
                      <th className="px-5 py-4 font-semibold">Visibility</th>
                      <th className="px-5 py-4 font-semibold">Assets</th>
                      <th className="px-5 py-4 font-semibold">Order</th>
                      <th className="px-5 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((skill, index) => {
                      const categoryName = categoryLookup.get(skill.categoryId) ?? 'Unassigned category';
                      const proficiencyLabel = skill.proficiencyLevel
                        ? formatLabel(skill.proficiencyLevel)
                        : 'Not set';
                      const percentageLabel =
                        typeof skill.proficiencyPercentage === 'number'
                          ? `${skill.proficiencyPercentage}%`
                          : 'No percentage';

                      return (
                        <tr
                          key={skill.id}
                          className={cn(
                            'border-t border-border/60 align-top transition hover:bg-sky-50/40 dark:hover:bg-white/4',
                            index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/35 dark:bg-white/[0.02]',
                          )}
                        >
                          <td className="px-5 py-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{skill.name}</p>
                                {skill.featured ? (
                                  <span className="rounded-full border border-sky-300/80 bg-sky-500/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/20 dark:text-sky-200">
                                    Featured
                                  </span>
                                ) : null}
                              </div>
                              <p className="max-w-[28rem] text-sm leading-6 text-foreground/64">
                                {skill.description?.trim() || 'No description yet.'}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground/78">
                              {categoryName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-2">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold',
                                  getProficiencyChipClassName(skill.proficiencyLevel ?? ''),
                                )}
                              >
                                {proficiencyLabel}
                              </span>
                              <p className="text-xs text-foreground/55">{percentageLabel}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-2 text-sm text-foreground/70">
                              <p>{formatExperienceYears(skill.yearsOfExperience)}</p>
                              <p className="text-xs text-foreground/50">Icon: {skill.icon?.trim() || 'Not set'}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-2">
                              <span
                                className={cn(
                                  'inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold',
                                  getStatusChipClassName(skill.publicationStatus),
                                )}
                              >
                                {formatLabel(skill.publicationStatus)}
                              </span>
                              <p className="text-xs text-foreground/50">
                                {skill.featured ? 'Highlighted on the public portfolio' : 'Standard listing'}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-2 text-sm text-foreground/70">
                              <p>{skill.logoId ? 'Logo linked' : 'No media linked'}</p>
                              <p className="max-w-[12rem] break-all text-xs text-foreground/50">
                                {skill.logoId?.trim() || 'Media ID will appear here after linking from Media Library.'}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-foreground/76">
                            {skill.displayOrder}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(skill)}
                                className="ghost-button flex items-center gap-2 px-3 py-2 text-xs"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: skill.id,
                                    publicationStatus:
                                      skill.publicationStatus === 'published' ? 'draft' : 'published',
                                  })
                                }
                                className="ghost-button px-3 py-2 text-xs"
                              >
                                {skill.publicationStatus === 'published' ? 'Move to draft' : 'Publish'}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSkillMutation.mutate(skill.id)}
                                className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 dark:bg-rose-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="font-display text-2xl font-semibold text-foreground">No skills found yet</p>
                <p className="mt-3 text-sm text-foreground/62">
                  Add the first skill from the button above and it will be stored in the database immediately.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="gradient-button mt-6 inline-flex items-center gap-2 px-6"
                >
                  <CirclePlus className="h-4 w-4" />
                  Add Skill
                </button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/60 px-5 py-4 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="ghost-button px-3 py-2 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {skillsQuery.data?.pagination.page ?? 1} of {skillsQuery.data?.pagination.totalPages ?? 1}
              </span>
              <button
                type="button"
                disabled={page >= (skillsQuery.data?.pagination.totalPages ?? 1)}
                onClick={() =>
                  setPage((current) =>
                    Math.min(skillsQuery.data?.pagination.totalPages ?? current, current + 1),
                  )
                }
                className="ghost-button px-3 py-2 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 2xl:grid-cols-2">
        <CollectionManager
          title="Skill Categories"
          endpoint="skillCategories"
          fields={collectionFields.skillCategories}
          description="Create and publish the categories that drive the database-backed skill selector above."
          actionLabel="Add category"
          extraInvalidateQueryKeys={[['admin-skill-categories-options']]}
        />
        <CollectionManager
          title="Personal Skills"
          endpoint="personalSkills"
          fields={collectionFields.personalSkills}
          description="Manage the softer strengths shown on the public skills experience from the same database."
          actionLabel="Add personal skill"
        />
      </div>

      {isSkillModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeSkillModal}
        >
          <div
            className="premium-panel w-full max-w-6xl overflow-hidden p-0 shadow-[0_40px_120px_rgba(3,7,18,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">
                  {editingSkill ? 'Skill Editor' : 'Add Skill'}
                </p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">
                  {editingSkill ? `Update ${editingSkill.name}` : 'Create a polished skill record'}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/66">
                  Save here once, and the same MongoDB record becomes available to the admin dashboard and the public
                  portfolio skills pages.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSkillModal}
                className="ghost-button rounded-full px-3 py-3"
                aria-label="Close skill editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => saveSkillMutation.mutate(values))}
              className="grid gap-0 xl:grid-cols-[1.18fr_0.82fr]"
            >
              <div className="max-h-[78vh] overflow-y-auto px-6 py-6">
                {categoryOptions.length === 0 ? (
                  <div className="section-card mb-6 rounded-[1.75rem] border border-amber-300/80 bg-amber-50/70 px-5 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                    Create a skill category before saving this record. The form is ready, but `Category` is required
                    and is fetched from the skill categories collection in the database.
                  </div>
                ) : null}
                <DynamicFields fields={skillFields} register={form.register} />
              </div>

              <aside className="border-t border-border/60 bg-[linear-gradient(180deg,rgba(241,245,249,0.82),rgba(236,253,245,0.58))] px-6 py-6 dark:border-t-0 dark:border-l dark:border-border/60 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(8,47,73,0.32))] xl:border-l xl:border-t-0">
                <div className="space-y-5">
                  <div className="section-card px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">Live Preview</p>
                    <h4 className="mt-3 font-display text-2xl font-semibold text-foreground">{skillNamePreview}</h4>
                    <p className="mt-3 text-sm leading-7 text-foreground/68">{skillDescriptionPreview}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border/60 bg-background/78 px-3 py-1.5 text-xs font-semibold text-foreground/78">
                        {selectedCategoryPreview}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold',
                          getProficiencyChipClassName(selectedProficiencyLevel),
                        )}
                      >
                        {formatLabel(selectedProficiencyLevel)}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold',
                          getStatusChipClassName(selectedStatus),
                        )}
                      >
                        {formatLabel(selectedStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <SkillMetricCard
                      icon={<Sparkles className="h-4 w-4" />}
                      label="Proficiency"
                      value={
                        typeof selectedProficiencyPercentage === 'number'
                          ? `${selectedProficiencyPercentage}%`
                          : 'No percentage yet'
                      }
                    />
                    <SkillMetricCard
                      icon={<Layers3 className="h-4 w-4" />}
                      label="Years"
                      value={formatExperienceYears(selectedYearsOfExperience)}
                    />
                    <SkillMetricCard
                      icon={<Star className="h-4 w-4" />}
                      label="Featured"
                      value={featuredValue ? 'Yes' : 'No'}
                    />
                    <SkillMetricCard
                      icon={<UserRoundCheck className="h-4 w-4" />}
                      label="Display Order"
                      value={selectedDisplayOrder}
                    />
                  </div>

                  <div className="section-card space-y-3 px-5 py-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-foreground/48">Linked Media</p>
                    <p className="text-sm leading-7 text-foreground/68">
                      {selectedLogoId
                        ? 'This skill will use the linked media asset stored in the media library collection.'
                        : 'No media asset linked yet. Add a media ID here if you want a visual logo on the public page.'}
                    </p>
                    <p className="break-all text-xs text-foreground/50">
                      {selectedLogoId || 'Media ID not set'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row xl:flex-col">
                    <button
                      type="submit"
                      disabled={saveSkillMutation.isPending || categoryOptions.length === 0}
                      className="gradient-button w-full justify-center"
                    >
                      {saveSkillMutation.isPending
                        ? 'Saving...'
                        : editingSkill
                          ? 'Update skill'
                          : 'Create skill'}
                    </button>
                    <button
                      type="button"
                      onClick={closeSkillModal}
                      className="ghost-button w-full justify-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </aside>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

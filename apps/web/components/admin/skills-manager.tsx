'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { collectionFields } from '@/lib/admin-config';
import { CollectionManager } from '@/components/admin/collection-manager';
import { useAuth } from '@/providers/auth-provider';

export function SkillsManager() {
  const { apiRequest } = useAuth();
  const categoriesQuery = useQuery({
    queryKey: ['admin-skill-categories-options'],
    queryFn: () =>
      apiRequest<{ items: Array<Record<string, unknown>> }>({
        url: '/admin/skillCategories',
        params: { page: 1, limit: 100 },
      }),
  });

  const skillFields = useMemo(() => {
    const categoryOptions = (categoriesQuery.data?.items ?? []).map((category) => ({
      label: String(category.name),
      value: String(category.id),
    }));
    return collectionFields.skills.map((field) =>
      field.name === 'categoryId' ? { ...field, options: categoryOptions } : field,
    );
  }, [categoriesQuery.data]);

  return (
    <div className="space-y-8">
      <CollectionManager
        title="Skill Categories"
        endpoint="skillCategories"
        fields={collectionFields.skillCategories}
      />
      <CollectionManager title="Skills" endpoint="skills" fields={skillFields} />
      <CollectionManager
        title="Personal Skills"
        endpoint="personalSkills"
        fields={collectionFields.personalSkills}
      />
    </div>
  );
}

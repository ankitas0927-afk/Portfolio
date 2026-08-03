'use client';

import type { UseFormRegister } from 'react-hook-form';

import type { FieldConfig } from '@/lib/admin-config';

const inputClassName =
  'w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-accent';

export function DynamicFields({
  fields,
  register,
}: {
  fields: FieldConfig[];
  register: UseFormRegister<Record<string, unknown>>;
}) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="mb-2 block text-sm font-medium text-foreground/72">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea rows={5} className={inputClassName} {...register(field.name)} />
          ) : field.type === 'tags' ? (
            <textarea
              rows={3}
              className={inputClassName}
              placeholder="Separate values with commas"
              {...register(field.name)}
            />
          ) : field.type === 'checkbox' ? (
            <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm">
              <input type="checkbox" {...register(field.name)} className="h-4 w-4 rounded border-border/70" />
              <span>{field.label}</span>
            </label>
          ) : field.type === 'select' ? (
            <select className={inputClassName} {...register(field.name)}>
              <option value="">Select an option</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
              className={inputClassName}
              placeholder={field.placeholder}
              {...register(field.name)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function toFormDefaults(
  fields: FieldConfig[],
  values?: Record<string, unknown> | null,
): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values?.[field.name];
      if (field.type === 'checkbox') {
        return [field.name, Boolean(value)];
      }
      if (field.type === 'tags') {
        return [field.name, Array.isArray(value) ? value.join(', ') : (value ?? '')];
      }
      return [field.name, value ?? ''];
    }),
  );
}

export function toPayload(
  fields: FieldConfig[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((field) => {
      const rawValue = values[field.name];

      if (field.type === 'checkbox') {
        return [field.name, Boolean(rawValue)];
      }

      if (field.type === 'number') {
        return [field.name, rawValue === '' ? undefined : Number(rawValue)];
      }

      if (field.type === 'tags') {
        const parts = String(rawValue ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        return [field.name, parts];
      }

      const normalized = String(rawValue ?? '').trim();
      return [field.name, normalized.length === 0 ? undefined : normalized];
    }),
  );
}

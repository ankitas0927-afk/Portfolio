'use client';

import type { UseFormRegister } from 'react-hook-form';

import type { FieldConfig } from '@/lib/admin-config';

const inputClassName =
  'glass-input';

export function DynamicFields({
  fields,
  register,
}: {
  fields: FieldConfig[];
  register: UseFormRegister<Record<string, unknown>>;
}) {
  return (
    <div className="grid gap-5">
      {fields.map((field) => (
        <div key={field.name} className="section-card px-4 py-4">
          <label className="mb-2 block text-sm font-semibold text-foreground/82">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              rows={5}
              className={inputClassName}
              placeholder={field.placeholder}
              {...register(field.name)}
            />
          ) : field.type === 'tags' ? (
            <textarea
              rows={3}
              className={inputClassName}
              placeholder={field.placeholder ?? 'Separate values with commas'}
              {...register(field.name)}
            />
          ) : field.type === 'checkbox' ? (
            <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
              <input type="checkbox" {...register(field.name)} className="h-4 w-4 rounded border-border/70" />
              <span className="font-medium text-foreground/76">{field.label}</span>
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
              type={
                field.type === 'number'
                  ? 'number'
                  : field.type === 'email'
                    ? 'email'
                    : field.type === 'url'
                      ? 'url'
                      : 'text'
              }
              className={inputClassName}
              placeholder={field.placeholder}
              {...register(field.name)}
            />
          )}
          {field.placeholder ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-foreground/42">
              {field.placeholder}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function toFormDefaults(
  fields: FieldConfig[],
  values?: Record<string, unknown> | null,
): Record<string, unknown> {
  const toScalarInputValue = (value: unknown) => {
    if (value == null) {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    const stringValue = String(value);
    return stringValue === '[object Object]' ? '' : stringValue;
  };

  return Object.fromEntries(
    fields.map((field) => {
      const value = values?.[field.name];
      if (field.type === 'checkbox') {
        return [field.name, Boolean(value)];
      }
      if (field.type === 'tags') {
        return [field.name, Array.isArray(value) ? value.join(', ') : (value ?? '')];
      }
      return [field.name, toScalarInputValue(value)];
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

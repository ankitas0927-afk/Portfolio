import type { ExperienceRecord } from '@ankita-portfolio/shared-types';

type ExperienceDurationLike = Pick<
  ExperienceRecord,
  'startDate' | 'endDate' | 'isCurrentPosition' | 'approximateDuration'
>;

function getMonthKey(date: Date) {
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

function formatDurationPart(value: number, unit: 'year' | 'month') {
  return `${value} ${unit}${value === 1 ? '' : 's'}`;
}

function formatDurationFromMonths(totalMonths: number) {
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

function parseApproximateDurationToMonths(value?: string | null) {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (!normalized) {
    return 0;
  }

  const yearMatches = normalized.match(/(\d+)\s+year/g) ?? [];
  const monthMatches = normalized.match(/(\d+)\s+month/g) ?? [];

  const years = yearMatches.reduce((total, match) => {
    const digits = match.match(/\d+/)?.[0];
    return total + Number(digits ?? 0);
  }, 0);

  const months = monthMatches.reduce((total, match) => {
    const digits = match.match(/\d+/)?.[0];
    return total + Number(digits ?? 0);
  }, 0);

  return years * 12 + months;
}

export function parseExperienceDate(rawValue?: string | null) {
  const value = rawValue?.trim();
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

export function calculateExperienceDuration(
  startDate?: string | null,
  endDate?: string | null,
  isCurrentPosition = false,
) {
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

  return formatDurationFromMonths(totalMonths);
}

export function formatExperienceDate(value?: string | null) {
  const parsed = parseExperienceDate(value);
  if (!parsed) {
    return value ?? '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function getExperienceDurationLabel(item: ExperienceDurationLike) {
  return (
    calculateExperienceDuration(item.startDate, item.endDate, item.isCurrentPosition) ||
    item.approximateDuration ||
    ''
  );
}

export function getTotalExperienceLabel(items: ExperienceDurationLike[]) {
  const coveredMonths = new Set<number>();
  let fallbackMonths = 0;

  for (const item of items) {
    const start = parseExperienceDate(item.startDate);
    const end = parseExperienceDate(item.endDate);
    const comparisonDate = item.isCurrentPosition ? new Date() : end;

    if (start && comparisonDate) {
      const startMonthKey = getMonthKey(start);
      const endMonthKey = getMonthKey(comparisonDate);

      if (endMonthKey >= startMonthKey) {
        for (let monthKey = startMonthKey; monthKey <= endMonthKey; monthKey += 1) {
          coveredMonths.add(monthKey);
        }
      }
      continue;
    }

    fallbackMonths += parseApproximateDurationToMonths(item.approximateDuration);
  }

  const totalMonths = coveredMonths.size + fallbackMonths;
  const durationLabel = formatDurationFromMonths(totalMonths);

  return durationLabel ? `${durationLabel} experience` : '';
}

export function getExperienceDateRangeLabel(item: ExperienceDurationLike) {
  if (!item.startDate) {
    return '';
  }

  return `${formatExperienceDate(item.startDate)}${
    item.endDate
      ? ` - ${formatExperienceDate(item.endDate)}`
      : item.isCurrentPosition
        ? ' - Present'
        : ''
  }`;
}

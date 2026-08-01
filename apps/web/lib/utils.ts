import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function compact<T>(items: Array<T | undefined | null | false | "">): T[] {
  return items.filter(Boolean) as T[];
}

export function formatDisplayDate(
  item: {
    startDate?: string | undefined;
    endDate?: string | undefined;
    completionDate?: string | undefined;
    approximateDuration?: string | undefined;
    duration?: string | undefined;
  },
  fallback = "",
): string {
  if (item.approximateDuration) {
    return item.approximateDuration;
  }
  if (item.duration) {
    return item.duration;
  }
  if (item.startDate && item.endDate) {
    return `${item.startDate} - ${item.endDate}`;
  }
  if (item.startDate) {
    return item.startDate;
  }
  if (item.completionDate) {
    return item.completionDate;
  }
  return fallback;
}

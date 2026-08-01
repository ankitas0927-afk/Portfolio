import path from "node:path";
import sanitizeHtml from "sanitize-html";

export function sanitizeText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

export function sanitizeRecord<T extends Record<string, unknown>>(input: T): T {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      output[key] = sanitizeText(value);
      continue;
    }
    if (Array.isArray(value)) {
      output[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
      continue;
    }
    output[key] = value;
  }
  return output as T;
}

export function safeFilename(name: string): string {
  const parsed = path.parse(name);
  const safeBase = parsed.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100) || "file";
  const safeExt = parsed.ext.replace(/[^a-zA-Z0-9.]+/g, "").slice(0, 12);
  return `${safeBase}${safeExt}`;
}

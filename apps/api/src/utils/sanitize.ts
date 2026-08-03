import path from "node:path";

const HTML_TAG_REGEX = /<\/?[A-Za-z][^>]*>/g;
const HTML_BLOCK_REGEX = /<(script|style|iframe|object|embed|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const HTML_COMMENT_REGEX = /<!--[\s\S]*?-->/g;
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value: string): string {
  return value
    .replace(HTML_COMMENT_REGEX, "")
    .replace(HTML_BLOCK_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .replace(CONTROL_CHAR_REGEX, "")
    .trim();
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
  const safeBase =
    parsed.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 100) || "file";
  const safeExt = parsed.ext.replace(/[^a-zA-Z0-9.]+/g, "").slice(0, 12);
  return `${safeBase}${safeExt}`;
}

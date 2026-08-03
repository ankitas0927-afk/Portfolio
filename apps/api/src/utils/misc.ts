import { createHash, randomUUID } from 'crypto';
import { existsSync } from 'fs';
import path from 'path';

import type { Request } from 'express';

export function safeParseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function createChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function createStoredFilename(originalName: string): string {
  const ext = path.extname(originalName);
  return `${randomUUID()}${ext.toLowerCase()}`;
}

export function resolveAbsolutePath(...parts: string[]): string {
  return path.resolve(...parts);
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function getClientDetails(request: Request) {
  const forwarded = request.headers['x-forwarded-for'];
  const ipAddress =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim() || request.ip
      : request.ip ?? 'unknown';

  return {
    ipAddress: ipAddress || 'unknown',
    userAgent: request.headers['user-agent'] ?? 'unknown',
  };
}

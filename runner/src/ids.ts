import { randomBytes } from 'node:crypto';

export function shortId(): string {
  return randomBytes(3).toString('hex');
}

export function dateSlug(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

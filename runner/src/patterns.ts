import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { paths } from './paths.js';

export interface Pattern {
  slug: string;
  title: string;
  category: string;
  severity: string;
  brands_affected: string[];
  platforms_seen: string[];
  detection_signals?: string[];
  keywords?: string[];
  regex_hints?: string[];
  source?: Record<string, unknown>;
  confidence: string;
  learned_at?: string;
  learned_by?: string;
  body: string;
}

export function loadPatterns(): Pattern[] {
  if (!fs.existsSync(paths.patterns)) return [];
  return fs
    .readdirSync(paths.patterns)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(paths.patterns, f), 'utf-8');
      const { data, content } = matter(raw);
      return { ...(data as Omit<Pattern, 'body'>), body: content };
    });
}

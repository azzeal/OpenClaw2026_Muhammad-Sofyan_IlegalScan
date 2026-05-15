import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { paths } from './paths';
import { listJournal, listPatterns, listProjects } from './clearmark';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS patterns_fts USING fts5(
  slug, title, category, severity, brands, body, source_ref,
  tokenize = 'porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS journal_fts USING fts5(
  date, authors, phase, body,
  tokenize = 'porter unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts USING fts5(
  slug, client_name, industry, products, applied_patterns, status,
  tokenize = 'porter unicode61'
);
`;

export function openDb() {
  fs.mkdirSync(path.dirname(paths.indexDb), { recursive: true });
  const db = new Database(paths.indexDb);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

export interface IndexStats {
  patterns: number;
  journal: number;
  projects: number;
  built_at: string;
  duration_ms: number;
}

export function rebuildIndex(): IndexStats {
  const t0 = Date.now();
  const db = openDb();
  try {
    db.exec('BEGIN');
    db.exec('DELETE FROM patterns_fts;');
    db.exec('DELETE FROM journal_fts;');
    db.exec('DELETE FROM projects_fts;');

    const insP = db.prepare(
      'INSERT INTO patterns_fts(slug,title,category,severity,brands,body,source_ref) VALUES (?,?,?,?,?,?,?)',
    );
    const patterns = listPatterns();
    for (const p of patterns) {
      const src = p.source as { ref?: string; title?: string } | undefined;
      insP.run(
        p.slug,
        p.title,
        p.category,
        p.severity,
        (p.brands_affected ?? []).join(', '),
        p.body,
        src ? `${src.ref ?? ''} ${src.title ?? ''}`.trim() : '',
      );
    }

    const insJ = db.prepare('INSERT INTO journal_fts(date,authors,phase,body) VALUES (?,?,?,?)');
    const journal = listJournal();
    for (const j of journal) {
      insJ.run(j.date, (j.authors ?? []).join(', '), j.phase ?? '', j.body);
    }

    const insPr = db.prepare(
      'INSERT INTO projects_fts(slug,client_name,industry,products,applied_patterns,status) VALUES (?,?,?,?,?,?)',
    );
    const projects = listProjects();
    for (const pr of projects) {
      insPr.run(
        pr.slug,
        pr.client_name,
        pr.industry ?? '',
        pr.products.map((p) => `${p.name} ${p.nie ?? ''}`).join(' | '),
        (pr.applied_patterns ?? []).join(', '),
        pr.status,
      );
    }

    const built_at = new Date().toISOString();
    db.prepare('INSERT OR REPLACE INTO meta(key, value) VALUES (?, ?)').run('built_at', built_at);
    db.exec('COMMIT');
    return {
      patterns: patterns.length,
      journal: journal.length,
      projects: projects.length,
      built_at,
      duration_ms: Date.now() - t0,
    };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  } finally {
    db.close();
  }
}

export interface SearchHit {
  source: 'pattern' | 'journal' | 'project';
  slug: string;
  title: string;
  snippet: string;
}

export function search(query: string, limit = 25): SearchHit[] {
  if (!query.trim()) return [];
  const db = openDb();
  try {
    const q = query.replace(/"/g, '');
    const hits: SearchHit[] = [];
    const pr = db
      .prepare(
        `SELECT slug, title, snippet(patterns_fts, 5, '<mark>', '</mark>', '…', 12) AS snip FROM patterns_fts WHERE patterns_fts MATCH ? LIMIT ?`,
      )
      .all(q, limit) as Array<{ slug: string; title: string; snip: string }>;
    for (const r of pr) hits.push({ source: 'pattern', slug: r.slug, title: r.title, snippet: r.snip });

    const jr = db
      .prepare(
        `SELECT date, snippet(journal_fts, 3, '<mark>', '</mark>', '…', 12) AS snip FROM journal_fts WHERE journal_fts MATCH ? LIMIT ?`,
      )
      .all(q, limit) as Array<{ date: string; snip: string }>;
    for (const r of jr) hits.push({ source: 'journal', slug: r.date, title: r.date, snippet: r.snip });

    const prj = db
      .prepare(
        `SELECT slug, client_name, snippet(projects_fts, 3, '<mark>', '</mark>', '…', 12) AS snip FROM projects_fts WHERE projects_fts MATCH ? LIMIT ?`,
      )
      .all(q, limit) as Array<{ slug: string; client_name: string; snip: string }>;
    for (const r of prj) hits.push({ source: 'project', slug: r.slug, title: r.client_name, snippet: r.snip });

    return hits.slice(0, limit);
  } finally {
    db.close();
  }
}

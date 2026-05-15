import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { paths, agentDir, AGENT_IDS, type AgentId } from './paths';

export interface AgentState {
  agent_id: AgentId;
  role: string;
  display_name: string;
  mission: string;
  status: 'idle' | 'busy' | 'blocked';
  current_task_id: string | null;
  last_heartbeat: string;
  last_action: string;
  metrics_today: Record<string, number>;
  accent_color: string;
}

export interface Task {
  task_id: string;
  project_slug?: string;
  created_at: string;
  created_by?: string;
  type?: string;
  instructions?: string;
  deadline?: string | null;
}

export interface Project {
  slug: string;
  client_name: string;
  client_legal_name?: string;
  manufacturer_of_record?: string;
  industry?: string;
  category?: string;
  status: string;
  created_at: string;
  products: Array<{
    id: string;
    name: string;
    active_ingredient?: string;
    therapeutic_class?: string;
    form?: string;
    packaging?: string;
    nie?: string;
  }>;
  watch_platforms?: string[];
  applied_patterns?: string[];
  stats: {
    findings_total: number;
    findings_high_confidence?: number;
    reports_filed: number;
    last_scan_started_at: string | null;
    last_scan_completed_at: string | null;
  };
  next_step?: { action: string; owner: string; due: string | null; note?: string };
  sources?: Array<Record<string, unknown>>;
  legal_basis?: string[];
  context_stats?: Record<string, unknown>;
}

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
  learned_at: string;
  learned_by?: string;
  confidence: string;
  body: string;
}

export interface JournalEntry {
  date: string;
  authors?: string[];
  phase?: string;
  body: string;
  path: string;
}

function safeReadJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

function existsDir(p: string) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function listAgents(): AgentState[] {
  return AGENT_IDS.map((id) => {
    const file = path.join(agentDir(id), 'state.json');
    const s = safeReadJson<AgentState>(file);
    if (s) return s;
    return {
      agent_id: id,
      role: id,
      display_name: id,
      mission: '',
      status: 'idle',
      current_task_id: null,
      last_heartbeat: new Date(0).toISOString(),
      last_action: 'No state file.',
      metrics_today: {},
      accent_color: '#888',
    };
  });
}

export function listTasksFor(id: AgentId): Task[] {
  const dir = path.join(agentDir(id), 'tasks');
  if (!existsDir(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => safeReadJson<Task>(path.join(dir, f)))
    .filter((t): t is Task => !!t)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function listAllTasks(): Array<Task & { agent_id: AgentId }> {
  return AGENT_IDS.flatMap((id) => listTasksFor(id).map((t) => ({ ...t, agent_id: id })));
}

export function listProjects(): Project[] {
  if (!existsDir(paths.projects)) return [];
  return fs
    .readdirSync(paths.projects)
    .filter((slug) => existsDir(path.join(paths.projects, slug)))
    .map((slug) => safeReadJson<Project>(path.join(paths.projects, slug, 'project.json')))
    .filter((p): p is Project => !!p);
}

export function listPatterns(): Pattern[] {
  if (!existsDir(paths.patterns)) return [];
  return fs
    .readdirSync(paths.patterns)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(paths.patterns, f), 'utf-8');
      const { data, content } = matter(raw);
      return { ...(data as Omit<Pattern, 'body'>), body: content };
    });
}

export function listJournal(): JournalEntry[] {
  if (!existsDir(paths.journal)) return [];
  return fs
    .readdirSync(paths.journal)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const full = path.join(paths.journal, f);
      const raw = fs.readFileSync(full, 'utf-8');
      const { data, content } = matter(raw);
      const rawDate = data.date;
      const date =
        rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : (rawDate as string | undefined) ?? f.replace(/\.md$/, '');
      return {
        date,
        authors: data.authors as string[] | undefined,
        phase: data.phase as string | undefined,
        body: content,
        path: full,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function summarizeWorkspace() {
  const agents = listAgents();
  const projects = listProjects();
  const patterns = listPatterns();
  const journal = listJournal();
  return {
    agents,
    projects,
    patterns_count: patterns.length,
    journal_days: journal.length,
    workspace_root: paths.workspace,
  };
}

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
// paths.ts lives at <workspace>/runner/src/paths.ts → workspace is two levels up.
const DEFAULT_WORKSPACE = path.resolve(path.dirname(__filename), '..', '..');

export const WORKSPACE_ROOT = process.env.CLEARMARK_WORKSPACE
  ? path.resolve(process.env.CLEARMARK_WORKSPACE)
  : DEFAULT_WORKSPACE;

export const CLEARMARK = path.join(WORKSPACE_ROOT, 'clearmark');

export const paths = {
  workspace: WORKSPACE_ROOT,
  root: CLEARMARK,
  projects: path.join(CLEARMARK, 'projects'),
  agents: path.join(CLEARMARK, 'agents'),
  patterns: path.join(CLEARMARK, 'memory', 'patterns'),
  journal: path.join(CLEARMARK, 'memory', 'journal'),
  inbox: path.join(CLEARMARK, 'inbox'),
  inboxProcessed: path.join(CLEARMARK, 'inbox', 'processed'),
  skills: path.join(WORKSPACE_ROOT, 'skills'),
};

export const AGENT_IDS = ['scanner', 'intake', 'analyst'] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export function agentDir(id: AgentId) {
  return path.join(paths.agents, id);
}

export function projectDir(slug: string) {
  return path.join(paths.projects, slug);
}

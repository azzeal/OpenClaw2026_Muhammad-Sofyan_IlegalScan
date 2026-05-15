import path from 'node:path';

const cwd = process.cwd();
const WORKSPACE_ROOT_GUESS = path.resolve(cwd, '..');

export const WORKSPACE_ROOT = process.env.CLEARMARK_WORKSPACE
  ? path.resolve(process.env.CLEARMARK_WORKSPACE)
  : WORKSPACE_ROOT_GUESS;

export const CLEARMARK_ROOT = path.join(WORKSPACE_ROOT, 'clearmark');

export const paths = {
  workspace: WORKSPACE_ROOT,
  root: CLEARMARK_ROOT,
  projects: path.join(CLEARMARK_ROOT, 'projects'),
  agents: path.join(CLEARMARK_ROOT, 'agents'),
  memory: path.join(CLEARMARK_ROOT, 'memory'),
  journal: path.join(CLEARMARK_ROOT, 'memory', 'journal'),
  patterns: path.join(CLEARMARK_ROOT, 'memory', 'patterns'),
  inbox: path.join(CLEARMARK_ROOT, 'inbox'),
  indexDb: path.join(CLEARMARK_ROOT, '.index.db'),
};

export const AGENT_IDS = ['scanner', 'intake', 'analyst'] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export function agentDir(id: AgentId) {
  return path.join(paths.agents, id);
}

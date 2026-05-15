import fs from 'node:fs';
import path from 'node:path';
import { agentDir, type AgentId } from './paths.js';
import { dateSlug, nowIso } from './ids.js';

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

function statePath(id: AgentId): string {
  return path.join(agentDir(id), 'state.json');
}

function logPath(id: AgentId, date: string = dateSlug()): string {
  return path.join(agentDir(id), 'log', `${date}.jsonl`);
}

export function readState(id: AgentId): AgentState {
  return JSON.parse(fs.readFileSync(statePath(id), 'utf-8')) as AgentState;
}

export function writeStatePatch(id: AgentId, patch: Partial<AgentState>): void {
  const cur = readState(id);
  const next: AgentState = { ...cur, ...patch, last_heartbeat: nowIso() };
  fs.writeFileSync(statePath(id), JSON.stringify(next, null, 2) + '\n');
}

export type LogEvent = { event: string } & Record<string, unknown>;

export function appendLog(id: AgentId, event: LogEvent): void {
  const file = logPath(id);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const line = JSON.stringify({ ts: nowIso(), ...event }) + '\n';
  fs.appendFileSync(file, line);
}

export function claimBusy(id: AgentId, taskId: string | null, action: string): void {
  writeStatePatch(id, { status: 'busy', current_task_id: taskId, last_action: action });
  appendLog(id, { event: 'agent_busy', task_id: taskId ?? null });
}

export function markIdle(id: AgentId, summary: string): void {
  writeStatePatch(id, { status: 'idle', current_task_id: null, last_action: summary });
  appendLog(id, { event: 'agent_idle', summary });
}

export function markBlocked(id: AgentId, reason: string): void {
  writeStatePatch(id, { status: 'blocked', last_action: `BLOCKED: ${reason.slice(0, 200)}` });
  appendLog(id, { event: 'agent_blocked', reason });
}

export function heartbeat(id: AgentId): void {
  writeStatePatch(id, {});
}

export function bumpMetric(id: AgentId, key: string, delta = 1): void {
  const cur = readState(id);
  const m = { ...cur.metrics_today };
  m[key] = (m[key] ?? 0) + delta;
  writeStatePatch(id, { metrics_today: m });
}

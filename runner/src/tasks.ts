import fs from 'node:fs';
import path from 'node:path';
import { agentDir, type AgentId } from './paths.js';

export interface Task {
  task_id: string;
  project_slug?: string;
  created_at: string;
  created_by?: string;
  type?: string;
  instructions?: string;
  target_urls?: string[];
  deadline?: string | null;
}

function taskDir(id: AgentId): string {
  return path.join(agentDir(id), 'tasks');
}

export function listTasks(id: AgentId): Task[] {
  const dir = taskDir(id);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as Task)
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
}

export function nextTask(id: AgentId): Task | null {
  return listTasks(id)[0] ?? null;
}

export function writeTask(id: AgentId, task: Task): void {
  const dir = taskDir(id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${task.task_id}.json`), JSON.stringify(task, null, 2) + '\n');
}

export function completeTask(id: AgentId, taskId: string): void {
  const file = path.join(taskDir(id), `${taskId}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

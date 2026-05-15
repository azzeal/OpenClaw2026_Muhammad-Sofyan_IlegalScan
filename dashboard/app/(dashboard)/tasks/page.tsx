import { TasksBoard } from './_components/tasks-board';
import { listAgents, readLogTail, getActiveTaskFor } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  const initial = listAgents().map((a) => ({
    ...a,
    active_task: getActiveTaskFor(a.agent_id),
    log_tail: readLogTail(a.agent_id, 6),
  }));
  return <TasksBoard initial={{ agents: initial, server_time: new Date().toISOString() }} />;
}

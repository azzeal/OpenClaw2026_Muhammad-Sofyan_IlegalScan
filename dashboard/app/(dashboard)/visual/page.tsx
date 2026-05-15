import { listAgents, readLogTail, getActiveTaskFor } from '@/lib/clearmark';
import { Office } from './_components/office';

export const dynamic = 'force-dynamic';

export default function VisualPage() {
  const agents = listAgents().map((a) => ({
    ...a,
    active_task: getActiveTaskFor(a.agent_id),
    log_tail: readLogTail(a.agent_id, 6),
  }));
  return <Office initial={{ agents, server_time: new Date().toISOString() }} />;
}

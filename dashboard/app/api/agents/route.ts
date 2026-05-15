import { NextResponse } from 'next/server';
import { listAgents, readLogTail, getActiveTaskFor } from '@/lib/clearmark';
import { AGENT_IDS } from '@/lib/paths';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const agents = listAgents().map((a) => ({
    ...a,
    active_task: getActiveTaskFor(a.agent_id),
    log_tail: readLogTail(a.agent_id, 6),
  }));
  return NextResponse.json(
    { agents, server_time: new Date().toISOString(), agent_ids: AGENT_IDS },
    { headers: { 'cache-control': 'no-store' } },
  );
}

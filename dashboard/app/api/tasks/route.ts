import { NextResponse } from 'next/server';
import { listAllTasks } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const tasks = listAllTasks();
  return NextResponse.json(
    { tasks, server_time: new Date().toISOString() },
    { headers: { 'cache-control': 'no-store' } },
  );
}

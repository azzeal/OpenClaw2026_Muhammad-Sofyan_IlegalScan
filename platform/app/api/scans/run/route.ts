import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runScanForTenant } from '@/lib/scan/run';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const summary = await runScanForTenant(session.user.tenantId);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

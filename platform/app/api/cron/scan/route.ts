import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { runScanForTenant } from '@/lib/scan/run';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const activeTenants = await db
    .select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .where(inArray(tenants.status, ['trialing', 'active']));

  const results: Array<{ tenant: string; ok: boolean; findings: number; durationMs: number; error?: string }> = [];
  for (const t of activeTenants) {
    try {
      const summary = await runScanForTenant(t.id);
      results.push({ tenant: t.name, ok: true, findings: summary.totalFindings, durationMs: summary.durationMs });
    } catch (err) {
      results.push({ tenant: t.name, ok: false, findings: 0, durationMs: 0, error: String(err) });
    }
  }
  return NextResponse.json({ ok: true, tenants_scanned: activeTenants.length, results });
}

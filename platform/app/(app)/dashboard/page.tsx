import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, findings, scans, subscriptions, tenants } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatIdr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function DashboardOverview() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);

  const productCount = (
    await db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.tenantId, tenantId))
  )[0].count;

  const findingsTotalRow = (
    await db.select({ count: sql<number>`count(*)::int` }).from(findings).where(eq(findings.tenantId, tenantId))
  )[0];

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const findingsWeekRow = (
    await db
      .select({ count: sql<number>`count(*)::int` })
      .from(findings)
      .where(and(eq(findings.tenantId, tenantId), gte(findings.discoveredAt, weekAgo)))
  )[0];

  const scansRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scans)
    .where(eq(scans.tenantId, tenantId));

  const recent = await db
    .select()
    .from(findings)
    .where(eq(findings.tenantId, tenantId))
    .orderBy(sql`${findings.discoveredAt} desc`)
    .limit(5);

  const trialDaysLeft =
    sub?.status === 'trialing' && sub.currentPeriodEnd
      ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <main className="container-app py-10">
      <header className="mb-8 flex items-end justify-between gap-6">
        <div>
          <div className="label-eyebrow">Dashboard</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Halo, {tenant?.name}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan aktivitas pemantauan produk kamu di Shopee, Tokopedia, dan TikTok Shop.
          </p>
        </div>
        {trialDaysLeft !== null && (
          <div className="rounded-md border border-warn/40 bg-warn/10 px-4 py-2 text-xs text-warn">
            <span className="font-semibold">Trial:</span> {trialDaysLeft} hari tersisa ·{' '}
            <Link href="/dashboard/settings#billing" className="underline">
              Aktifkan langganan
            </Link>
          </div>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="label-eyebrow">Produk dipantau</div>
            <div className="mt-2 text-3xl font-semibold">{productCount}</div>
            {productCount === 0 && (
              <Link href="/dashboard/products" className="mt-1 inline-block text-xs text-primary hover:underline">
                Tambahkan produk pertama →
              </Link>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="label-eyebrow">Temuan total</div>
            <div className="mt-2 text-3xl font-semibold">{findingsTotalRow.count}</div>
            <div className="mt-1 text-xs text-muted-foreground">sejak akun dibuat</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="label-eyebrow">Temuan 7 hari</div>
            <div className="mt-2 text-3xl font-semibold">{findingsWeekRow.count}</div>
            <div className="mt-1 text-xs text-muted-foreground">temuan baru minggu ini</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="label-eyebrow">Scan dijalankan</div>
            <div className="mt-2 text-3xl font-semibold">{scansRows[0].count}</div>
            <div className="mt-1 text-xs text-muted-foreground">total scan otomatis</div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Temuan terbaru</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/findings">Lihat semua →</Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <div className="mb-2 text-4xl">🪼</div>
              <h3 className="font-semibold">Belum ada temuan.</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                {productCount === 0
                  ? 'Tambahkan produk pertama kamu — scan otomatis akan mulai berjalan setelah itu.'
                  : 'Sistem sedang memantau. Temuan akan muncul di sini begitu Scanner menemukan listing yang mencurigakan.'}
              </p>
              <Button asChild className="mt-4">
                <Link href={productCount === 0 ? '/dashboard/products' : '/dashboard/findings'}>
                  {productCount === 0 ? 'Tambah produk' : 'Buka halaman Temuan'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {recent.map((f) => (
                  <li key={f.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                    <span className="label-eyebrow w-20 shrink-0">{f.platform}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-foreground">{f.listingTitle ?? f.listingUrl}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {f.sellerName ?? '—'} · {f.priceIdr ? formatIdr(f.priceIdr) : '—'} ·{' '}
                        {fmtDate(f.discoveredAt)}
                      </div>
                    </div>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tenants, subscriptions, notificationPrefs, scans } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatIdr } from '@/lib/utils';
import { RunScanButton } from '@/components/app/run-scan-button';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
  const [prefs] = await db.select().from(notificationPrefs).where(eq(notificationPrefs.tenantId, tenantId)).limit(1);
  const recentScans = await db
    .select()
    .from(scans)
    .where(eq(scans.tenantId, tenantId))
    .orderBy(sql`${scans.startedAt} desc`)
    .limit(12);

  return (
    <main className="container-app py-10">
      <header className="mb-6">
        <div className="label-eyebrow">Settings</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Pengaturan akun</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="label-eyebrow">Brand</div>
            <div>
              <div className="text-sm text-muted-foreground">Nama</div>
              <div className="font-medium">{tenant?.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Slug</div>
              <div className="font-mono text-xs text-muted-foreground">{tenant?.slug}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pemilik akun</div>
              <div className="text-sm">
                {session?.user.name} · {session?.user.email}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="billing">
          <CardContent className="space-y-3 p-6">
            <div className="label-eyebrow">Billing</div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{sub?.status ?? '—'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tarif</div>
              <div className="font-medium">{formatIdr(sub?.amountIdr ?? 100000)} / bulan</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Periode aktif sampai</div>
              <div className="font-medium">
                {sub?.currentPeriodEnd
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
            <div className="pt-2">
              <Button disabled variant="outline" className="w-full">
                Aktivasi lewat DOKU (Fase berikutnya)
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Integrasi DOKU MCP untuk Checkout + QRIS recurring akan aktif setelah kredensial DOKU dipasang di env.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="label-eyebrow">Notifikasi Telegram</div>
            <div>
              <div className="text-sm text-muted-foreground">Chat ID</div>
              <div className="font-mono text-xs">{prefs?.telegramChatId ?? 'Belum terhubung'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-sm">
                {prefs?.telegramVerified ? 'Terverifikasi' : 'Belum terverifikasi'}
              </div>
            </div>
            <Button disabled variant="outline" className="w-full">
              Hubungkan Telegram (Fase berikutnya)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="label-eyebrow">Scan manual</div>
            <p className="text-sm text-muted-foreground">
              Jadwal otomatis berjalan tiap 6 jam (di Vercel Cron). Tombol di bawah memicu scan ekstra sekarang.
            </p>
            <RunScanButton />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="label-eyebrow">Keamanan</div>
            <p className="text-sm text-muted-foreground">
              Ganti password / hapus akun akan menyusul. Untuk sekarang, jika ada masalah hubungi tim ClearMark.
            </p>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" className="w-full">
                Keluar dari akun ini
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Riwayat scan (12 terbaru)</h2>
        {recentScans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Belum ada scan dijalankan. Klik &ldquo;Jalankan scan sekarang&rdquo; di kartu Scan manual untuk memulai.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Mulai</th>
                    <th className="px-5 py-3 font-medium">Platform</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Temuan</th>
                    <th className="px-5 py-3 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {s.startedAt
                          ? new Date(s.startedAt).toLocaleString('id-ID', { hour12: false })
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                        {s.platform}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            s.status === 'completed'
                              ? 'rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-[11px] text-ok'
                              : s.status === 'blocked'
                                ? 'rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] text-warn'
                                : s.status === 'failed'
                                  ? 'rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive'
                                  : 'rounded-full border border-border bg-subtle px-2 py-0.5 text-[11px] text-muted-foreground'
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{s.candidatesFound}</td>
                      <td className="px-5 py-3 truncate text-xs text-muted-foreground">
                        {s.error ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

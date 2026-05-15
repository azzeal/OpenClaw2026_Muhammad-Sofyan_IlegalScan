import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tenants, subscriptions, notificationPrefs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatIdr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
  const [prefs] = await db.select().from(notificationPrefs).where(eq(notificationPrefs.tenantId, tenantId)).limit(1);

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
    </main>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatIdr } from '@/lib/utils';

const INCLUDED = [
  'Pantau jumlah produk tidak dibatasi',
  'Scan otomatis Shopee, Tokopedia, TikTok Shop',
  'Laporan harian dengan foto + link + harga',
  'Notifikasi Telegram untuk temuan baru',
  'Filter & search seluruh riwayat temuan',
  'Tren mingguan per platform',
  'Ekspor laporan untuk tim hukum',
  '14 hari trial gratis tanpa kartu kredit',
];

export default function PricingPage() {
  return (
    <section className="container-narrow py-20">
      <div className="text-center">
        <div className="label-eyebrow mb-2">Pricing</div>
        <h1 className="text-4xl font-semibold tracking-tight">Satu tier. Satu harga.</h1>
        <p className="mt-3 text-muted-foreground">
          Tidak ada tier &ldquo;Enterprise&rdquo; misterius. Tidak ada upcharge per produk.
        </p>
      </div>

      <Card className="mx-auto mt-12 max-w-xl border-2 border-primary/40 shadow-md">
        <CardContent className="p-8">
          <div className="flex items-baseline gap-2">
            <span className="label-eyebrow text-accent-foreground">Standard</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight">{formatIdr(100000)}</span>
            <span className="text-muted-foreground">/ bulan</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Trial 14 hari gratis. Cancel kapan saja, tidak ada kontrak tahunan.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link href="/register">Mulai trial 14 hari</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pembayaran via DOKU — QRIS, Virtual Account, OVO, DANA, GoPay, kartu kredit
          </p>
        </CardContent>
      </Card>

      <div className="mx-auto mt-10 max-w-xl space-y-4 text-sm text-muted-foreground">
        <details className="rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer font-medium text-foreground">
            Kenapa cuma satu tier?
          </summary>
          <p className="mt-2">
            Karena setiap brand butuh hal yang sama: scan otomatis, laporan jujur, notifikasi cepat.
            Tier yang berbeda biasanya cuma cara naikin harga untuk fitur yang harusnya basic.
          </p>
        </details>
        <details className="rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer font-medium text-foreground">Bisa cancel kapan saja?</summary>
          <p className="mt-2">
            Bisa. Cancel dari Settings, akun tetap aktif sampai akhir periode billing berjalan.
          </p>
        </details>
        <details className="rounded-lg border border-border bg-card p-4">
          <summary className="cursor-pointer font-medium text-foreground">
            Bisa dapat invoice pajak?
          </summary>
          <p className="mt-2">Bisa. DOKU mengeluarkan invoice resmi untuk setiap pembayaran.</p>
        </details>
      </div>
    </section>
  );
}

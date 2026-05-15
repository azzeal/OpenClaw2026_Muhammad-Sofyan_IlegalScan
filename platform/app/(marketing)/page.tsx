import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    eyebrow: '01 — Daftar produk',
    title: 'Setup sekali, lupakan',
    body: 'Input nama brand + nama produk + kata kunci yang biasa dipakai pemalsu. Foto kemasan referensi opsional. Sistem mengingat dan menggunakan itu untuk setiap scan ke depan.',
  },
  {
    eyebrow: '02 — Scan otomatis',
    title: 'Shopee · Tokopedia · TikTok Shop',
    body: 'Crawler ClearMark menyisir tiga marketplace terbesar Indonesia secara terjadwal. Tidak ada intervensi manual, tidak ada tim yang harus disewa.',
  },
  {
    eyebrow: '03 — Laporan jelas',
    title: 'Bukti siap dipakai',
    body: 'Setiap temuan disertai foto, link toko, nama penjual, harga, dan tingkat kemiripan. Ekspor ke PDF, atau forward langsung ke tim hukum kamu.',
  },
  {
    eyebrow: '04 — Notifikasi real-time',
    title: 'Telegram saat ada yang serius',
    body: 'Begitu ada temuan dengan confidence tinggi, bot ClearMark ping kamu di Telegram. Selesai dalam hitungan menit, bukan minggu.',
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="container-app py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="label-eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Pantau merek kamu di marketplace
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Tim monitoring tiruan, <span className="text-primary">otomatis 24/7</span>.
          </h1>
          <p className="mt-6 text-balance text-lg text-muted-foreground">
            ClearMark memindai Shopee, Tokopedia, dan TikTok Shop untuk listing palsu brand kamu —
            lalu mengirim laporan bukti siap pakai. Tidak perlu tim sendiri. Tidak perlu kontrak
            tahunan. Mulai dari Rp 100.000/bulan.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Mulai gratis →</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">Lihat pricing</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            14 hari trial gratis. Tidak butuh kartu kredit untuk daftar.
          </p>
        </div>
      </section>

      <section id="how" className="border-y border-border bg-subtle py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <div className="label-eyebrow mb-2">Cara kerja</div>
            <h2 className="text-3xl font-semibold tracking-tight">Empat langkah dari daftar ke laporan</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.eyebrow}>
                <CardContent className="space-y-2 p-6">
                  <div className="label-eyebrow">{f.eyebrow}</div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="label-eyebrow mb-2">Berbasis data BPOM</div>
            <h3 className="text-xl font-semibold">Pattern detection dari sumber resmi</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pola modus pemalsuan (penyamaran nama, dosis tidak masuk akal, penjual non-PSEF) diambil
              dari siaran pers BPOM dan diupdate berkala oleh tim Analyst.
            </p>
          </div>
          <div>
            <div className="label-eyebrow mb-2">Tiga marketplace</div>
            <h3 className="text-xl font-semibold">Cakupan e-commerce Indonesia</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Shopee, Tokopedia, dan TikTok Shop dalam satu dashboard. Cakupan baru ditambah tanpa
              biaya tambahan untuk pelanggan existing.
            </p>
          </div>
          <div>
            <div className="label-eyebrow mb-2">Transparan</div>
            <h3 className="text-xl font-semibold">Setiap laporan punya bukti</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Foto, link, harga, screenshot — semua tersimpan dan bisa diekspor. Tim hukum kamu bisa
              langsung pakai untuk request takedown.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-subtle py-16">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Siap mulai?</h2>
          <p className="mt-2 text-muted-foreground">
            Daftar sekarang, input produk pertama dalam 5 menit, scan otomatis berjalan malam ini.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Daftar gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

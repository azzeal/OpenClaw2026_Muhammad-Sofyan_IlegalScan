import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function TrendsPage() {
  return (
    <main className="container-app py-10">
      <header className="mb-6">
        <div className="label-eyebrow">Trends</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tren temuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Grafik mingguan per platform dengan filter waktu. Ship pada update berikutnya (butuh data scan riil dulu).
        </p>
      </header>
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mb-2 text-4xl">📈</div>
          <h3 className="font-semibold">Belum ada data untuk grafik.</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Chart tren membutuhkan minimal 1 minggu data scan untuk menampilkan trend line yang berarti. Setelah Scanner berjalan otomatis untuk akun kamu, halaman ini akan terisi.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

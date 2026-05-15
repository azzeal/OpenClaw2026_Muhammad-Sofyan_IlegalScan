import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const items = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId))
    .orderBy(sql`${products.createdAt} desc`);

  return (
    <main className="container-app py-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="label-eyebrow">Products</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Produk yang kamu pantau</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan setiap SKU yang ingin di-monitor. Scanner akan otomatis pakai daftar ini.
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding?add=1">Tambah produk</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mb-2 text-4xl">📦</div>
            <h3 className="font-semibold">Belum ada produk terdaftar.</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Mulai dengan menambahkan 1 produk — nama, brand, dan beberapa kata kunci yang biasa dipakai pemalsu.
            </p>
            <Button asChild className="mt-4">
              <Link href="/onboarding?add=1">Tambah produk pertama</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Produk</th>
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium">Keywords</th>
                  <th className="px-5 py-3 font-medium">NIE</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.brand ?? '—'}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {(p.keywords ?? []).slice(0, 4).map((k) => (
                          <span key={k} className="rounded border border-border bg-subtle px-1.5 py-0.5 text-[11px]">
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.nie ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          p.active
                            ? 'rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-[11px] text-ok'
                            : 'rounded-full border border-border bg-subtle px-2 py-0.5 text-[11px] text-muted-foreground'
                        }
                      >
                        {p.active ? 'aktif' : 'paused'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

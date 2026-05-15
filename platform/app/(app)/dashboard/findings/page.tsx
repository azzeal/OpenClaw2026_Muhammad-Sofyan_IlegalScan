import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { findings } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { formatIdr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function FindingsPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const items = await db
    .select()
    .from(findings)
    .where(eq(findings.tenantId, tenantId))
    .orderBy(sql`${findings.discoveredAt} desc`)
    .limit(200);

  return (
    <main className="container-app py-10">
      <header className="mb-6">
        <div className="label-eyebrow">Findings</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Temuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Listing yang ditandai sistem sebagai kandidat tiruan. Filter & search lengkap menyusul di update berikutnya.
        </p>
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="mb-2 text-4xl">🔍</div>
            <h3 className="font-semibold">Belum ada temuan.</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Begitu Scanner ClearMark menemukan listing yang cocok dengan produk kamu, akan muncul di sini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Listing</th>
                  <th className="px-5 py-3 font-medium">Seller</th>
                  <th className="px-5 py-3 font-medium">Harga</th>
                  <th className="px-5 py-3 font-medium">Similarity</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">{f.platform}</td>
                    <td className="px-5 py-3">
                      <a
                        href={f.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 text-foreground hover:text-primary hover:underline"
                      >
                        {f.listingTitle ?? f.listingUrl}
                      </a>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{f.sellerName ?? '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">{f.priceIdr ? formatIdr(f.priceIdr) : '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {f.similarityScore ? `${Math.round(Number(f.similarityScore) * 100)}%` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                        {f.status}
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

import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingForm } from './onboarding-form';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);

  return (
    <main className="container-narrow py-12">
      <div className="mb-8">
        <div className="label-eyebrow">Onboarding · langkah 1 dari 1</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Daftarkan produk pertama kamu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Brand <span className="font-medium text-foreground">{tenant?.name}</span> sudah terdaftar. Sekarang tambah
          satu produk untuk mulai dipantau. Bisa tambah lagi nanti.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <OnboardingForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Mau skip dulu?{' '}
        <Link href="/dashboard" className="hover:underline">
          Ke dashboard
        </Link>
        .
      </p>
    </main>
  );
}

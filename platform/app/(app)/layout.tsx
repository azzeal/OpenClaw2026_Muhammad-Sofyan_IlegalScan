import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AppSidebar } from '@/components/app/sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const tenantId = session.user.tenantId;
  if (!tenantId) redirect('/login');
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenant) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar tenantName={tenant.name} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

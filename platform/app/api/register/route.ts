import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, tenants, tenantMembers, subscriptions, notificationPrefs } from '@/lib/db/schema';
import { slugify } from '@/lib/utils';

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  brandName: z.string().trim().min(2).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON valid.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid. Cek email + panjang password minimal 8.' },
      { status: 400 },
    );
  }
  const { fullName, brandName, email, password } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);

  // Ensure unique slug
  let baseSlug = slugify(brandName) || 'brand';
  let slug = baseSlug;
  for (let n = 1; n < 50; n++) {
    const hit = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)).limit(1);
    if (hit.length === 0) break;
    slug = `${baseSlug}-${n}`;
  }

  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email, passwordHash, fullName })
      .returning({ id: users.id });
    const [tenant] = await tx
      .insert(tenants)
      .values({ name: brandName, slug, status: 'trialing', trialEndsAt: trialEnd })
      .returning({ id: tenants.id });
    await tx.insert(tenantMembers).values({ userId: user.id, tenantId: tenant.id, role: 'owner' });
    await tx.insert(subscriptions).values({
      tenantId: tenant.id,
      status: 'trialing',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
    });
    await tx.insert(notificationPrefs).values({ tenantId: tenant.id });
  });

  return NextResponse.json({ ok: true });
}

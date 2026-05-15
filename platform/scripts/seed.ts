import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { users, tenants, tenantMembers, products, subscriptions, notificationPrefs } from '../lib/db/schema';

const DEMO_EMAIL = 'demo@clearmark.local';
const DEMO_PASSWORD = 'demo12345';
const DEMO_BRAND = 'Demo Brand';
const DEMO_SLUG = 'demo-brand';

async function main() {
  console.log('Seeding Demo Brand …');

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing) {
    console.log(`  user ${DEMO_EMAIL} already exists, skipping.`);
    return;
  }

  const passwordHash = await hash(DEMO_PASSWORD, 10);
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email: DEMO_EMAIL, passwordHash, fullName: 'Demo Operator' })
      .returning({ id: users.id });
    const [tenant] = await tx
      .insert(tenants)
      .values({
        name: DEMO_BRAND,
        slug: DEMO_SLUG,
        legalName: 'PT Demo Brand Indonesia',
        industry: 'cosmetic',
        status: 'trialing',
        trialEndsAt: trialEnd,
      })
      .returning({ id: tenants.id });

    await tx.insert(tenantMembers).values({ userId: user.id, tenantId: tenant.id, role: 'owner' });
    await tx.insert(subscriptions).values({
      tenantId: tenant.id,
      status: 'trialing',
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
    });
    await tx.insert(notificationPrefs).values({ tenantId: tenant.id });

    await tx.insert(products).values([
      {
        tenantId: tenant.id,
        name: 'Demo Serum 30ml',
        brand: DEMO_BRAND,
        keywords: ['serum demo', 'glow', 'whitening', 'BPOM'],
      },
      {
        tenantId: tenant.id,
        name: 'Demo Moisturizer 50ml',
        brand: DEMO_BRAND,
        keywords: ['moisturizer demo', 'pelembab', 'hydrating'],
      },
      {
        tenantId: tenant.id,
        name: 'Demo Sunscreen SPF 50',
        brand: DEMO_BRAND,
        keywords: ['sunscreen demo', 'spf 50', 'pa+++'],
      },
    ]);
  });

  console.log(`  created tenant "${DEMO_BRAND}" + user ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}) + 3 products.`);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

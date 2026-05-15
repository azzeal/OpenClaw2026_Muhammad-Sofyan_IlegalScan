import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

const schema = z.object({
  name: z.string().trim().min(2).max(200),
  brand: z.string().trim().max(120).optional().or(z.literal('')).transform((v) => v || undefined),
  nie: z.string().trim().max(40).optional().or(z.literal('')).transform((v) => v || undefined),
  referenceImageUrl: z
    .string()
    .url()
    .max(500)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  keywords: z.array(z.string().trim().max(80)).max(40).optional().default([]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantId = session.user.tenantId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON valid.' }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid.', details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, brand, nie, referenceImageUrl, keywords } = parsed.data;

  const [row] = await db
    .insert(products)
    .values({
      tenantId,
      name,
      brand,
      nie,
      referenceImageUrl,
      keywords: keywords ?? [],
      active: true,
    })
    .returning({ id: products.id });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}

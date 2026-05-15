import { NextResponse } from 'next/server';
import { search } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const limit = Number(url.searchParams.get('limit') ?? 25);
  if (!q) return NextResponse.json({ q, hits: [] });
  try {
    const hits = search(q, limit);
    return NextResponse.json({ q, hits });
  } catch (err) {
    return NextResponse.json(
      { q, hits: [], error: (err as Error).message ?? 'search failed' },
      { status: 500 },
    );
  }
}

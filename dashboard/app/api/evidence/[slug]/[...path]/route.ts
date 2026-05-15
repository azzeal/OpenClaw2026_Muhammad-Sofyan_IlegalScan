import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { paths } from '@/lib/paths';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json',
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path: subPath } = await ctx.params;
  const evidenceRoot = path.join(paths.projects, slug, 'evidence');
  const joined = path.normalize(path.join(evidenceRoot, ...subPath));
  if (!joined.startsWith(evidenceRoot + path.sep) && joined !== evidenceRoot) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  if (!fs.existsSync(joined) || !fs.statSync(joined).isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }
  const ext = path.extname(joined).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';
  const data = fs.readFileSync(joined);
  return new NextResponse(data, {
    headers: {
      'content-type': mime,
      'cache-control': 'private, max-age=0, must-revalidate',
      'content-disposition': `inline; filename="${path.basename(joined)}"`,
    },
  });
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPattern } from '@/lib/clearmark';
import { Markdown } from '@/components/markdown';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#fb7185',
  high: '#fb7185',
  medium: '#fde047',
  low: '#8d97c2',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatternDetail({ params }: PageProps) {
  const { slug } = await params;
  const p = getPattern(slug);
  if (!p) notFound();
  const source = p.source as
    | { type?: string; title?: string; ref?: string; date?: string; file?: string }
    | undefined;

  return (
    <main className="px-8 py-8">
      <nav className="mb-4 font-mono text-[11px] text-ink-muted">
        <Link href="/memory" className="hover:text-ink">
          ← Memory
        </Link>
      </nav>

      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="label">Pattern · {p.category}</div>
          <h1 className="mt-1 font-mono text-2xl tracking-tight">{p.title}</h1>
          <div className="mt-1 font-mono text-[11px] text-ink-muted">{p.slug}</div>
        </div>
        <span
          className="label rounded-full border border-bg-line px-3 py-1"
          style={{ color: SEVERITY_COLOR[p.severity] ?? '#8d97c2' }}
        >
          {p.severity}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <article className="panel p-6">
          <Markdown>{p.body}</Markdown>
        </article>

        <aside className="space-y-4">
          <section className="panel p-5">
            <div className="label mb-2">Brands affected</div>
            <ul className="space-y-1 font-mono text-[12px] text-ink-dim">
              {(p.brands_affected ?? []).map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <div className="label mb-2">Platforms seen</div>
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {(p.platforms_seen ?? []).map((pl) => (
                <span
                  key={pl}
                  className="rounded border border-bg-line bg-bg-base px-1.5 py-0.5 text-ink-dim"
                >
                  {pl}
                </span>
              ))}
            </div>
          </section>

          {p.keywords && p.keywords.length > 0 && (
            <section className="panel p-5">
              <div className="label mb-2">Keywords</div>
              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                {p.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded border border-bg-line bg-bg-raised px-1.5 py-0.5 text-ink"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </section>
          )}

          {p.regex_hints && p.regex_hints.length > 0 && (
            <section className="panel p-5">
              <div className="label mb-2">Regex hints</div>
              <ul className="space-y-1 font-mono text-[11px] text-ink">
                {p.regex_hints.map((r, i) => (
                  <li key={i} className="break-all rounded bg-bg-base px-2 py-1">
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.detection_signals && p.detection_signals.length > 0 && (
            <section className="panel p-5">
              <div className="label mb-2">Detection signals</div>
              <ul className="space-y-1 font-mono text-[11px] text-ink-dim">
                {p.detection_signals.map((s, i) => (
                  <li key={i}>· {typeof s === 'string' ? s : JSON.stringify(s)}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel p-5">
            <div className="label mb-2">Confidence</div>
            <div className="font-mono text-sm text-ink">{p.confidence}</div>
            <div className="mt-1 font-mono text-[11px] text-ink-muted">
              learned by {p.learned_by ?? '—'} · {p.learned_at?.slice(0, 10)}
            </div>
          </section>

          {source && (
            <section className="panel p-5">
              <div className="label mb-2">Source</div>
              <div className="font-mono text-[12px] text-ink">{source.title ?? '—'}</div>
              <div className="font-mono text-[11px] text-ink-muted">
                {source.ref ?? ''} {source.date ? `· ${source.date}` : ''}
              </div>
              {source.file && (() => {
                const m = source.file.match(/^projects\/([^/]+)\/evidence\/(.+)$/);
                if (!m) return null;
                const href = `/api/evidence/${m[1]}/${m[2]
                  .split('/')
                  .map(encodeURIComponent)
                  .join('/')}`;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-accent-scanner underline decoration-accent-scanner/40 underline-offset-2"
                  >
                    open evidence
                  </a>
                );
              })()}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

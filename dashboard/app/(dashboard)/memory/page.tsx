import Link from 'next/link';
import { listJournal, listPatterns } from '@/lib/clearmark';
import { SearchBar } from '@/components/search-bar';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#fb7185',
  high: '#fb7185',
  medium: '#fde047',
  low: '#8d97c2',
};

export default function MemoryPage() {
  const patterns = listPatterns().sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
    return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
  });
  const journal = listJournal();

  return (
    <main className="px-8 py-8">
      <header className="mb-6">
        <div className="label">Memory</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">What the crew has learned</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          Long-term patterns of counterfeit modus + daily journal of decisions. Search runs against
          a SQLite FTS5 index of every pattern body, journal entry, and project meta.
        </p>
      </header>

      <div className="mb-6">
        <SearchBar placeholder="Search patterns, journal, projects…" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="label">Patterns</div>
            <div className="font-mono text-[11px] text-ink-muted">{patterns.length} total</div>
          </div>
          <ul className="space-y-2">
            {patterns.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/memory/patterns/${p.slug}`}
                  className="block rounded-xl border border-bg-line bg-bg-panel/60 p-4 transition-colors hover:border-accent-scanner/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-sm text-ink">{p.title}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-ink-muted">
                        {p.category} · {(p.brands_affected ?? []).join(', ') || 'all'}
                      </div>
                    </div>
                    <span
                      className="label"
                      style={{ color: SEVERITY_COLOR[p.severity] ?? '#8d97c2' }}
                    >
                      {p.severity}
                    </span>
                  </div>
                  {p.keywords && p.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 font-mono text-[10px]">
                      {p.keywords.slice(0, 4).map((k) => (
                        <span
                          key={k}
                          className="rounded border border-bg-line bg-bg-base px-1.5 py-0.5 text-ink-dim"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="label">Journal</div>
            <div className="font-mono text-[11px] text-ink-muted">{journal.length} days</div>
          </div>
          <ul className="space-y-2">
            {journal.map((j) => {
              const firstLine =
                j.body
                  .split('\n')
                  .map((s) => s.trim())
                  .filter((s) => s && !s.startsWith('#'))[0] ?? '';
              return (
                <li key={j.date}>
                  <Link
                    href={`/memory/journal/${j.date}`}
                    className="block rounded-xl border border-bg-line bg-bg-panel/60 p-4 transition-colors hover:border-accent-analyst/60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-sm text-ink">{j.date}</div>
                      <span className="label">{j.phase ?? ''}</span>
                    </div>
                    {firstLine && (
                      <p className="mt-1 line-clamp-2 font-mono text-[12px] text-ink-dim">
                        {firstLine}
                      </p>
                    )}
                    {j.authors && j.authors.length > 0 && (
                      <div className="mt-2 font-mono text-[10px] text-ink-muted">
                        by {j.authors.join(', ')}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
            {journal.length === 0 && (
              <li className="font-mono text-[12px] text-ink-faint">No journal entries yet.</li>
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

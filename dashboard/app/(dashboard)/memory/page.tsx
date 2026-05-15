import { listJournal, listPatterns } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

export default function MemoryPage() {
  const patterns = listPatterns();
  const journal = listJournal();
  return (
    <main className="px-8 py-8">
      <header className="mb-6">
        <div className="label">Memory</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">What the crew has learned</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          Searchable journal + long-term patterns ship in Fase 2. Headline counts already live.
        </p>
      </header>
      <section className="grid grid-cols-2 gap-4">
        <div className="panel p-5">
          <div className="label mb-2">Patterns</div>
          <div className="font-mono text-3xl tracking-tight text-ink">{patterns.length}</div>
          <ul className="mt-3 space-y-1 font-mono text-[12px] text-ink-dim">
            {patterns.map((p) => (
              <li key={p.slug}>
                <span className="text-ink">{p.title}</span>{' '}
                <span className="text-ink-faint">[{p.severity}]</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-5">
          <div className="label mb-2">Journal days</div>
          <div className="font-mono text-3xl tracking-tight text-ink">{journal.length}</div>
          <ul className="mt-3 space-y-1 font-mono text-[12px] text-ink-dim">
            {journal.map((j) => (
              <li key={j.date}>
                <span className="text-ink">{j.date}</span>{' '}
                <span className="text-ink-faint">{j.phase ?? ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

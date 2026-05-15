import { summarizeWorkspace } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

export default function Home() {
  const summary = summarizeWorkspace();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10">
        <div className="label mb-2">CLEARMARK · MISSION CONTROL</div>
        <h1 className="font-mono text-2xl tracking-tight">Fase 0 — foundation seeded.</h1>
        <p className="mt-2 text-sm text-ink-dim">
          Workspace bootstrapped. Data contract live. UI shell ships in Fase 1.
        </p>
      </header>

      <section className="panel p-6">
        <div className="label mb-4">Workspace summary</div>
        <dl className="grid grid-cols-2 gap-y-3 font-mono text-sm md:grid-cols-4">
          <div>
            <div className="label">Agents</div>
            <div className="text-ink">{summary.agents.length}</div>
          </div>
          <div>
            <div className="label">Projects</div>
            <div className="text-ink">{summary.projects.length}</div>
          </div>
          <div>
            <div className="label">Patterns</div>
            <div className="text-ink">{summary.patterns_count}</div>
          </div>
          <div>
            <div className="label">Journal days</div>
            <div className="text-ink">{summary.journal_days}</div>
          </div>
        </dl>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.agents.map((a) => (
          <div
            key={a.agent_id}
            className="panel-raised p-5"
            style={{ borderColor: a.accent_color + '55' }}
          >
            <div className="label" style={{ color: a.accent_color }}>
              {a.role}
            </div>
            <div className="mt-1 font-mono text-base">{a.display_name}</div>
            <div className="mt-3 text-xs text-ink-dim">{a.mission}</div>
            <div className="mt-4 flex items-center gap-2 font-mono text-[11px]">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: a.status === 'idle' ? '#5b6594' : a.accent_color }}
              />
              <span className="uppercase tracking-wider text-ink-muted">{a.status}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="panel mt-6 p-6">
        <div className="label mb-3">Active project</div>
        {summary.projects.map((p) => (
          <div key={p.slug} className="font-mono text-sm">
            <div className="text-ink">{p.client_name}</div>
            <div className="text-ink-dim">
              {p.products.length} produk · {(p.applied_patterns ?? []).length} pola aktif
            </div>
          </div>
        ))}
        {summary.projects.length === 0 && (
          <div className="font-mono text-sm text-ink-muted">Belum ada project.</div>
        )}
      </section>

      <footer className="mt-10 font-mono text-[11px] text-ink-muted">
        Workspace root: <span className="text-ink-dim">{summary.workspace_root}</span>
      </footer>
    </main>
  );
}

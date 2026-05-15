import { listProjects } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  const projects = listProjects();
  return (
    <main className="px-8 py-8">
      <header className="mb-6">
        <div className="label">Projects</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">Clients on watch</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          Detailed project view ships in Fase 2 (drilldown, findings table, report status, next
          step). For now, summary only.
        </p>
      </header>
      <section className="space-y-3">
        {projects.map((p) => (
          <div
            key={p.slug}
            className="panel flex items-center justify-between gap-4 px-5 py-4 font-mono text-sm"
          >
            <div>
              <div className="text-ink">{p.client_name}</div>
              <div className="text-[11px] text-ink-muted">
                {p.products.length} produk · {(p.applied_patterns ?? []).length} pola aktif · {p.status}
              </div>
            </div>
            <div className="text-right text-[11px] text-ink-muted">
              <div>{p.industry ?? '—'}</div>
              <div>{p.category ?? ''}</div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="font-mono text-sm text-ink-faint">Belum ada project.</div>
        )}
      </section>
    </main>
  );
}

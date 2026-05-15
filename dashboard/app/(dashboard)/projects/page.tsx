import Link from 'next/link';
import { listProjects, listFindings, listReports } from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  const projects = listProjects().map((p) => {
    const findings = listFindings(p.slug);
    const reports = listReports(p.slug);
    return { ...p, findings_count: findings.length, reports_count: reports.length };
  });
  return (
    <main className="px-8 py-8">
      <header className="mb-6">
        <div className="label">Projects</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">Clients on watch</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          One project per brand. Each project lists the products being monitored, the patterns
          applied to detect counterfeits, and the next step the crew should take.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="panel-raised group flex flex-col gap-4 p-5 transition-colors hover:border-accent-intake/60"
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <div className="label">{p.industry ?? '—'}</div>
                <div className="mt-1 font-mono text-lg tracking-tight text-ink">
                  {p.client_name}
                </div>
                {p.client_legal_name && (
                  <div className="font-mono text-[11px] text-ink-muted">{p.client_legal_name}</div>
                )}
              </div>
              <span className="label rounded-full border border-bg-line px-2 py-0.5 text-ink-dim">
                {p.status}
              </span>
            </header>

            <div className="grid grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <div className="label">Produk</div>
                <div className="text-ink">{p.products.length}</div>
              </div>
              <div>
                <div className="label">Pola</div>
                <div className="text-ink">{(p.applied_patterns ?? []).length}</div>
              </div>
              <div>
                <div className="label">Findings</div>
                <div className="text-ink">{p.findings_count}</div>
              </div>
              <div>
                <div className="label">Reports</div>
                <div className="text-ink">{p.reports_count}</div>
              </div>
            </div>

            {p.next_step && (
              <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
                <div className="label mb-1">Next step</div>
                <div className="font-mono text-[12px] text-ink">
                  <span className="text-ink-muted">{p.next_step.owner}</span> ·{' '}
                  <span style={{ color: '#f472b6' }}>{p.next_step.action}</span>
                </div>
                {p.next_step.note && (
                  <div className="mt-1 text-[11px] text-ink-dim">{p.next_step.note}</div>
                )}
              </div>
            )}
          </Link>
        ))}
      </section>

      {projects.length === 0 && (
        <div className="panel p-6 font-mono text-sm text-ink-muted">Belum ada project.</div>
      )}
    </main>
  );
}

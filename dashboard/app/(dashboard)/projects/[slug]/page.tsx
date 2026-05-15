import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getProject,
  listFindings,
  listReports,
  listEvidence,
  getPattern,
} from '@/lib/clearmark';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetail({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const findings = listFindings(slug);
  const reports = listReports(slug);
  const evidence = listEvidence(slug);
  const patterns = (project.applied_patterns ?? [])
    .map((s) => getPattern(s))
    .filter((p): p is NonNullable<ReturnType<typeof getPattern>> => !!p);

  const ctxStats = (project.context_stats?.bpom_takedowns_viagra_links ?? null) as
    | Record<string, number>
    | null;

  return (
    <main className="px-8 py-8">
      <nav className="mb-4 font-mono text-[11px] text-ink-muted">
        <Link href="/projects" className="hover:text-ink">
          ← Projects
        </Link>
      </nav>

      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="label">{project.industry ?? '—'} · {project.category ?? ''}</div>
          <h1 className="mt-1 font-mono text-3xl tracking-tight">{project.client_name}</h1>
          {project.client_legal_name && (
            <div className="font-mono text-sm text-ink-muted">{project.client_legal_name}</div>
          )}
          {project.manufacturer_of_record && (
            <div className="mt-1 font-mono text-[12px] text-ink-dim">
              Manufacturer of record:{' '}
              <span className="text-ink">{project.manufacturer_of_record}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="label rounded-full border border-bg-line px-3 py-1 text-ink">
            {project.status}
          </span>
          <div className="mt-2 font-mono text-[11px] text-ink-muted">created {project.created_at.slice(0, 10)}</div>
        </div>
      </header>

      {project.next_step && (
        <section className="panel mb-6 flex items-start justify-between gap-4 p-5">
          <div>
            <div className="label">Next step</div>
            <div className="mt-1 font-mono text-base text-ink">
              <span className="text-ink-muted">{project.next_step.owner}</span> →{' '}
              <span style={{ color: '#f472b6' }}>{project.next_step.action}</span>
            </div>
            {project.next_step.note && (
              <p className="mt-2 max-w-2xl text-sm text-ink-dim">{project.next_step.note}</p>
            )}
          </div>
          <div className="text-right font-mono text-[11px] text-ink-muted">
            {project.next_step.due ?? 'no due date'}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="panel p-5">
            <div className="label mb-3">Produk yang dipantau</div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[12px]">
                <thead>
                  <tr className="border-b border-bg-line text-ink-muted">
                    <th className="py-2 pr-3 text-left">Nama</th>
                    <th className="py-2 pr-3 text-left">Kandungan</th>
                    <th className="py-2 pr-3 text-left">Bentuk</th>
                    <th className="py-2 pr-3 text-left">NIE</th>
                  </tr>
                </thead>
                <tbody>
                  {project.products.map((p) => (
                    <tr key={p.id} className="border-b border-bg-line/60">
                      <td className="py-2 pr-3 text-ink">{p.name}</td>
                      <td className="py-2 pr-3 text-ink-dim">{p.active_ingredient ?? '—'}</td>
                      <td className="py-2 pr-3 text-ink-dim">{p.form ?? '—'}</td>
                      <td className="py-2 pr-3 text-ink">
                        <span className="rounded bg-bg-raised px-1.5 py-0.5">{p.nie ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="label">Findings</div>
              <div className="font-mono text-[11px] text-ink-muted">
                {findings.length} total
              </div>
            </div>
            {findings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-bg-line bg-bg-base/60 p-5 text-center">
                <div className="font-mono text-sm text-ink-dim">No findings yet.</div>
                <div className="mt-1 font-mono text-[11px] text-ink-faint">
                  Scanner has not produced any candidate listings for this project.
                </div>
              </div>
            ) : (
              <ul className="space-y-2 font-mono text-[12px]">
                {findings.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-start gap-3 rounded-lg border border-bg-line bg-bg-base/60 p-3"
                  >
                    <span className="label">{f.platform}</span>
                    <div className="flex-1">
                      <div className="text-ink">{f.title ?? f.listing_url ?? f.id}</div>
                      <div className="text-ink-dim">
                        {(f.matched_patterns ?? []).join(', ')}
                        {typeof f.confidence === 'number' && (
                          <> · confidence {Math.round(f.confidence * 100)}%</>
                        )}
                      </div>
                    </div>
                    <span className="label rounded-full border border-bg-line px-2 py-0.5">
                      {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="label">Reports filed</div>
              <div className="font-mono text-[11px] text-ink-muted">{reports.length} total</div>
            </div>
            {reports.length === 0 ? (
              <div className="font-mono text-[12px] text-ink-faint">
                Belum ada laporan dikirim ke klien.
              </div>
            ) : (
              <ul className="space-y-2 font-mono text-[12px]">
                {reports.map((r) => (
                  <li key={r.filename} className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
                    <div className="text-ink">{r.title}</div>
                    <div className="text-ink-muted">filed {r.filed_at.slice(0, 10)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="panel p-5">
            <div className="label mb-3">Applied patterns</div>
            <ul className="space-y-2">
              {patterns.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/memory/patterns/${p.slug}`}
                    className="block rounded-lg border border-bg-line bg-bg-base/60 p-3 transition-colors hover:border-accent-scanner/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[13px] text-ink">{p.title}</span>
                      <span
                        className="label"
                        style={{
                          color:
                            p.severity === 'critical' || p.severity === 'high'
                              ? '#fb7185'
                              : '#8d97c2',
                        }}
                      >
                        {p.severity}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-muted">
                      {p.category}
                    </div>
                  </Link>
                </li>
              ))}
              {patterns.length === 0 && (
                <li className="font-mono text-[11px] text-ink-faint">No applied patterns.</li>
              )}
            </ul>
          </section>

          <section className="panel p-5">
            <div className="label mb-3">Evidence files</div>
            {evidence.length === 0 ? (
              <div className="font-mono text-[11px] text-ink-faint">No evidence.</div>
            ) : (
              <ul className="space-y-2 font-mono text-[12px]">
                {evidence.map((e) => (
                  <li key={e.name}>
                    <a
                      href={`/api/evidence/${slug}/${encodeURIComponent(e.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-bg-line bg-bg-base/60 px-3 py-2 transition-colors hover:border-accent-scanner/60"
                    >
                      <span className="truncate text-ink">{e.name}</span>
                      <span className="text-ink-muted">{Math.round(e.size / 1024)} kB</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {ctxStats && (
            <section className="panel p-5">
              <div className="label mb-3">BPOM takedown context</div>
              <div className="font-mono text-[11px] text-ink-muted">
                Tautan Viagra ilegal yang ditakedown
              </div>
              <ul className="mt-2 space-y-1 font-mono text-[12px]">
                {Object.entries(ctxStats).map(([year, count]) => (
                  <li key={year} className="flex items-center justify-between">
                    <span className="text-ink-dim">{year.replace(/_/g, ' ')}</span>
                    <span className="text-ink">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.sources && project.sources.length > 0 && (
            <section className="panel p-5">
              <div className="label mb-3">Sources</div>
              <ul className="space-y-2 font-mono text-[12px]">
                {project.sources.map((s, i) => (
                  <li key={i} className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
                    <div className="text-ink">{(s.title as string) ?? '—'}</div>
                    <div className="text-ink-muted">
                      {(s.ref as string) ?? ''} {(s.date as string) ? `· ${s.date}` : ''}
                    </div>
                    {(s.url as string) && (
                      <a
                        href={s.url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-accent-scanner underline decoration-accent-scanner/40 underline-offset-2"
                      >
                        view on simpan.pom.go.id
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.legal_basis && project.legal_basis.length > 0 && (
            <section className="panel p-5">
              <div className="label mb-3">Legal basis</div>
              <ul className="space-y-1 font-mono text-[11px] text-ink-dim">
                {project.legal_basis.map((b, i) => (
                  <li key={i}>· {b}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

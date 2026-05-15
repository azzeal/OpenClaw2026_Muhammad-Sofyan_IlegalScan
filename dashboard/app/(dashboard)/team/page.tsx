import { listAgents } from '@/lib/clearmark';
import { StatusPill } from '@/components/status-pill';
import { RelativeTime } from '@/components/relative-time';

export const dynamic = 'force-dynamic';

export default function TeamPage() {
  const agents = listAgents();
  return (
    <main className="px-8 py-8">
      <header className="mb-6">
        <div className="label">Team</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">Three agents. Three roles.</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-dim">
          ClearMark replaces the brand-protection team that small cosmetic and pharma owners cannot
          afford to staff. These three are the team.
        </p>
      </header>

      <section className="space-y-4">
        {agents.map((a) => (
          <article
            key={a.agent_id}
            className="panel-raised flex flex-col gap-4 p-6 md:flex-row md:items-start"
            style={{ borderColor: a.accent_color + '55' }}
          >
            <div className="md:w-1/3">
              <div className="label" style={{ color: a.accent_color }}>
                {a.role}
              </div>
              <div className="mt-1 font-mono text-xl tracking-tight">{a.display_name}</div>
              <div className="mt-2">
                <StatusPill status={a.status} accent={a.accent_color} />
              </div>
              <div className="mt-3 font-mono text-[11px] text-ink-muted">
                heartbeat <RelativeTime iso={a.last_heartbeat} />
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-sm text-ink-dim">{a.mission}</p>
              <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
                <div className="label mb-1">Last action</div>
                <div className="font-mono text-[12px] text-ink-dim">{a.last_action}</div>
              </div>
              <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
                <div className="label mb-1">Today</div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px]">
                  {Object.entries(a.metrics_today).map(([k, v]) => (
                    <span key={k}>
                      <span className="text-ink">{v}</span>{' '}
                      <span className="text-ink-muted">{k.replace(/_/g, ' ')}</span>
                    </span>
                  ))}
                  {Object.keys(a.metrics_today).length === 0 && (
                    <span className="text-ink-faint">no activity yet</span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

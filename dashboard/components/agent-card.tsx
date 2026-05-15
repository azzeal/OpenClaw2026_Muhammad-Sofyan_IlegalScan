import type { AgentState, Task, LogEvent } from '@/lib/clearmark';
import { RelativeTime } from './relative-time';
import { StatusPill } from './status-pill';
import { LogTail } from './log-tail';

export interface AgentWire extends AgentState {
  active_task: Task | null;
  log_tail: LogEvent[];
}

export function AgentCard({ a }: { a: AgentWire }) {
  return (
    <article
      className="panel-raised flex flex-col gap-4 p-5"
      style={{ borderColor: a.accent_color + '55' }}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="label" style={{ color: a.accent_color }}>
            {a.role}
          </div>
          <div className="mt-0.5 font-mono text-lg tracking-tight text-ink">{a.display_name}</div>
        </div>
        <StatusPill status={a.status} accent={a.accent_color} />
      </header>

      <p className="text-xs leading-relaxed text-ink-dim">{a.mission}</p>

      <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
        <div className="label mb-1.5">Current task</div>
        {a.active_task ? (
          <div className="space-y-1 font-mono text-[12px]">
            <div className="text-ink">
              <span className="text-ink-muted">{a.active_task.task_id}</span>
              {a.active_task.type && (
                <>
                  {' · '}
                  <span style={{ color: a.accent_color }}>{a.active_task.type}</span>
                </>
              )}
            </div>
            {a.active_task.project_slug && (
              <div className="text-ink-dim">project: {a.active_task.project_slug}</div>
            )}
            {a.active_task.instructions && (
              <div className="text-ink-muted">{a.active_task.instructions}</div>
            )}
          </div>
        ) : (
          <div className="font-mono text-[12px] text-ink-faint">No active task.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
          <div className="label mb-1">Heartbeat</div>
          <div className="font-mono text-xs text-ink-dim">
            <RelativeTime iso={a.last_heartbeat} />
          </div>
        </div>
        <div className="rounded-lg border border-bg-line bg-bg-base/60 p-3">
          <div className="label mb-1">Today</div>
          <div className="flex gap-3 font-mono text-xs text-ink-dim">
            {Object.entries(a.metrics_today).map(([k, v]) => (
              <span key={k}>
                <span className="text-ink">{v}</span>{' '}
                <span className="text-ink-faint">{k.replace(/_/g, ' ')}</span>
              </span>
            ))}
            {Object.keys(a.metrics_today).length === 0 && (
              <span className="text-ink-faint">no activity</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="label mb-1.5">Last action</div>
        <div className="text-[12px] leading-relaxed text-ink-dim">{a.last_action}</div>
      </div>

      <div>
        <div className="label mb-2">Event log</div>
        <LogTail events={a.log_tail} accent={a.accent_color} />
      </div>
    </article>
  );
}

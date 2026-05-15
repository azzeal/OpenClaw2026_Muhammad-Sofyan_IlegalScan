import type { LogEvent } from '@/lib/clearmark';
import { RelativeTime } from './relative-time';

export function LogTail({ events, accent }: { events: LogEvent[]; accent: string }) {
  if (events.length === 0) {
    return (
      <div className="font-mono text-[11px] text-ink-faint">
        No log events yet. (Agent hasn&apos;t run.)
      </div>
    );
  }
  return (
    <ol className="space-y-1.5 font-mono text-[11px]">
      {events.map((e, i) => (
        <li key={`${e.ts}-${i}`} className="flex items-start gap-2">
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
          <span className="text-ink-muted">
            <RelativeTime iso={e.ts} />
          </span>
          <span className="text-ink-dim">·</span>
          <span className="text-ink">{e.event}</span>
          {Object.entries(e)
            .filter(([k]) => k !== 'ts' && k !== 'event')
            .slice(0, 2)
            .map(([k, v]) => (
              <span key={k} className="text-ink-muted">
                <span className="text-ink-faint">{k}=</span>
                {typeof v === 'string' ? v : JSON.stringify(v)}
              </span>
            ))}
        </li>
      ))}
    </ol>
  );
}

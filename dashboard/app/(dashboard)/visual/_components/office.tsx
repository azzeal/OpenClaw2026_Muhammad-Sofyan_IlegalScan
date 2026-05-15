'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AgentWire } from '@/components/agent-card';
import { RelativeTime } from '@/components/relative-time';
import { Room } from './room';
import styles from './office.module.css';

interface ApiResponse {
  agents: AgentWire[];
  server_time: string;
}

const POLL_MS = 3000;
// Brief: Agent 2 (Intake/coordinator) in the center; Scanner left, Analyst right.
const ORDER = ['scanner', 'intake', 'analyst'] as const;

export function Office({ initial }: { initial: ApiResponse }) {
  const [data, setData] = useState<ApiResponse>(initial);
  const [pulse, setPulse] = useState(false);
  const lastSig = useRef(JSON.stringify(initial.agents));

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch('/api/agents', { cache: 'no-store' });
        const json = (await res.json()) as ApiResponse;
        if (!alive) return;
        const sig = JSON.stringify(json.agents);
        if (sig !== lastSig.current) {
          lastSig.current = sig;
          setPulse(true);
          setTimeout(() => setPulse(false), 600);
        }
        setData(json);
      } catch {}
      if (alive) timer = setTimeout(tick, POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const byId = useMemo(() => {
    const m = new Map<string, AgentWire>();
    for (const a of data.agents) m.set(a.agent_id, a);
    return m;
  }, [data.agents]);

  const ticker = useMemo(() => {
    const events = data.agents.flatMap((a) =>
      a.log_tail.map((e) => ({
        ...e,
        agent_id: a.agent_id,
        accent: a.accent_color,
      })),
    );
    events.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    return events.slice(0, 10);
  }, [data.agents]);

  const busyCount = data.agents.filter((a) => a.status === 'busy').length;

  return (
    <main className="px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="label">Visual Office · live</div>
          <h1 className="mt-1 font-mono text-2xl tracking-tight">The crew at work.</h1>
          <p className="mt-1 text-sm text-ink-dim">
            {busyCount === 0
              ? 'Three agents at their desks. All idle right now — Zzz floats over each as a pixel-art sleep glyph. Animation switches the moment a state.json on disk flips to busy.'
              : `${busyCount} of ${data.agents.length} agents busy.`}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-muted">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full transition-all ${
              pulse ? 'scale-150 bg-accent-ok shadow-[0_0_8px_2px_#4ade8088]' : 'bg-bg-line'
            }`}
          />
          updated <RelativeTime iso={data.server_time} />
        </div>
      </header>

      <section className={`${styles.canvas} relative rounded-2xl border border-bg-line bg-bg-base/60 p-6`}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ORDER.map((id) => {
            const a = byId.get(id);
            if (!a) return null;
            return <Room key={id} agent={a} />;
          })}
        </div>
      </section>

      <section className="panel mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="label">Event ticker</div>
          <div className="font-mono text-[11px] text-ink-muted">latest first · 10 max</div>
        </div>
        {ticker.length === 0 ? (
          <div className="font-mono text-[12px] text-ink-faint">
            No events yet. When OpenClaw runs an agent, its log lines appear here in real time.
          </div>
        ) : (
          <ol className="space-y-1 font-mono text-[12px]">
            {ticker.map((e, i) => (
              <li
                key={`${e.ts}-${i}`}
                className={`${styles.tickerRow} flex items-start gap-3`}
                style={{ animationDelay: `${Math.min(i * 30, 200)}ms` }}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: e.accent, boxShadow: `0 0 6px ${e.accent}88` }}
                />
                <span className="w-20 shrink-0 text-ink-muted">
                  <RelativeTime iso={e.ts} />
                </span>
                <span className="w-20 shrink-0 uppercase tracking-wider" style={{ color: e.accent }}>
                  {e.agent_id}
                </span>
                <span className="text-ink">{e.event}</span>
                {Object.entries(e)
                  .filter(([k]) => !['ts', 'event', 'agent_id', 'accent'].includes(k))
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <span key={k} className="text-ink-muted">
                      <span className="text-ink-faint">{k}=</span>
                      {typeof v === 'string' ? v : JSON.stringify(v)}
                    </span>
                  ))}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

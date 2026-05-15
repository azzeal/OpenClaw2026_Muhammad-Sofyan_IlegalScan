'use client';

import { useEffect, useRef, useState } from 'react';
import { AgentCard, type AgentWire } from '@/components/agent-card';
import { RelativeTime } from '@/components/relative-time';

interface ApiResponse {
  agents: AgentWire[];
  server_time: string;
}

const POLL_MS = 3000;

export function TasksBoard({ initial }: { initial: ApiResponse }) {
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

  const busyCount = data.agents.filter((a) => a.status === 'busy').length;

  return (
    <main className="px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="label">Tasks · proof of life</div>
          <h1 className="mt-1 font-mono text-2xl tracking-tight">What the crew is doing now</h1>
          <p className="mt-1 text-sm text-ink-dim">
            {busyCount === 0
              ? 'All three agents idle. The dashboard reflects filesystem state in real time — kick off a task in clearmark/agents/*/state.json and this page will update within 3s.'
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

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.agents.map((a) => (
          <AgentCard key={a.agent_id} a={a} />
        ))}
      </section>
    </main>
  );
}

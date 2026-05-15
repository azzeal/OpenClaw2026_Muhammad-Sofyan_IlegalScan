'use client';

import { useEffect, useState } from 'react';

function format(diffMs: number): string {
  const abs = Math.abs(diffMs);
  const s = Math.round(abs / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return <span>—</span>;
  return (
    <time dateTime={iso} title={iso} suppressHydrationWarning>
      {format(now - t)}
    </time>
  );
}

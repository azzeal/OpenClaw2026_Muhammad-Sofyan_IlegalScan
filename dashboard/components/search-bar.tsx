'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Hit {
  source: 'pattern' | 'journal' | 'project';
  slug: string;
  title: string;
  snippet: string;
}

function hrefFor(hit: Hit): string {
  if (hit.source === 'pattern') return `/memory/patterns/${hit.slug}`;
  if (hit.source === 'journal') return `/memory/journal/${hit.slug}`;
  return `/projects/${hit.slug}`;
}

export function SearchBar({ placeholder = 'Search memory & projects…' }: { placeholder?: string }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const json = (await res.json()) as { hits: Hit[] };
        setHits(json.hits ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [q]);

  return (
    <div className="relative">
      <div className="panel flex items-center gap-3 px-4 py-3">
        <span className="label">⌕</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 bg-transparent font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        {loading && <span className="font-mono text-[11px] text-ink-muted">…</span>}
        {q && !loading && (
          <span className="font-mono text-[11px] text-ink-muted">{hits.length} hits</span>
        )}
      </div>
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-96 overflow-y-auto rounded-xl border border-bg-line bg-bg-panel/95 backdrop-blur shadow-2xl">
          {hits.length === 0 && !loading && (
            <div className="px-4 py-3 font-mono text-[12px] text-ink-faint">No matches.</div>
          )}
          {hits.map((h, i) => (
            <Link
              key={`${h.source}-${h.slug}-${i}`}
              href={hrefFor(h)}
              className="block border-b border-bg-line/60 px-4 py-3 hover:bg-bg-raised/60"
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm text-ink">{h.title}</div>
                <span
                  className="label"
                  style={{
                    color:
                      h.source === 'pattern'
                        ? '#22d3ee'
                        : h.source === 'journal'
                        ? '#fde047'
                        : '#f472b6',
                  }}
                >
                  {h.source}
                </span>
              </div>
              <div
                className="mt-1 font-mono text-[11px] text-ink-dim"
                dangerouslySetInnerHTML={{ __html: h.snippet }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

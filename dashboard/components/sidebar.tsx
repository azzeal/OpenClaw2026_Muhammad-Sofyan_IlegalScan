'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/tasks', label: 'Tasks', shortcut: 'T', enabled: true },
  { href: '/projects', label: 'Projects', shortcut: 'P', enabled: false },
  { href: '/memory', label: 'Memory', shortcut: 'M', enabled: false },
  { href: '/team', label: 'Team', shortcut: 'E', enabled: true },
  { href: '/visual', label: 'Visual Office', shortcut: 'V', enabled: false },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-bg-line bg-bg-panel/60 backdrop-blur">
      <div className="border-b border-bg-line px-5 py-5">
        <div className="label text-accent-scanner">MISSION CONTROL</div>
        <div className="mt-1 font-mono text-sm tracking-tight text-ink">ClearMark</div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between rounded-md px-3 py-2 font-mono text-sm text-ink-faint"
              >
                <span>{item.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-ink-faint">soon</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-md px-3 py-2 font-mono text-sm transition-colors',
                active
                  ? 'bg-bg-raised text-ink shadow-neon-cyan'
                  : 'text-ink-dim hover:bg-bg-raised/60 hover:text-ink',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full',
                    active ? 'bg-accent-scanner' : 'bg-bg-line',
                  )}
                />
                {item.label}
              </span>
              <span className="kbd opacity-0 group-hover:opacity-100">{item.shortcut}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-bg-line px-5 py-4">
        <div className="label">Agent crew</div>
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-ink-dim">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#22d3ee' }} />
            Scanner
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#f472b6' }} />
            Intake
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#fde047' }} />
            Analyst
          </li>
        </ul>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '◐' },
  { href: '/dashboard/products', label: 'Produk', icon: '▣' },
  { href: '/dashboard/findings', label: 'Temuan', icon: '◇' },
  { href: '/dashboard/trends', label: 'Tren', icon: '⇡' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export function AppSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-subtle">
      <div className="border-b border-border px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          ClearMark
        </Link>
        <div className="mt-3 text-xs">
          <div className="label-eyebrow">Brand</div>
          <div className="mt-0.5 truncate font-medium text-foreground">{tenantName}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground',
              )}
            >
              <span className={cn('text-base', active ? 'text-primary' : 'text-muted-foreground')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-3 py-3">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-background hover:text-foreground"
          >
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

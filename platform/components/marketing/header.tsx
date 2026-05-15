import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export async function MarketingHeader() {
  const session = await auth();
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          ClearMark
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/pricing" className="rounded-md px-3 py-2 text-foreground hover:bg-subtle">
            Pricing
          </Link>
          <Link href="/#how" className="rounded-md px-3 py-2 text-foreground hover:bg-subtle">
            Cara kerja
          </Link>
          {session ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard →</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Mulai gratis</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

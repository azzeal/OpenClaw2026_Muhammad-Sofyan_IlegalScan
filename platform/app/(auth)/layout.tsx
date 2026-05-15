import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-subtle">
      <div className="container-narrow flex min-h-screen flex-col items-center justify-center py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          ClearMark
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

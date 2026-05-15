import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJournalDay } from '@/lib/clearmark';
import { Markdown } from '@/components/markdown';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function JournalDay({ params }: PageProps) {
  const { date } = await params;
  const entry = getJournalDay(date);
  if (!entry) notFound();
  return (
    <main className="mx-auto max-w-3xl px-8 py-8">
      <nav className="mb-4 font-mono text-[11px] text-ink-muted">
        <Link href="/memory" className="hover:text-ink">
          ← Memory
        </Link>
      </nav>
      <header className="mb-6 border-b border-bg-line pb-4">
        <div className="label">Journal · {entry.phase ?? ''}</div>
        <h1 className="mt-1 font-mono text-2xl tracking-tight">{entry.date}</h1>
        {entry.authors && entry.authors.length > 0 && (
          <div className="mt-1 font-mono text-[11px] text-ink-muted">
            by {entry.authors.join(', ')}
          </div>
        )}
      </header>
      <article className="panel p-6">
        <Markdown>{entry.body}</Markdown>
      </article>
    </main>
  );
}

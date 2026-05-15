import { cn } from '@/lib/utils';

interface Props {
  status: 'idle' | 'busy' | 'blocked' | string;
  accent: string;
}

export function StatusPill({ status, accent }: Props) {
  const dotColor =
    status === 'busy' ? accent : status === 'blocked' ? '#fb7185' : 'transparent';
  const ring = status === 'busy' ? `0 0 0 4px ${accent}22` : 'none';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]',
        status === 'busy'
          ? 'border-bg-line text-ink'
          : status === 'blocked'
          ? 'border-rose-500/40 text-rose-300'
          : 'border-bg-line text-ink-muted',
      )}
      style={{ boxShadow: ring }}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', status === 'busy' && 'animate-pulse')}
        style={{ background: dotColor, outline: status === 'idle' ? '1px solid #5b6594' : 'none' }}
      />
      {status}
    </span>
  );
}

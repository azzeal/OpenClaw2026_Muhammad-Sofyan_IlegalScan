import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose-mc max-w-none font-sans text-[14px] leading-relaxed text-ink-dim',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-6 mb-3 font-mono text-xl tracking-tight text-ink" {...p} />,
          h2: (p) => <h2 className="mt-6 mb-2 font-mono text-base tracking-tight text-ink" {...p} />,
          h3: (p) => (
            <h3 className="mt-5 mb-2 font-mono text-sm uppercase tracking-[0.18em] text-ink" {...p} />
          ),
          p: (p) => <p className="my-3 text-ink-dim" {...p} />,
          a: ({ href, ...rest }) => (
            <a
              href={href}
              className="text-accent-scanner underline decoration-accent-scanner/40 underline-offset-2 hover:decoration-accent-scanner"
              {...rest}
            />
          ),
          ul: (p) => <ul className="my-3 list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-5" {...p} />,
          li: (p) => <li className="text-ink-dim" {...p} />,
          code: ({ children, className, ...rest }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code
                  className="block overflow-x-auto rounded-md border border-bg-line bg-bg-base/80 p-3 font-mono text-[12px] text-ink"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded bg-bg-raised px-1.5 py-0.5 font-mono text-[12px] text-ink"
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre: (p) => <pre className="my-4 overflow-x-auto" {...p} />,
          table: (p) => (
            <div className="my-4 overflow-x-auto rounded-md border border-bg-line">
              <table className="w-full text-left font-mono text-[12px]" {...p} />
            </div>
          ),
          th: (p) => (
            <th
              className="border-b border-bg-line bg-bg-raised px-3 py-2 text-ink"
              {...p}
            />
          ),
          td: (p) => <td className="border-b border-bg-line/60 px-3 py-2 text-ink-dim" {...p} />,
          blockquote: (p) => (
            <blockquote
              className="my-3 border-l-2 border-accent-scanner/60 pl-3 italic text-ink"
              {...p}
            />
          ),
          hr: () => <hr className="my-6 border-bg-line" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

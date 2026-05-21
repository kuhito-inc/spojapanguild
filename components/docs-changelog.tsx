import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * 更新履歴をカード形式で表示するためのコンポーネント群。
 * `<Changelog>` で囲み、リリースごとに `<Release>` を新しい順に並べる。
 */
export function Changelog({ children }: { children: ReactNode }) {
  return <div className="sjg-changelog my-8 flex flex-col gap-5">{children}</div>;
}

export function Release({
  version,
  date,
  latest = false,
  children,
}: {
  version: string;
  date: string;
  latest?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={twMerge(
        'sjg-release overflow-hidden rounded-xl border bg-fd-card',
        latest ? 'border-fd-primary/40 shadow-sm' : 'border-fd-border',
      )}
    >
      <header
        className={twMerge(
          'flex flex-wrap items-center gap-2 border-b px-4 py-3',
          latest ? 'border-fd-primary/20 bg-fd-primary/5' : 'border-fd-border bg-fd-muted/60',
        )}
      >
        <span
          className={twMerge(
            'inline-flex items-center rounded-md px-2 py-0.5 text-sm font-bold tracking-tight',
            latest ? 'bg-fd-primary text-fd-primary-foreground' : 'bg-fd-secondary text-fd-secondary-foreground',
          )}
        >
          ver.{version}
        </span>
        <time className="text-sm font-medium text-fd-muted-foreground">{date}</time>
        {latest ? (
          <span className="ms-auto rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs font-semibold text-fd-primary">
            最新
          </span>
        ) : null}
      </header>
      <div className="sjg-release-body prose-no-margin px-4 py-3 text-[0.95rem]">{children}</div>
    </section>
  );
}

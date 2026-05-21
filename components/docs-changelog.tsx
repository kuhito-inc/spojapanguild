import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * 更新履歴をタイムライン表示するためのコンポーネント群。
 * `<Changelog>` で囲み、リリースごとに `<Release>` を新しい順に並べる。
 */
export function Changelog({ children }: { children: ReactNode }) {
  return <div className="sjg-changelog my-8 flex flex-col">{children}</div>;
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
    <section className="sjg-release relative pb-8 pl-9 last:pb-0">
      {/* 縦線（最古エントリでは非表示） */}
      <span
        aria-hidden
        className="absolute bottom-0 left-[9px] top-1 w-px bg-fd-border [.sjg-release:last-child_&]:hidden"
      />
      {/* ドット */}
      <span
        aria-hidden
        className={twMerge(
          'absolute left-0 top-1 size-[19px] rounded-full border-[3px] border-fd-background',
          latest ? 'bg-fd-primary ring-2 ring-fd-primary/25' : 'bg-fd-border',
        )}
      />
      <div className="flex flex-wrap items-center gap-2">
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
          <span className="rounded-md bg-fd-primary/10 px-2 py-0.5 text-xs font-semibold text-fd-primary">最新</span>
        ) : null}
      </div>
      <div className="sjg-release-body prose-no-margin mt-3 text-[0.95rem]">{children}</div>
    </section>
  );
}

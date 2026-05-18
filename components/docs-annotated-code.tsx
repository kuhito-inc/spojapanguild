'use client';

import { useId, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { CodeBlock } from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { twMerge } from 'tailwind-merge';
import { copyTextToClipboard } from '@/components/copy-to-clipboard';

export type AnnotatedCodeProps = {
  /** フェンス直下に表示するタイトル（任意） */
  title?: string;
  /** コード全体（コピー対象とも一致させる） */
  code: string;
  /** 1 始まりの行番号 → 注釈本文 */
  annotations: Partial<Record<number, string>>;
  allowCopy?: boolean;
};

/** MkDocs Material 風に、行末の「＋」で注釈を開閉するコードブロックです。通常の ``` フェンスとは別コンポーネントです。 */
export function AnnotatedCode({ title, code, annotations, allowCopy = true }: AnnotatedCodeProps) {
  const lines = code.replace(/\n$/, '').split('\n');
  const baseId = useId().replace(/:/g, '');
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyTextToClipboard(code);
    if (!ok) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CodeBlock
      title={title}
      allowCopy={false}
      className="not-prose"
      Actions={
        allowCopy
          ? ({ className, children }) => (
              <div className={twMerge('flex items-center gap-1', className)}>
                <button
                  type="button"
                  title="コピー"
                  aria-label={copied ? 'コピー済み' : 'コードをコピー'}
                  data-checked={copied || undefined}
                  onClick={() => void onCopy()}
                  className={buttonVariants({
                    size: 'icon-xs',
                    variant: 'ghost',
                    color: 'ghost',
                    className:
                      'text-fd-muted-foreground hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground',
                  })}
                >
                  {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
                </button>
                {children}
              </div>
            )
          : undefined
      }
    >
      <div className="px-4 py-1 font-mono text-[0.8125rem] leading-relaxed tracking-normal text-fd-foreground">
        {lines.map((line, i) => {
          const n = i + 1;
          const note = annotations[n];
          return (
            <div
              key={n}
              className="hover:bg-fd-accent/40 group/line flex min-h-[1.5em] items-start gap-2 rounded-sm px-2 -mx-2"
            >
              <span className="min-w-0 flex-1 overflow-x-auto whitespace-pre [font-variant-ligatures:none]">
                {line}
              </span>
              {note ? (
                <details className="relative shrink-0 pt-px">
                  <summary
                    className={twMerge(
                      buttonVariants({
                        size: 'icon-xs',
                        variant: 'ghost',
                        color: 'ghost',
                        className:
                          'list-none appearance-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-md px-2 font-sans text-xs font-semibold leading-none text-fd-primary hover:bg-fd-primary/15',
                      }),
                    )}
                  >
                    ＋
                  </summary>
                  <div
                    id={`anno-${baseId}-${n}`}
                    className="absolute end-0 top-full z-40 mt-1 w-max max-w-[min(320px,calc(100vw-8rem))] rounded-lg border border-fd-border bg-fd-card px-3 py-2 font-sans text-xs leading-snug text-fd-card-foreground shadow-md"
                  >
                    {note}
                  </div>
                </details>
              ) : null}
            </div>
          );
        })}
      </div>
    </CodeBlock>
  );
}

'use client';

import { useId, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { CodeBlock } from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { twMerge } from 'tailwind-merge';
import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import { usePersistentCopyFeedback } from './use-persistent-copy-feedback';

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
  const { copied, markCopied } = usePersistentCopyFeedback();
  const [openNoteLine, setOpenNoteLine] = useState<number | null>(null);

  const onCopy = async () => {
    const ok = await copyTextToClipboard(code);
    if (!ok) return;

    markCopied();
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
                      'text-fd-muted-foreground hover:text-fd-accent-foreground data-checked:bg-fd-primary/20 data-checked:text-fd-primary data-checked:ring-1 data-checked:ring-fd-primary/55 data-checked:shadow-sm',
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
      <div className="px-4 py-1 font-mono text-[0.9375rem] leading-[1.55] tracking-normal text-fd-foreground md:text-[1rem]">
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
                <div className="relative shrink-0 pt-px">
                  <button
                    type="button"
                    aria-expanded={openNoteLine === n}
                    aria-controls={`anno-${baseId}-${n}`}
                    onClick={() => setOpenNoteLine((current) => (current === n ? null : n))}
                    className={buttonVariants({
                      size: 'icon-xs',
                      variant: 'ghost',
                      color: 'ghost',
                      className:
                        'cursor-pointer rounded-md px-2 font-sans text-sm font-semibold leading-none text-fd-primary hover:bg-fd-primary/15 aria-expanded:bg-fd-primary/15 aria-expanded:ring-1 aria-expanded:ring-fd-primary/40',
                    })}
                  >
                    ＋
                  </button>
                  {openNoteLine === n ? (
                    <div
                      id={`anno-${baseId}-${n}`}
                      className="absolute end-0 top-full z-40 mt-1 w-max max-w-[min(360px,calc(100vw-8rem))] rounded-lg border border-fd-border bg-fd-card px-3.5 py-2.5 font-sans text-sm leading-relaxed text-fd-card-foreground shadow-md"
                    >
                      {note}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </CodeBlock>
  );
}

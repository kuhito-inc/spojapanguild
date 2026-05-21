'use client';

import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Check, Clipboard } from 'lucide-react';
import { useRef, type ComponentPropsWithoutRef, type RefObject } from 'react';
import { twMerge } from 'tailwind-merge';
import { usePersistentCopyFeedback } from './use-persistent-copy-feedback';

type MdxCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  allowCopy?: boolean;
  noCopy?: boolean | string | null;
  nocopy?: boolean | string | null;
  'data-no-copy'?: boolean | string;
  title?: string;
};

type CodeBlockViewportProps = ComponentPropsWithoutRef<'div'> & {
  ref: RefObject<HTMLDivElement | null>;
};

function getCodeText(container: HTMLElement | null): string {
  const pre = container?.getElementsByTagName('pre').item(0);
  if (!pre) return '';

  const clone = pre.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
    node.replaceWith('\n');
  });

  return clone.textContent ?? '';
}

function hasNoCopyFlag(props: MdxCodeBlockProps): boolean {
  return (
    props.noCopy !== undefined ||
    props.nocopy !== undefined ||
    props['data-no-copy'] === true ||
    props['data-no-copy'] === 'true'
  );
}

export function MdxCodeBlock({ allowCopy = true, children, ...props }: MdxCodeBlockProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const { copied, markCopied } = usePersistentCopyFeedback();
  const viewportProps = ({ ref: areaRef } satisfies CodeBlockViewportProps) as unknown as ComponentPropsWithoutRef<'div'>;
  const canCopy = allowCopy && !hasNoCopyFlag(props);

  const onCopy = async () => {
    const ok = await copyTextToClipboard(getCodeText(areaRef.current));
    if (!ok) return;

    markCopied();
  };

  return (
    <CodeBlock
      {...props}
      allowCopy={false}
      viewportProps={viewportProps}
      Actions={
        canCopy
          ? ({ className, children: actionsChildren }) => (
              <div className={twMerge('empty:hidden', className)}>
                <button
                  type="button"
                  data-checked={copied || undefined}
                  className={buttonVariants({
                    className:
                      'hover:text-fd-accent-foreground data-checked:bg-fd-primary/20 data-checked:text-fd-primary data-checked:ring-1 data-checked:ring-fd-primary/55 data-checked:shadow-sm',
                    size: 'icon-xs',
                  })}
                  aria-label={copied ? 'コピー済み' : 'コードをコピー'}
                  onClick={() => void onCopy()}
                >
                  {copied ? <Check /> : <Clipboard />}
                </button>
                {actionsChildren}
              </div>
            )
          : undefined
      }
    >
      <Pre>{children}</Pre>
    </CodeBlock>
  );
}

'use client';

import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Check, Clipboard } from 'lucide-react';
import { useRef, useState, type ComponentPropsWithoutRef, type RefObject } from 'react';
import { twMerge } from 'tailwind-merge';

type MdxCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  allowCopy?: boolean;
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

export function MdxCodeBlock({ allowCopy = true, children, ...props }: MdxCodeBlockProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const viewportProps = ({ ref: areaRef } satisfies CodeBlockViewportProps) as unknown as ComponentPropsWithoutRef<'div'>;

  const onCopy = async () => {
    const ok = await copyTextToClipboard(getCodeText(areaRef.current));
    if (!ok) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <CodeBlock
      {...props}
      allowCopy={false}
      viewportProps={viewportProps}
      Actions={
        allowCopy
          ? ({ className, children: actionsChildren }) => (
              <div className={twMerge('empty:hidden', className)}>
                <button
                  type="button"
                  data-checked={copied || undefined}
                  className={buttonVariants({
                    className: 'hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground',
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

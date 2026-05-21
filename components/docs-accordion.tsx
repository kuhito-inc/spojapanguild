'use client';

import {
  Accordion as AccordionRoot,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from 'fumadocs-ui/components/ui/accordion';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Check, LinkIcon } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
  type RefCallback,
  type ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';

type AccordionsRootProps = ComponentProps<typeof AccordionRoot>;
type AccordionItemProps = ComponentProps<typeof AccordionItem>;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    }
  };
}

function getHashTargetValue(root: HTMLElement | null): string | null {
  let id = window.location.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }

  if (!root || id.length === 0) return null;

  const selected = document.getElementById(id);
  if (!selected || !root.contains(selected)) return null;

  return selected.getAttribute('data-accordion-value');
}

function scrollHashTargetIntoView() {
  let id = window.location.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return;
  }

  document.getElementById(id)?.scrollIntoView({ block: 'start' });
}

async function copyText(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.inset = '0 auto auto 0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

export function Accordions({
  type = 'single',
  ref,
  className,
  defaultValue,
  ...props
}: AccordionsRootProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = mergeRefs(ref, rootRef);
  const [value, setValue] = useState<string | string[]>(() =>
    type === 'single' ? ((defaultValue as string | undefined) ?? '') : ((defaultValue as string[] | undefined) ?? []),
  );

  const openHashTarget = useCallback((shouldScroll = false) => {
    const next = getHashTargetValue(rootRef.current);
    if (!next) return;

    setValue((prev) => {
      if (type === 'single') return next;
      const values = Array.isArray(prev) ? prev : [];
      return values.includes(next) ? values : [next, ...values];
    });

    if (shouldScroll) {
      window.requestAnimationFrame(() => scrollHashTargetIntoView());
    }
  }, [type]);

  useEffect(() => {
    openHashTarget(true);

    function handleHashChange() {
      openHashTarget(true);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [openHashTarget]);

  if (type === 'multiple') {
    return (
      <AccordionRoot
        {...props}
        type="multiple"
        ref={composedRef}
        value={Array.isArray(value) ? value : []}
        onValueChange={setValue}
        className={twMerge('divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card', className)}
      />
    );
  }

  return (
    <AccordionRoot
      {...props}
      type="single"
      ref={composedRef}
      value={typeof value === 'string' ? value : ''}
      onValueChange={setValue}
      collapsible
      className={twMerge('divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card', className)}
    />
  );
}

export function Accordion({
  title,
  id,
  value = String(title),
  children,
  ...props
}: Omit<AccordionItemProps, 'value' | 'title'> & {
  title: ReactNode;
  id?: string;
  value?: string;
}) {
  return (
    <AccordionItem value={value} {...props}>
      <AccordionHeader id={id} data-accordion-value={value}>
        <AccordionTrigger>{title}</AccordionTrigger>
        {id ? <AccordionHashLink id={id} /> : null}
      </AccordionHeader>
      <AccordionContent>
        <div className="px-4 pb-2 text-[0.9375rem] prose-no-margin">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function AccordionHashLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy Link"
      title="リンクをコピー"
      className={twMerge(buttonVariants({ color: 'ghost' }), 'me-2 text-fd-muted-foreground')}
      onClick={(event) => {
        event.stopPropagation();

        const url = new URL(window.location.href);
        url.hash = id;
        void copyText(url.toString()).then((success) => {
          if (!success) return;
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? <Check className="size-3.5" /> : <LinkIcon className="size-3.5" />}
    </button>
  );
}

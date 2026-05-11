'use client';

import { Accordions } from 'fumadocs-ui/components/accordion';
import { twMerge } from 'tailwind-merge';
import type { ComponentProps, CSSProperties } from 'react';

type SemanticVariant = 'info' | 'warning' | 'error';

/** fumadocs `Accordions`（type: single / multiple の判別共用体） */
type AccordionsRootProps = ComponentProps<typeof Accordions>;

type ColoredShellProps = {
  variant?: SemanticVariant;
  boxClassName?: string;
};

function ColoredAccordionsShell({
  variant = 'info',
  boxClassName,
  accordionsProps,
}: ColoredShellProps & { accordionsProps: AccordionsRootProps }) {
  const { className, style, ...rest } = accordionsProps;

  /** `global.css` の `--color-fd-info`（青）/ `warning`（黄橙）/ `error`（赤） */
  const fdToken = `var(--color-fd-${variant}, var(--color-fd-muted))`;

  const boxStyle: CSSProperties = {
    ['--callout-color' as string]: fdToken,
    backgroundColor: `color-mix(in srgb, ${fdToken} 14%, var(--color-fd-card))`,
    borderColor: `color-mix(in srgb, ${fdToken} 50%, var(--color-fd-border))`,
  };

  return (
    <div
      className={twMerge(
        // 背景・枠線は inline style で色相をつける（bg-fd-card は指定しない）
        'my-3 flex gap-1.5 rounded-xl border py-1.5 ps-1 pe-2 text-sm text-fd-card-foreground shadow-md',
        '[&_button]:min-h-0 [&_button]:py-1 [&_button]:px-2 [&_button]:leading-snug [&_button_svg]:size-3.5',
        // トリガー左シェブロンをアクセント色に寄せる
        '[&_button>svg:first-of-type]:text-(--callout-color)',
        boxClassName,
      )}
      style={boxStyle}
    >
      <div role="none" className="w-1 shrink-0 self-stretch rounded-sm bg-(--callout-color)" />
      <Accordions
        {...rest}
        className={twMerge(
          'min-w-0 flex-1 divide-y divide-fd-border/80 overflow-hidden rounded-lg border-0 bg-transparent shadow-none',
          className,
        )}
        style={style}
      />
    </div>
  );
}

/** Callout と同じトークン（青 / 黄 / 赤）で `Accordions` を囲む。子は従来どおり `Accordion` を並べる。 */
export function DocsAccordions({
  variant = 'info',
  boxClassName,
  ...accordionsProps
}: ColoredShellProps & AccordionsRootProps) {
  return (
    <ColoredAccordionsShell
      variant={variant}
      boxClassName={boxClassName}
      accordionsProps={accordionsProps}
    />
  );
}

/** 青系（info） */
export function AccordionsBlue(props: Omit<ColoredShellProps, 'variant'> & AccordionsRootProps) {
  const { boxClassName, ...accordionsProps } = props;
  return (
    <ColoredAccordionsShell
      variant="info"
      boxClassName={boxClassName}
      accordionsProps={accordionsProps}
    />
  );
}

/** 黄系（warning） */
export function AccordionsYellow(props: Omit<ColoredShellProps, 'variant'> & AccordionsRootProps) {
  const { boxClassName, ...accordionsProps } = props;
  return (
    <ColoredAccordionsShell
      variant="warning"
      boxClassName={boxClassName}
      accordionsProps={accordionsProps}
    />
  );
}

/** 赤系（error） */
export function AccordionsRed(props: Omit<ColoredShellProps, 'variant'> & AccordionsRootProps) {
  const { boxClassName, ...accordionsProps } = props;
  return (
    <ColoredAccordionsShell
      variant="error"
      boxClassName={boxClassName}
      accordionsProps={accordionsProps}
    />
  );
}

import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from '@/components/docs-accordion';
import { AccordionsBlue, AccordionsRed, AccordionsYellow, DocsAccordions } from '@/components/docs-colored-accordions';
import { AnnotatedCode } from '@/components/docs-annotated-code';
import { DocsMdxAnchor } from '@/components/docs-mdx-anchor';
import { Mermaid } from '@/components/mermaid';
import { MdxCodeBlock } from '@/components/mdx-code-block';
import { MdxImage } from '@/components/mdx-image';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

type CustomPreProps = ComponentPropsWithoutRef<'pre'> & {
  allowCopy?: boolean | string;
  allowcopy?: boolean | string;
  noCopy?: boolean | string | null;
  nocopy?: boolean | string | null;
  'data-no-copy'?: boolean | string;
  title?: string;
};

function normalizeBoolean(value: boolean | string | null | undefined): boolean | undefined {
  if (value === 'false') return false;
  if (value === 'true') return true;
  return typeof value === 'boolean' ? value : undefined;
}

function hasNoCopyFlag(props: CustomPreProps): boolean {
  return (
    props.noCopy !== undefined ||
    props.nocopy !== undefined ||
    props['data-no-copy'] === true ||
    props['data-no-copy'] === 'true'
  );
}

function ZoomableImage(props: ComponentPropsWithoutRef<'img'>) {
  const DefaultImage = defaultMdxComponents.img as React.ComponentType<ComponentPropsWithoutRef<'img'>>;

  if (typeof props.src !== 'string') {
    return <DefaultImage {...props} />;
  }

  return <MdxImage {...props} />;
}

function CustomPre(props: CustomPreProps) {
  const child = props.children as React.ReactElement<ComponentPropsWithoutRef<'code'>> | undefined;
  const className = child?.props?.className ?? '';
  if (className.includes('language-mermaid')) {
    const code = typeof child?.props?.children === 'string' ? child.props.children.trim() : '';
    return <Mermaid chart={code} />;
  }
  const allowCopyValue = props.allowCopy ?? props.allowcopy;
  const allowCopy = hasNoCopyFlag(props) ? false : normalizeBoolean(allowCopyValue);

  return <MdxCodeBlock {...props} allowCopy={allowCopy} />;
}

function DocsTable(props: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="sjg-table-wrap relative overflow-auto prose-no-margin my-6">
      <table {...props} />
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    a: DocsMdxAnchor,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    DocsAccordions,
    AccordionsBlue,
    AccordionsYellow,
    AccordionsRed,
    AnnotatedCode,
    img: ZoomableImage,
    ZoomImage: ZoomableImage,
    Mermaid,
    pre: CustomPre,
    table: DocsTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

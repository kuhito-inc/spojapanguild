import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { AccordionsBlue, AccordionsRed, AccordionsYellow, DocsAccordions } from '@/components/docs-colored-accordions';
import { AnnotatedCode } from '@/components/docs-annotated-code';
import { DocsMdxAnchor } from '@/components/docs-mdx-anchor';
import { Mermaid } from '@/components/mermaid';
import { MdxImage } from '@/components/mdx-image';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

type CustomPreProps = ComponentPropsWithoutRef<'pre'> & {
  allowCopy?: boolean | string;
  allowcopy?: boolean | string;
  title?: string;
};

function normalizeBoolean(value: boolean | string | undefined): boolean | undefined {
  if (value === 'false') return false;
  if (value === 'true') return true;
  return typeof value === 'boolean' ? value : undefined;
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
  const DefaultPre = defaultMdxComponents.pre as React.ComponentType<CustomPreProps>;
  const allowCopyValue = props.allowCopy ?? props.allowcopy;
  const allowCopy = normalizeBoolean(allowCopyValue);

  return <DefaultPre {...props} allowCopy={allowCopy} />;
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
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Mermaid } from '@/components/mermaid';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

function CustomPre(props: ComponentPropsWithoutRef<'pre'>) {
  const child = props.children as React.ReactElement<ComponentPropsWithoutRef<'code'>> | undefined;
  const className = child?.props?.className ?? '';
  if (className.includes('language-mermaid')) {
    const code = typeof child?.props?.children === 'string' ? child.props.children.trim() : '';
    return <Mermaid chart={code} />;
  }
  const DefaultPre = defaultMdxComponents.pre as React.ComponentType<ComponentPropsWithoutRef<'pre'>>;
  return <DefaultPre {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    pre: CustomPre,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { renderMermaidSVG } from 'beautiful-mermaid';
import { useId } from 'react';

export function Mermaid({ chart }: { chart: string }) {
  const prefix = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}-`;

  try {
    const svg = renderMermaidSVG(chart, {
      bg: 'var(--color-fd-background)',
      fg: 'var(--color-fd-foreground)',
      interactive: false,
      transparent: true,
    });
    // Scope marker IDs and references to this diagram, including identical charts.
    const scopedSvg = svg
      .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}${id}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}${id})`)
      .replace(/\bhref="#([^"]+)"/g, (_, id: string) => `href="#${prefix}${id}"`);

    return (
      <div
        className="my-4 overflow-auto rounded-lg border border-fd-border bg-fd-card p-4"
        dangerouslySetInnerHTML={{ __html: scopedSvg }}
      />
    );
  } catch {
    return (
      <CodeBlock title="Mermaid" allowCopy={false}>
        <Pre>{chart}</Pre>
      </CodeBlock>
    );
  }
}

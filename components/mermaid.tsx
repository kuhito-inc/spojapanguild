import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { renderMermaidSVG } from 'beautiful-mermaid';

export function Mermaid({ chart }: { chart: string }) {
  try {
    const svg = renderMermaidSVG(chart, {
      bg: 'var(--color-fd-background)',
      fg: 'var(--color-fd-foreground)',
      interactive: false,
      transparent: true,
    });

    return (
      <div
        className="my-4 overflow-auto rounded-lg border border-fd-border bg-fd-card p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
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

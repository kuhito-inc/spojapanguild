'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

let mermaidInitialized = false;

export function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            securityLevel: 'loose',
          });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);

        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="overflow-auto rounded border border-red-300 bg-red-50 p-4 text-red-700 text-sm dark:border-red-700 dark:bg-red-950 dark:text-red-300">
        {error}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="flex h-24 items-center justify-center text-fd-muted-foreground text-sm">
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded border border-fd-border p-4 my-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

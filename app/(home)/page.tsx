import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 p-8">
      <h1 className="text-3xl font-bold mb-4">SPO JAPAN GUILD DOCS</h1>
      <p className="text-lg text-fd-muted-foreground mb-8 max-w-2xl mx-auto">
        SPO JAPAN GUILD監修のステークプール構築ガイド。<br />
        私たちは日本におけるステークプール構築を促進しカルダノ分散化に貢献してまいります。
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium hover:bg-fd-primary/90 transition-colors"
        >
          ドキュメントを読む →
        </Link>
        <Link
          href="https://spojapanguild.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 rounded-lg border border-fd-border font-medium hover:bg-fd-accent transition-colors"
        >
          公式サイト
        </Link>
      </div>
    </div>
  );
}

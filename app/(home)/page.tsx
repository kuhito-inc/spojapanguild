import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex flex-1 items-center overflow-x-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-[clamp(3rem,6vh,5rem)] xl:px-16">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(43,80,158,0.11)_0%,rgba(43,80,158,0.045)_34%,transparent_68%)] dark:bg-[linear-gradient(180deg,rgba(43,80,158,0.20)_0%,rgba(43,80,158,0.08)_36%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-fd-border/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-fd-background to-transparent" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        {/* Hero */}
        <section className="w-full max-w-4xl text-center">
          <h1 className="text-[clamp(2.5rem,5.8vw,4.25rem)] font-bold leading-[1.06] text-fd-foreground">
            SPO JAPAN GUILD
            <span className="mt-2 block bg-gradient-to-r from-fd-primary to-blue-500 bg-clip-text text-transparent sm:mt-3">
              ドキュメント
            </span>
          </h1>

          <div className="mx-auto mt-5 h-1 w-10 rounded-full bg-fd-primary" />

          <div className="mx-auto mt-6 max-w-3xl text-center text-fd-muted-foreground sm:mt-7">
            <p className="text-[clamp(0.98rem,1.05vw,1.16rem)] font-medium leading-[1.8] [text-wrap:balance]">
              <span className="text-fd-foreground">SPO JAPAN GUILD監修</span>
              <span className="mx-2 text-fd-muted-foreground/60">/</span>
              Cardano / Midnight インフラ構築・運用ガイド
            </p>

            <p className="mx-auto mt-3 max-w-2xl text-[clamp(0.92rem,0.9vw,1.04rem)] font-medium leading-[1.85] [text-wrap:balance] sm:mt-4">
              ノード構築から日々の運用、監視、更新対応まで、
              実践に基づく情報をまとめています。
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4 sm:mt-10 lg:mt-[clamp(2.5rem,5vh,4.5rem)] lg:gap-5">

          {/* Cardano */}
          <Link
            href="/docs/cardano"
            className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl sm:min-h-[285px] lg:min-h-[clamp(18rem,26vh,22rem)] lg:p-7"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_88%,rgba(59,130,246,0.10),transparent_42%)]" />

            <div className="relative flex h-12 items-center overflow-hidden">
              <span
                role="img"
                aria-label="Cardano"
                className="block h-8 w-[180px] max-w-full bg-[url('/images/brand/cardano-logo-blue.png')] bg-contain bg-left bg-no-repeat dark:hidden"
              />
              <span
                role="img"
                aria-label="Cardano"
                className="hidden h-8 w-[180px] max-w-full bg-[url('/images/brand/cardano-logo-white.png')] bg-contain bg-left bg-no-repeat dark:block"
              />
            </div>

            <p className="relative mt-6 text-[clamp(0.82rem,0.75vw,0.95rem)] font-medium text-fd-muted-foreground">
              Stake pool operations
            </p>

            <h2 className="relative mt-3 text-[clamp(1.15rem,1.25vw,1.38rem)] font-bold leading-snug">
              SPO運用の実践ガイド
            </h2>

            <div className="relative mt-4 h-0.5 w-7 rounded-full bg-fd-primary" />

            <p className="relative mt-6 max-w-[22rem] flex-1 pr-10 text-[clamp(0.9rem,0.82vw,1rem)] font-medium leading-[1.9] text-fd-muted-foreground">
              Cardanoノード、SPO運用、Mithril、監視、
              更新対応を実務ベースでまとめています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1 lg:bottom-6 lg:right-6">
              →
            </span>
          </Link>

          {/* Midnight */}
          <Link
            href="/docs/midnight"
            className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl sm:min-h-[285px] lg:min-h-[clamp(18rem,26vh,22rem)] lg:p-7"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_88%,rgba(99,102,241,0.11),transparent_42%)]" />

            <div className="relative flex h-12 items-center overflow-hidden">
              <span
                role="img"
                aria-label="Midnight"
                className="block h-8 w-[188px] max-w-full bg-[url('/images/brand/midnight-logo-black.png')] bg-contain bg-left bg-no-repeat dark:hidden"
              />
              <span
                role="img"
                aria-label="Midnight"
                className="hidden h-8 w-[188px] max-w-full bg-[url('/images/brand/midnight-logo-white.png')] bg-contain bg-left bg-no-repeat dark:block"
              />
            </div>

            <p className="relative mt-6 text-[clamp(0.82rem,0.75vw,0.95rem)] font-medium text-fd-muted-foreground">
              Validator testnet
            </p>

            <h2 className="relative mt-3 text-[clamp(1.15rem,1.25vw,1.38rem)] font-bold leading-snug">
              検証環境の知見を順次整理
            </h2>

            <div className="relative mt-4 h-0.5 w-7 rounded-full bg-indigo-500" />

            <p className="relative mt-6 max-w-[22rem] flex-1 pr-10 text-[clamp(0.9rem,0.82vw,1rem)] font-medium leading-[1.9] text-fd-muted-foreground">
              Midnight検証環境、Validator運用、
              セットアップ手順で得た知見を整理しています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1 lg:bottom-6 lg:right-6">
              →
            </span>
          </Link>

          {/* Learning */}
          <Link
            href="/docs/learning"
            className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl sm:min-h-[285px] lg:min-h-[clamp(18rem,26vh,22rem)] lg:p-7"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_88%,rgba(59,130,246,0.10),transparent_42%)]" />

            <div className="relative flex h-12 items-center">
              <span
                role="img"
                aria-label="SPO JAPAN GUILD"
                className="block h-10 w-[232px] max-w-full -translate-y-1 bg-[url('/images/brand/sjg-yoko-logo-trimmed.png')] bg-contain bg-left bg-no-repeat dark:hidden"
              />
              <span
                role="img"
                aria-label="SPO JAPAN GUILD"
                className="hidden h-10 w-[232px] max-w-full -translate-y-1 bg-[url('/images/brand/sjg-yoko-white-logo-trimmed.png')] bg-contain bg-left bg-no-repeat dark:block"
              />
            </div>

            <p className="relative mt-6 text-[clamp(0.82rem,0.75vw,0.95rem)] font-medium text-fd-muted-foreground">
              Learning materials
            </p>

            <h2 className="relative mt-3 text-[clamp(1.15rem,1.25vw,1.38rem)] font-bold leading-snug">
              運用基礎・学習教材
            </h2>

            <div className="relative mt-4 h-0.5 w-7 rounded-full bg-fd-primary" />

            <p className="relative mt-6 max-w-[22rem] flex-1 pr-10 text-[clamp(0.9rem,0.82vw,1rem)] font-medium leading-[1.9] text-fd-muted-foreground">
              SPOミーティングで共有している運用基礎や
              トラブルシューティング教材を公開しています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1 lg:bottom-6 lg:right-6">
              →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

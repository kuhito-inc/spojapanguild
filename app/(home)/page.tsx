import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="relative flex flex-1 overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(43,80,158,0.11)_0%,rgba(43,80,158,0.045)_34%,transparent_68%)] dark:bg-[linear-gradient(180deg,rgba(43,80,158,0.20)_0%,rgba(43,80,158,0.08)_36%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-fd-border/80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-fd-background to-transparent" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* Hero */}
        <section className="max-w-4xl pt-2 text-center">
          <h1 className="text-4xl font-bold leading-[1.04] tracking-tight text-fd-foreground sm:text-5xl lg:text-[3.8rem]">
            SPO JAPAN GUILD
            <span className="mt-3 block bg-gradient-to-r from-fd-primary to-blue-500 bg-clip-text text-transparent">
              ドキュメント
            </span>
          </h1>

          <div className="mx-auto mt-5 h-1 w-10 rounded-full bg-fd-primary" />

          <div className="mx-auto mt-7 max-w-3xl text-center text-fd-muted-foreground">
            <p className="text-base font-medium leading-8 sm:text-lg">
              <span className="text-fd-foreground">SPO JAPAN GUILD監修</span>
              <span className="mx-2 text-fd-muted-foreground/60">/</span>
              Cardano / Midnight インフラ構築・運用ガイド
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] font-medium leading-8">
              ノード構築から日々の運用、監視、更新対応まで、
              実践に基づく情報をまとめています。
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-9 grid w-full gap-4 lg:grid-cols-3">

          {/* Cardano */}
          <Link
            href="/docs/cardano"
            className="group relative flex min-h-[285px] flex-col overflow-hidden rounded-[1.5rem] border border-fd-border bg-fd-card/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl"
          >
            <div className="absolute bottom-0 right-0 -z-10 h-32 w-32 rounded-tl-full bg-blue-500/10 blur-2xl" />

            <div className="flex h-12 items-center">
              <Image
                src="/images/brand/cardano-logo-blue.png"
                alt="Cardano"
                width={220}
                height={36}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/images/brand/cardano-logo-white.png"
                alt="Cardano"
                width={220}
                height={36}
                className="hidden h-8 w-auto dark:block"
              />
            </div>

            <p className="mt-6 text-sm font-medium text-fd-muted-foreground">
              Stake pool operations
            </p>

            <h2 className="mt-3 text-xl font-bold leading-snug">
              SPO運用の実践ガイド
            </h2>

            <div className="mt-4 h-0.5 w-7 rounded-full bg-fd-primary" />

            <p className="mt-6 flex-1 max-w-[18rem] pr-8 text-[0.92rem] font-medium leading-8 text-fd-muted-foreground">
              Cardanoノード、SPO運用、Mithril、監視、
              更新対応を実務ベースでまとめています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1">
              →
            </span>
          </Link>

          {/* Midnight */}
          <Link
            href="/docs/midnight"
            className="group relative flex min-h-[285px] flex-col overflow-hidden rounded-[1.5rem] border border-fd-border bg-fd-card/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl"
          >
            <div className="absolute bottom-0 right-0 -z-10 h-32 w-32 rounded-tl-full bg-indigo-500/10 blur-2xl" />

            <div className="flex h-12 items-center">
              <Image
                src="/images/brand/midnight-logo-black.png"
                alt="Midnight"
                width={220}
                height={36}
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/images/brand/midnight-logo-white.png"
                alt="Midnight"
                width={220}
                height={36}
                className="hidden h-8 w-auto dark:block"
              />
            </div>

            <p className="mt-6 text-sm font-medium text-fd-muted-foreground">
              Validator testnet
            </p>

            <h2 className="mt-3 text-xl font-bold leading-snug">
              検証環境の知見を順次整理
            </h2>

            <div className="mt-4 h-0.5 w-7 rounded-full bg-indigo-500" />

            <p className="mt-6 flex-1 max-w-[18rem] pr-8 text-[0.92rem] font-medium leading-8 text-fd-muted-foreground">
              Midnight検証環境、Validator運用、
              セットアップ手順で得た知見を整理しています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1">
              →
            </span>
          </Link>

          {/* Learning */}
          <Link
            href="/docs/learning"
            className="group relative flex min-h-[285px] flex-col overflow-hidden rounded-[1.5rem] border border-fd-border bg-fd-card/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/60 hover:shadow-xl"
          >
            <div className="absolute bottom-0 right-0 -z-10 h-32 w-32 rounded-tl-full bg-blue-500/10 blur-2xl" />

            <div className="flex h-12 items-center">
              <Image
                src="/images/brand/sjg-yoko-logo.png"
                alt="SPO JAPAN GUILD"
                width={260}
                height={42}
                className="w-[235px] max-w-full object-contain dark:hidden"
              />

              <Image
                src="/images/brand/sjg-yoko-white-logo.png"
                alt="SPO JAPAN GUILD"
                width={260}
                height={42}
                className="hidden w-[235px] max-w-full object-contain dark:block"
              />
            </div>

            <p className="mt-6 text-sm font-medium text-fd-muted-foreground">
              Learning materials
            </p>

            <h2 className="mt-3 text-xl font-bold leading-snug">
              運用基礎・学習教材
            </h2>

            <div className="mt-4 h-0.5 w-7 rounded-full bg-fd-primary" />

            <p className="mt-6 flex-1 max-w-[18rem] pr-8 text-[0.92rem] font-medium leading-8 text-fd-muted-foreground">
              SPOミーティングで共有している運用基礎や
              トラブルシューティング教材を公開しています。
            </p>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-lg text-fd-primary shadow-sm transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

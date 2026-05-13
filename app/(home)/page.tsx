import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr_0.88fr]">
        <section className="text-left">
          <p className="mb-5 inline-flex rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm font-medium text-fd-muted-foreground">
            Blockchain Infrastructure Guide
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-fd-foreground sm:text-5xl lg:text-6xl">
            SPO JAPAN GUILD
            <span className="block text-fd-primary">ドキュメント</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground sm:text-xl">
            SPO JAPAN GUILD監修のブロックチェーンインフラ構築・運用ガイド。
            Cardanoを中心に、Midnightなど関連ネットワークの検証・運用知見と学習教材を整理していきます。
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/docs"
              className="inline-flex min-h-12 items-center rounded-lg bg-fd-primary px-6 py-3 font-semibold text-fd-primary-foreground shadow-sm transition-colors hover:bg-fd-primary/90"
            >
              ドキュメントを読む →
            </Link>
            <Link
              href="https://spojapanguild.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-lg border border-fd-border bg-fd-background px-6 py-3 font-semibold transition-colors hover:bg-fd-accent"
            >
              公式サイト
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-fd-muted-foreground">
            <span>Cardano</span>
            <span>Midnight</span>
            <span>Setup</span>
            <span>Operation</span>
            <span>Monitoring</span>
          </div>
        </section>

        <section
          aria-label="ドキュメント構成図"
          className="rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-fd-primary">Network Operations</p>
              <h2 className="mt-1 text-xl font-bold">CardanoとMidnightのノード運用知見を集約</h2>
            </div>
            <span className="rounded-full bg-fd-accent px-3 py-1 text-sm font-medium text-fd-muted-foreground">
              SJG Docs
            </span>
          </div>

          <div className="rounded-lg border border-fd-border bg-fd-background p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/docs/cardano"
                className="group flex min-h-40 flex-col justify-between rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/60 hover:bg-fd-accent/60"
              >
                <div className="flex h-14 items-center">
                  <img
                    src="/images/brand/cardano-logo-blue.png"
                    alt="Cardano"
                    className="block h-9 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/images/brand/cardano-logo-white.png"
                    alt="Cardano"
                    className="hidden h-9 w-auto object-contain dark:block"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-fd-muted-foreground">Stake pool operations</p>
                  <p className="mt-2 font-semibold text-fd-foreground group-hover:text-fd-primary">
                    構築・運用・監視の実践手順
                  </p>
                </div>
              </Link>

              <Link
                href="/docs/midnight"
                className="group flex min-h-40 flex-col justify-between rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/60 hover:bg-fd-accent/60"
              >
                <div className="flex h-14 items-center">
                  <img
                    src="/images/brand/midnight-logo-black.png"
                    alt="Midnight"
                    className="block h-8 w-auto object-contain dark:hidden"
                  />
                  <img
                    src="/images/brand/midnight-logo-white.png"
                    alt="Midnight"
                    className="hidden h-8 w-auto object-contain dark:block"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-fd-muted-foreground">Validator testnet</p>
                  <p className="mt-2 font-semibold text-fd-foreground group-hover:text-fd-primary">
                    検証環境の知見を順次整理
                  </p>
                </div>
              </Link>
            </div>

            <Link
              href="/docs/learning"
              className="mt-4 flex items-start justify-between gap-4 rounded-lg border border-fd-border bg-fd-card px-5 py-4 transition-colors hover:border-fd-primary/60 hover:bg-fd-accent/60"
            >
              <div>
                <p className="text-sm font-semibold text-fd-primary">SJG Learning</p>
                <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
                  SPOミーティングで共有している運用基礎・トラブルシューティング教材も公開しています。
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

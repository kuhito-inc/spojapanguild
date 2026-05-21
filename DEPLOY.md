# Cloudflare デプロイ マニュアル

SPO JAPAN GUILD ドキュメント（fumadocs / Next.js 16）を Cloudflare Workers に
デプロイする手順。OpenNext アダプタ（`@opennextjs/cloudflare`）で SSR・検索・
OG 画像・セキュリティヘッダをそのまま動かす。静的エクスポート改修は不要。

参考: https://opennext.js.org/cloudflare

デプロイは **Cloudflare の Git 連携（Workers Builds）** で行う。
リポジトリを連携すれば `main` への push で Cloudflare が自動ビルド&デプロイする。
GitHub Actions は不要。

---

## 1. ビルド環境について

OpenNext / wrangler のビルドには **Node.js 22** が必要。
Cloudflare の Workers Builds は `.nvmrc`（このリポジトリに含まれる `22`）を
読み取って Node 22 でビルドするため、追加設定は不要。

ローカルで `pnpm deploy` / `pnpm preview` を実行する場合のみ手元も Node 22 が必要。

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22 && nvm use 22 && nvm alias default 22
corepack enable pnpm
```

---

## 2. リポジトリに含まれる設定（変更不要）

| ファイル | 役割 |
|---|---|
| `wrangler.jsonc` | Worker 名 `spojapanguild-docs`、assets/images バインディング |
| `open-next.config.ts` | OpenNext 設定 |
| `next.config.mjs` | `initOpenNextCloudflareForDev()` 追加 |
| `package.json` | `preview` / `deploy` / `cf-typegen` スクリプト |
| `public/_headers` | `/_next/static/*` の長期キャッシュ |
| `.nvmrc` | Cloudflare ビルド環境の Node バージョン固定（22） |

---

## 3. 初回セットアップ（Git 連携）

1. Cloudflare ダッシュボード → **Workers & Pages**（または **Compute / Workers**）
2. **Create** → **Import a repository**（Git 連携）
3. GitHub 連携 → `kuhito-inc/spojapanguild` を選択
4. ビルド設定:
   - **Framework preset**: Next.js（または None）
   - **Build command**: `pnpm run deploy`
   - **Deploy command**: 空欄（build コマンド内の `opennextjs-cloudflare deploy` が実行）
   - **Production branch**: `main`
5. 保存 → 初回ビルドが走る

> `pnpm run deploy` = `opennextjs-cloudflare build && opennextjs-cloudflare deploy`

以降、`main` への push で自動ビルド&デプロイされる。

---

## 4. 日常運用

`main` に push するだけで自動デプロイ。手動操作不要。
進捗は Cloudflare ダッシュボードの対象 Worker → **Deployments** で確認。

---

## 5. ローカルでの確認（任意・Node 22 必須）

```bash
pnpm install
pnpm dev --port 8002   # 開発サーバー
pnpm preview           # CF Workers 環境でローカルプレビュー

# ローカルから直接デプロイ
pnpm exec wrangler login
pnpm deploy
```

---

## 6. 独自ドメイン設定（任意）

1. Cloudflare ダッシュボード → 対象 Worker → **Settings** → **Domains & Routes**
2. **Add** → **Custom Domain** → `docs.spojapanguild.net`
3. ドメインが Cloudflare 管理下なら DNS は自動設定される

---

## 7. トラブルシューティング

| 症状 | 対処 |
|---|---|
| `ERR_IMPORT_ASSERTION_TYPE_MISSING` | Node が古い。ビルド環境を 22 に（`.nvmrc` 確認） |
| `Error connecting to git account` | GitHub App を一旦アンインストール→再連携。組織リポジトリは組織オーナーの承認が必要 |
| `opennextjs-cloudflare: command not found` | `pnpm install` 未実行 |
| ビルドが `.source` 関連で失敗 | `pnpm install`（postinstall の fumadocs-mdx）を再実行 |

---

## 8. コマンド早見表

```bash
pnpm dev --port 8002   # 開発サーバー
pnpm preview           # CF Workers 環境でローカルプレビュー
pnpm deploy            # ローカルからビルド + デプロイ
```

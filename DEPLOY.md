# GitHub Pages デプロイ マニュアル

SPO JAPAN GUILD ドキュメント（fumadocs / Next.js 16）を **静的サイト**として
ビルドし、GitHub Pages で配信する手順。`main` への push で
GitHub Actions が自動ビルド&デプロイする。

サーバー・第三者サービス・ビルドアダプタ不要。完全無料。
Cloudflare Workers のような実行リソース上限（Error 1102）も発生しない。

---

## 1. 仕組み

```
main に push
  ↓
GitHub Actions（.github/workflows/deploy.yml）
  ↓
pnpm build  →  next build（output: 'export'）→  out/ に静的ファイル生成
  ↓
actions/upload-pages-artifact → actions/deploy-pages
  ↓
GitHub Pages に公開（docs.spojapanguild.net）
```

---

## 2. リポジトリに含まれる設定（変更不要）

| ファイル | 役割 |
|---|---|
| `next.config.mjs` | `output: 'export'` + `images.unoptimized` |
| `app/api/search/route.ts` | 検索を静的インデックスとして出力（`staticGET`） |
| `app/layout.tsx` | `RootProvider` の検索を `type: 'static'` に設定 |
| `app/llms*.txt` ほか | `dynamic = 'force-static'` で静的化 |
| `public/CNAME` | 独自ドメイン `docs.spojapanguild.net` |
| `public/.nojekyll` | GitHub Pages の Jekyll 処理を無効化（`_next` 配信に必須） |
| `.github/workflows/deploy.yml` | main push 時の自動ビルド&デプロイ |

---

## 3. 初回セットアップ（1回だけ）

### 3-1. GitHub Pages を有効化

リポジトリ → **Settings** → **Pages**
→ **Build and deployment** → **Source** を **「GitHub Actions」** に設定

### 3-2. 独自ドメインの DNS 設定

`spojapanguild.net` の DNS に CNAME レコードを追加:

| Type | Name | Value |
|---|---|---|
| CNAME | `docs` | `kuhito-inc.github.io` |

リポジトリ内の `public/CNAME` がビルド成果物に含まれ、
Pages 側のカスタムドメインが自動設定される。

### 3-3. 初回デプロイ

`main` へ push（または Actions タブ → Deploy to GitHub Pages → Run workflow）。
DNS 伝播後 `https://docs.spojapanguild.net` でアクセス可能。
Pages 設定で **Enforce HTTPS** を有効化推奨。

---

## 4. 日常運用

`main` に push するだけで自動デプロイ。手動操作不要。
進捗は GitHub の **Actions** タブで確認。

---

## 5. ローカルでの確認

```bash
pnpm install

# 開発サーバー
pnpm dev --port 8002

# 本番と同じ静的ビルドを生成して確認
pnpm build                              # out/ に出力
cd out && python3 -m http.server 8003   # http://localhost:8003
```

---

## 6. 制約（静的エクスポートのため）

| 項目 | 状態 |
|---|---|
| SSR / 動的ルート | 不可（全ページ事前生成） |
| `next.config.mjs` の `headers`（セキュリティヘッダ） | **無効**。GitHub Pages はカスタムヘッダ非対応 |
| 動的 OG 画像 | 不可（`metadata` の固定画像URLを使用） |
| 検索 | 静的インデックス（Orama static）で動作 |

> セキュリティヘッダを付与したい場合は、Cloudflare 等の
> ヘッダ設定可能なホスト／プロキシを前段に置く必要がある。

---

## 7. トラブルシューティング

| 症状 | 対処 |
|---|---|
| `output: export` でビルド失敗 | 動的ルートに `dynamic = 'force-static'` が必要 |
| `_next` のCSS/JSが404 | `public/.nojekyll` の存在を確認 |
| カスタムドメインが効かない | DNS の CNAME / Pages 設定のカスタムドメイン欄を確認 |
| 検索が動かない | `pnpm build` で `out/api/search` が生成されているか確認 |

---

## 8. コマンド早見表

```bash
pnpm dev --port 8002                    # 開発サーバー
pnpm build                              # 静的ビルド（out/ 生成）
cd out && python3 -m http.server 8003   # ローカルで本番確認
```

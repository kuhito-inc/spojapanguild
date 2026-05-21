# GitHub Pages デプロイ マニュアル

SPO JAPAN GUILD ドキュメント（fumadocs / Next.js 16）を **静的サイト**として
ビルドし、GitHub Pages で配信する手順。`main` への push で
GitHub Actions が自動ビルド&デプロイする。

サーバー・第三者サービス・ビルドアダプタは不要。完全無料。

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
| `app/api/search/route.ts` | 検索を**静的インデックス**として出力（`staticGET`） |
| `app/layout.tsx` | `RootProvider` の検索を `type: 'static'` に設定 |
| `app/llms*.txt` ほか | `dynamic = 'force-static'` で静的化 |
| `public/CNAME` | 独自ドメイン `docs.spojapanguild.net` |
| `public/.nojekyll` | GitHub Pages の Jekyll 処理を無効化（`_next` 配信のため必須） |
| `.github/workflows/deploy.yml` | main push 時の自動ビルド&デプロイ |

> 動的 SSR 機能（動的OG画像ルート等）は静的化に伴い削除済み。
> ドキュメント閲覧・検索・OG画像（固定）はすべて動作する。

---

## 3. 初回セットアップ（1回だけ）

### 3-1. GitHub Pages を有効化

リポジトリ → **Settings** → **Pages**
→ **Build and deployment** → **Source** を **「GitHub Actions」** に設定

### 3-2. 独自ドメインの DNS 設定

ドメイン管理側（`spojapanguild.net` の DNS）で CNAME レコードを追加:

| Type | Name | Value |
|---|---|---|
| CNAME | `docs` | `kuhito-inc.github.io` |

> Apex ドメインではなくサブドメインなので CNAME でよい。
> リポジトリ内の `public/CNAME`（= `docs.spojapanguild.net`）が
> ビルド成果物に含まれ、Pages 側のカスタムドメインが自動設定される。

### 3-3. 初回デプロイ

`main` へ push（または **Actions** タブ → **Deploy to GitHub Pages**
→ **Run workflow**）で初回ビルドが走る。

DNS 伝播後、`https://docs.spojapanguild.net` でアクセス可能になる。
Pages 設定で **Enforce HTTPS** を有効化推奨。

---

## 4. 日常運用

`main` に push するだけで自動デプロイ。手動操作不要。

- 進捗確認: GitHub の **Actions** タブ
- 手動実行: Actions → Deploy to GitHub Pages → Run workflow

---

## 5. ローカルでの確認

```bash
pnpm install

# 開発サーバー（ホットリロード）
pnpm dev --port 8002

# 本番と同じ静的ビルドを生成して確認
pnpm build                       # out/ に出力
cd out && python3 -m http.server 8003
# http://localhost:8003
```

---

## 6. トラブルシューティング

| 症状 | 原因 / 対処 |
|---|---|
| `output: export` でビルド失敗 | 動的ルートに `dynamic = 'force-static'` が必要 |
| `_next` のCSS/JSが404 | `public/.nojekyll` が無い。存在を確認 |
| カスタムドメインが効かない | DNS の CNAME 設定 / Pages 設定のカスタムドメイン欄を確認 |
| 検索が動かない | `pnpm build` で `out/api/search` が生成されているか確認 |
| ビルドが `.source` 関連で失敗 | `pnpm install`（postinstall の `fumadocs-mdx`）を再実行 |

---

## 7. コマンド早見表

```bash
pnpm dev --port 8002              # 開発サーバー
pnpm build                        # 静的ビルド（out/ 生成）
cd out && python3 -m http.server 8003   # ローカルで本番確認
```

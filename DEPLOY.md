# Cloudflare デプロイ マニュアル

SPO JAPAN GUILD ドキュメント（fumadocs / Next.js 16）を Cloudflare Workers に
デプロイするための手順書。OpenNext アダプタ（`@opennextjs/cloudflare`）を使い、
SSR・検索・OG 画像・ミドルウェア（`proxy.ts`）をそのまま動かす。

---

## 1. 前提環境

ビルドツール（wrangler / OpenNext）の都合で **Node.js 20.19 以上（推奨: 22 LTS）** が必須。
Node v20.9 など古い版ではビルドが `ERR_IMPORT_ASSERTION_TYPE_MISSING` で失敗する。

| ツール | バージョン | 確認コマンド |
|---|---|---|
| Node.js | 22 LTS（最低 20.19） | `node --version` |
| pnpm | 10 系 | `pnpm --version` |
| Git | 任意 | `git --version` |

### Node.js 22 の導入（nvm 利用・sudo 不要）

```bash
# nvm インストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# シェル再読み込み
source ~/.bashrc

# Node 22 LTS をインストールして有効化
nvm install 22
nvm use 22
nvm alias default 22

node --version   # v22.x.x になっていることを確認
```

### pnpm の有効化

```bash
corepack enable pnpm
pnpm --version   # 10.x
```

> リポジトリの `package.json` に `"packageManager": "pnpm@10.28.2"` が指定済み。
> corepack がそのバージョンを自動で使う。

---

## 2. リポジトリ取得とセットアップ

```bash
git clone https://github.com/kuhito-inc/spojapanguild.git
cd spojapanguild

# Cloudflare 対応はこのブランチに入っている
git checkout feature/cloudflare-deploy

# 依存インストール（postinstall で fumadocs-mdx が走る）
pnpm install
```

---

## 3. リポジトリに含まれる Cloudflare 設定（変更不要）

このブランチには以下が設定済み。新規サーバーでは触らなくてよい。

| ファイル | 役割 |
|---|---|
| `wrangler.jsonc` | Worker 名 `spojapanguild-docs`、assets/images バインディング、互換フラグ |
| `open-next.config.ts` | OpenNext 最小構成 |
| `next.config.mjs` | `initOpenNextCloudflareForDev()` 追加（ローカル dev で CF バインディング利用） |
| `package.json` | `preview` / `deploy` / `cf-typegen` スクリプト |
| `public/_headers` | `/_next/static/*` の長期キャッシュ設定 |
| `.gitignore` | `.open-next` `.wrangler` `.dev.vars` `cloudflare-env.d.ts` を除外 |

---

## 4. ローカル動作確認

通常の開発サーバー（ホットリロード）:

```bash
pnpm dev --port 8002
# http://localhost:8002
```

Cloudflare Workers 環境を再現したプレビュー（本番に近い挙動）:

```bash
pnpm preview
# opennextjs-cloudflare build → ローカル Worker 起動
```

---

## 5. デプロイ方法

### 方式A: CLI から手動デプロイ

```bash
# 初回のみ: Cloudflare アカウント認証（ブラウザが開く）
pnpm exec wrangler login

# ビルド + デプロイ
pnpm deploy
```

ブラウザの無いサーバーでは API トークンを使う:

1. Cloudflare ダッシュボード → My Profile → API Tokens →
   「Edit Cloudflare Workers」テンプレートでトークン作成
2. 環境変数を設定してデプロイ:

```bash
export CLOUDFLARE_API_TOKEN=（作成したトークン）
export CLOUDFLARE_ACCOUNT_ID=（ダッシュボード右側のAccount ID）
pnpm deploy
```

### 方式B: Git 連携で自動デプロイ（推奨）

`main`（または任意ブランチ）への push で Cloudflare が自動ビルド&デプロイする。
GitHub Actions は不要。

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create**
2. **Import a repository** → GitHub 連携 → `kuhito-inc/spojapanguild` を選択
3. ビルド設定:
   - **Build command**: `pnpm deploy`
   - **Deploy command**: （空欄。build コマンド内の `opennextjs-cloudflare deploy` が実行する）
   - **Branch**: `main`（本番）
   - **Node version**: 環境変数 `NODE_VERSION` を `22` に設定
4. 保存すると初回ビルドが走る。以降は push のたびに自動デプロイ。

> プレビュー用ブランチ（例: `preview`）を別途指定すると、
> そのブランチ push でプレビュー URL に自動デプロイされる。

---

## 6. 独自ドメイン設定（任意）

`spojapanguild.net` のサブドメインを使う場合:

1. Cloudflare ダッシュボード → 対象 Worker → **Settings** → **Domains & Routes**
2. **Add** → **Custom Domain** → `docs.spojapanguild.net` を入力
3. ドメインが Cloudflare 管理下なら DNS は自動設定される

独自ドメインを使う場合 `basePath` は不要（ルート直下で配信）。

---

## 7. トラブルシューティング

| 症状 | 原因 / 対処 |
|---|---|
| `ERR_IMPORT_ASSERTION_TYPE_MISSING` | Node が古い。22 LTS に更新（手順1） |
| `opennextjs-cloudflare: command not found` | `pnpm install` 未実行 |
| デプロイ時に認証エラー | `wrangler login` 未実行、または API トークン未設定 |
| 検索が動かない | ビルド成果物の再生成。`.open-next` を削除して再ビルド |
| ビルドが `.source` 関連で失敗 | `pnpm install`（`postinstall` の `fumadocs-mdx`）を再実行 |

---

## 8. コマンド早見表

```bash
pnpm dev --port 8002   # 開発サーバー
pnpm preview           # CF Workers 環境でローカルプレビュー
pnpm deploy            # ビルド + 本番デプロイ
pnpm cf-typegen        # CF バインディングの型定義生成
```

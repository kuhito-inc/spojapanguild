import { createTokenizer } from '@orama/tokenizers/japanese';
import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// 静的エクスポート: 検索インデックスをビルド時に静的ファイルとして出力。
// 索引は Orama DB のダンプとして書き出されるため、サーバー側（索引構築）と
// クライアント側（クエリ実行・components/search-dialog.tsx）で同じ日本語
// トークナイザーを使う必要がある。
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  tokenizer: createTokenizer(),
});

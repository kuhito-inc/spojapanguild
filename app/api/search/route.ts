import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// 静的エクスポート: 検索インデックスをビルド時に静的ファイルとして出力
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

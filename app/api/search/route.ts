import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// 静的エクスポート: 検索インデックスをビルド時に静的ファイルとして出力。
// 日本語のトークナイズはクライアント側（components/search-dialog.tsx の
// initOrama）で行うため、ここでは language を指定しない。
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);

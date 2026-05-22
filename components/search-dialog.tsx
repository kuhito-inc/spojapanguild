'use client';

import { create } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/japanese';
import { useDocsSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

/**
 * 日本語トークナイザーで Orama インスタンスを生成する。
 * 既定の英語トークナイザーは空白で単語分割するため、空白のない日本語が
 * 検索できない。静的エクスポートではトークナイザーをクライアント側で
 * 指定する必要がある。
 */
function initOrama() {
  return create({
    schema: { _: 'string' },
    components: {
      tokenizer: createTokenizer(),
    },
  });
}

/** 日本語検索対応のカスタム検索ダイアログ（静的検索クライアント） */
export default function JapaneseSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    initOrama,
    search: {
      threshold: 0,
      tolerance: 0,
    },
  });

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}

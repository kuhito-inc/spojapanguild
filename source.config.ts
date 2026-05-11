import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { parseCodeBlockAttributes, rehypeCodeDefaultOptions, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

/** 開発時は Shiki を単一テーマにして巨大 MDX の初回コンパイルを短縮する（本番は従来どおりライト/ダーク） */
const isDev = process.env.NODE_ENV === 'development';

function rehypeCodeOptionsWithCustomMeta() {
  const parseMetaString = (meta: string) => {
    const parsed = parseCodeBlockAttributes(meta, ['title', 'tab', 'allowCopy', 'allowcopy', 'noCopy', 'nocopy']);
    const data: Record<string, unknown> = { ...parsed.attributes };

    if (data.allowCopy === 'false') data.allowCopy = false;
    if (data.allowCopy === 'true') data.allowCopy = true;
    if (data.allowcopy === 'false') data.allowcopy = false;
    if (data.allowcopy === 'true') data.allowcopy = true;
    if ('noCopy' in data || 'nocopy' in data) {
      data.allowCopy = false;
      data['data-no-copy'] = true;
      data.title ??= '期待される表示例：';
    }

    data.__raw = parsed.rest;
    return data;
  };

  if (isDev) {
    // `theme` だけだと Shiki の dual-slot 用に github-light が参照され未ロードで落ちる。
    // 両スロット同じテーマにするとハイライト負荷を抑えつつエラーを防ぐ。
    return {
      ...rehypeCodeDefaultOptions,
      themes: {
        light: 'github-dark',
        dark: 'github-dark',
      },
      parseMetaString,
    };
  }

  return {
    ...rehypeCodeDefaultOptions,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    parseMetaString,
  };
}

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkImageOptions: false,
    remarkPlugins: [remarkMdxMermaid],
    rehypeCodeOptions: rehypeCodeOptionsWithCustomMeta(),
  },
});

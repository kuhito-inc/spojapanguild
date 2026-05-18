import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { parseCodeBlockAttributes, rehypeCodeDefaultOptions, remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

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
      data.allowcopy = false;
      data['data-no-copy'] = true;
      data.title ??= '期待される表示例：';
    }

    data.__raw = parsed.rest;
    return data;
  };

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

'use client';

import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';

const DUMMY_ORIGIN = 'http://docs-link.normalize';

/** `/docs/**` のパスから `.md` と `.md/` を除去（`?.md`、`#`、`/` 直後の `.md/` に対応） */
function stripMdFromDocsPath(pathname: string): string {
  return pathname
    .replace(/\.md\//gi, '/')
    .replace(/\.md(?=\?|#|$)/gi, '');
}

/** クエリ・ハッシュを分割してパスのみ を transform して戻す */
function normalizeDocsPathAndQuery(fullPathQueryHash: string): string {
  const hashIdx = fullPathQueryHash.indexOf('#');
  const pathAndQuery = hashIdx === -1 ? fullPathQueryHash : fullPathQueryHash.slice(0, hashIdx);
  const hash = hashIdx === -1 ? '' : fullPathQueryHash.slice(hashIdx);

  const queryIdx = pathAndQuery.indexOf('?');
  const pathOnly = queryIdx === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIdx);
  const query = queryIdx === -1 ? '' : pathAndQuery.slice(queryIdx);

  const strippedPath = stripMdFromDocsPath(pathOnly);
  return strippedPath.replace(/\/{2,}/g, '/') + query + hash;
}

/**
 * Markdown `<a>` 用。
 * `./` など相対リンクを現在のページから `/docs/**` に解決し、`/docs` では `.md` 修飾子を除去する。
 */
function normalizeHref(href: string, pathname: string | null): string {
  // 同一ページ内アンカー
  if (!href || href.startsWith('#')) return href;

  // mailto:, https:, javascript: など
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return href;

  let pathQueryHash = href;

  if (!href.startsWith('/')) {
    const basePath = pathname?.startsWith('/docs') ? pathname : null;
    if (!basePath) return href;
    try {
      const resolved = new URL(href, `${DUMMY_ORIGIN}${basePath}`);
      pathQueryHash = resolved.pathname + resolved.search + resolved.hash;
    } catch {
      return href;
    }
  }

  if (!pathQueryHash.startsWith('/docs')) return pathQueryHash;

  return normalizeDocsPathAndQuery(pathQueryHash);
}

export function DocsMdxAnchor(props: ComponentPropsWithoutRef<typeof Link>) {
  const pathname = usePathname();
  const { href, ...rest } = props;

  if (typeof href !== 'string') {
    return <Link {...props} />;
  }

  const normalized = normalizeHref(href, pathname);
  return <Link {...rest} href={normalized} />;
}

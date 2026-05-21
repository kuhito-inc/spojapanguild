'use client';

import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';

const DUMMY_ORIGIN = 'http://docs-link.normalize';

const BLOCKED_PROTOCOL = /^(javascript|data|vbscript|file):/i;

function isBlockedHref(href: string): boolean {
  return BLOCKED_PROTOCOL.test(href.trim());
}

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

/** `/path#同じ#同じ` → `/path#同じ`（フラグメントがそのまま連結で重複している場合） */
function collapseDuplicateHashSegments(full: string): string {
  const i = full.indexOf('#');
  if (i === -1) return full;
  const before = full.slice(0, i + 1);
  const rest = full.slice(i + 1);
  const segments = rest.split('#').filter((s) => s.length > 0);
  if (segments.length < 2) return full;
  const head = segments[0]!;
  if (segments.every((s) => s === head)) {
    return before + head;
  }
  return full;
}

/**
 * Markdown `<a>` 用。
 * `./` など相対リンクを現在のページから `/docs/**` に解決し、`/docs` では `.md` 修飾子を除去する。
 */
function normalizeHref(href: string, pathname: string | null): string {
  // 同一ページ内アンカー
  if (!href || href.startsWith('#')) return href;

  // mailto:, https: など（javascript: / data: はブロック）
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) {
    return isBlockedHref(href) ? '#' : href;
  }

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

  let normalized = normalizeDocsPathAndQuery(pathQueryHash);
  // `/docs/...#4#4-見出し` のように番号が二重になったフラグメント先頭
  normalized = normalized.replace(/^(\/docs\/[^#]*)#(\d)#\2-/, '$1#$2-');
  return collapseDuplicateHashSegments(normalized);
}

export function DocsMdxAnchor(props: ComponentPropsWithoutRef<typeof Link>) {
  const pathname = usePathname();
  const { href, children, className, ...rest } = props;

  if (typeof href !== 'string') {
    return <Link {...props} />;
  }

  if (isBlockedHref(href)) {
    return (
      <span className={className} data-blocked-href>
        {children}
      </span>
    );
  }

  const normalized = normalizeHref(href, pathname);

  if (normalized === '#' || isBlockedHref(normalized)) {
    return (
      <span className={className} data-blocked-href>
        {children}
      </span>
    );
  }

  const hasFragment = normalized.includes('#');
  const opensNewTab = rest.target === '_blank';

  return (
    <Link
      {...rest}
      className={className}
      href={normalized}
      prefetch={hasFragment ? false : rest.prefetch}
      {...(opensNewTab ? { rel: rest.rel ?? 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  );
}

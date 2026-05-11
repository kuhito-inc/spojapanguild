'use client';

import { useEffect } from 'react';

/**
 * `#同一#同一` のようにフラグメントが連結で重複している場合のみ 1 つにまとめる。
 * Next / スクロール連動でアドレス欄だけ二重になるケースへの保険。
 */
export function DocsHashDuplicateSanitizer() {
  useEffect(() => {
    function dedupeDoubleFragment() {
      const { pathname, search, hash } = window.location;
      if (!hash || hash.indexOf('#', 1) === -1) return;

      const inner = hash.slice(1);
      const parts = inner.split('#').filter(Boolean);
      if (parts.length < 2) return;

      const head = parts[0]!;
      if (!parts.every((p) => p === head)) return;

      const next = `${pathname}${search}#${head}`;
      window.history.replaceState(null, '', next);
    }

    dedupeDoubleFragment();
    window.addEventListener('hashchange', dedupeDoubleFragment);
    return () => window.removeEventListener('hashchange', dedupeDoubleFragment);
  }, []);

  return null;
}

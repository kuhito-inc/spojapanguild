import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import { securityHeadersConfig } from './lib/security-headers.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    webpackMemoryOptimizations: true,
  },
  webpack(config, { dev, isServer }) {
    if (dev && isServer) {
      // Large generated MDX modules have expensive per-element development stack maps.
      // Preserve TS/TSX maps while omitting maps for compiled document bodies.
      for (const plugin of config.plugins ?? []) {
        if (plugin?.constructor?.name === 'EvalSourceMapDevToolPlugin') {
          plugin.options.exclude = /\.mdx(?:\?|$)/;
        }
      }
    }
    return config;
  },
  allowedDevOrigins: ['49.12.225.142'],
  // 全ページを dir/index.html 形式で出力（GitHub Pages の末尾スラッシュ対応）
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 静的 GitHub Pages では効かないが、next start / 将来のサーバー配信向け。
  headers: securityHeadersConfig(),
};

export default (phase) => withMDX({
  ...config,
  // 開発時の未知のURLは通常の404にする。本番はGitHub Pages向けに書き出す。
  ...(phase === PHASE_DEVELOPMENT_SERVER ? {} : { output: 'export' }),
});

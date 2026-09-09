import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['49.12.225.142'],
  // 全ページを dir/index.html 形式で出力（GitHub Pages の末尾スラッシュ対応）
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default (phase) => withMDX({
  ...config,
  // 開発時の未知のURLは通常の404にする。本番はGitHub Pages向けに書き出す。
  ...(phase === PHASE_DEVELOPMENT_SERVER ? {} : { output: 'export' }),
});

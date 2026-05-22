import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['49.12.225.142'],
  // GitHub Pages 向け静的エクスポート
  output: 'export',
  // 全ページを dir/index.html 形式で出力（GitHub Pages の末尾スラッシュ対応）
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);

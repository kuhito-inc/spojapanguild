import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['49.12.225.142'],
  // GitHub Pages 向け静的エクスポート
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);

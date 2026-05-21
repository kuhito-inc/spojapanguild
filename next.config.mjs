import { createMDX } from 'fumadocs-mdx/next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Cloudflare バインディングをローカル `next dev` で利用可能にする
initOpenNextCloudflareForDev();

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['49.12.225.142'],
};

export default withMDX(config);

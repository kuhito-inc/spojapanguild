import { createMDX } from 'fumadocs-mdx/next';
import { securityHeadersConfig } from './lib/security-headers.mjs';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: ['49.12.225.142'],
  headers: securityHeadersConfig(),
};

export default withMDX(config);

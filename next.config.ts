import type { NextConfig } from 'next';
import { DEFAULT_LOCALE } from './src/i18n/config';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Root layout lives under [locale], so unmatched URLs need app/global-not-found.tsx.
    globalNotFound: true
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      }
    }
  },
  // The default locale lives at the site root: serve it there and fold its prefix into it.
  // Keep the redirect exact: "/ar/:path*" would also catch /ar/… asset routes.
  async rewrites() {
    return [{ source: '/', destination: `/${DEFAULT_LOCALE}` }];
  },
  async redirects() {
    return [
      { source: `/${DEFAULT_LOCALE}`, destination: '/', permanent: true }
    ];
  }
};

export default nextConfig;

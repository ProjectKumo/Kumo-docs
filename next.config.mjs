import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      // Welcome was previously its own tab in a `(welcome)/` folder group.
      // After the merge, /docs lands on the For Everyone track which now
      // owns the combined intro + "first hour" + quick-links content.
      {
        source: '/docs',
        destination: '/docs/for-everyone',
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);

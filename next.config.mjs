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
      // After the merge, `/<lang>/docs` lands on the For Everyone track which
      // now owns the combined intro + "first hour" + quick-links content.
      //
      // The lang segment is matched explicitly so un-prefixed `/docs` is left
      // to the i18n proxy middleware (which redirects to `/en/docs` first,
      // then this rule catches the lang-prefixed URL and forwards it on).
      {
        source: '/:lang(en|zh-CN)/docs',
        destination: '/:lang/docs/for-everyone',
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);

import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const withMDX = createMDX();

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Slug renames inside the Getting Started track (formerly "for-everyone").
 * Map from old slug → new slug. The folder itself is also renamed below.
 */
const gettingStartedSlugRenames = {
  'first-connection': 'subscriptions',
  everyday: 'daily-use',
  'switching-modes': 'outbound-modes',
  updating: 'updates',
};

/**
 * Slug renames inside the Advanced track (formerly "power-user").
 */
const advancedSlugRenames = {
  'profiles-deep-dive': 'profiles-reference',
  'sub-store-advanced': 'sub-store-hosting',
};

/**
 * Slug renames inside the Contributing track (folder itself unchanged).
 */
const contributingSlugRenames = {
  'repository-tour': 'repository-layout',
  'file-an-issue': 'issues',
  'writing-docs': 'documentation',
};

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    const langSegment = '/:lang(en|zh-CN)';
    const slugRedirects = [];

    // Folder + slug renames inside each track. Specific slug renames go first
    // so they win over the catch-all folder rename below.
    for (const [oldSlug, newSlug] of Object.entries(gettingStartedSlugRenames)) {
      slugRedirects.push({
        source: `${langSegment}/docs/for-everyone/${oldSlug}`,
        destination: `${langSegment}/docs/getting-started/${newSlug}`,
        permanent: true,
      });
    }
    for (const [oldSlug, newSlug] of Object.entries(advancedSlugRenames)) {
      slugRedirects.push({
        source: `${langSegment}/docs/power-user/${oldSlug}`,
        destination: `${langSegment}/docs/advanced/${newSlug}`,
        permanent: true,
      });
    }
    for (const [oldSlug, newSlug] of Object.entries(contributingSlugRenames)) {
      slugRedirects.push({
        source: `${langSegment}/docs/contributing/${oldSlug}`,
        destination: `${langSegment}/docs/contributing/${newSlug}`,
        permanent: true,
      });
    }

    return [
      // Welcome was previously its own tab in a `(welcome)/` folder group.
      // After the merge, `/<lang>/docs` lands on the Getting Started track
      // (formerly "for-everyone") which now owns the combined intro +
      // "first hour" + quick-links content.
      //
      // The lang segment is matched explicitly so un-prefixed `/docs` is left
      // to the i18n proxy middleware (which redirects to `/en/docs` first,
      // then this rule catches the lang-prefixed URL and forwards it on).
      {
        source: `${langSegment}/docs`,
        destination: `${langSegment}/docs/getting-started`,
        permanent: false,
      },

      // Slug renames (must run before the catch-all folder redirects below).
      ...slugRedirects,

      // Folder renames: for-everyone → getting-started, power-user → advanced.
      // The trailing `:path*` catches any slug that did not match the specific
      // rename rules above (e.g. unchanged slugs like `install` or `faq`).
      {
        source: `${langSegment}/docs/for-everyone/:path*`,
        destination: `${langSegment}/docs/getting-started/:path*`,
        permanent: true,
      },
      {
        source: `${langSegment}/docs/for-everyone`,
        destination: `${langSegment}/docs/getting-started`,
        permanent: true,
      },
      {
        source: `${langSegment}/docs/power-user/:path*`,
        destination: `${langSegment}/docs/advanced/:path*`,
        permanent: true,
      },
      {
        source: `${langSegment}/docs/power-user`,
        destination: `${langSegment}/docs/advanced`,
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);

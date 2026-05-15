# Kumo Docs

User documentation for [Kumo](https://github.com/ProjectKumo/KumoApp) — a calm,
native macOS client for the [Mihomo](https://github.com/MetaCubeX/mihomo) proxy
core. This site is built with [Fumadocs](https://fumadocs.dev) on Next.js.

## Develop

Requires Node 18+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> to browse the site and `/docs` to read the docs.

## Project Layout

| Path                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `app/(home)`                  | Marketing / landing route group.                     |
| `app/docs`                    | Documentation layout and `[[...slug]]` page.         |
| `app/api/search/route.ts`     | Local Orama search index.                            |
| `content/docs/**/*.mdx`       | Authoring surface. One MDX file per docs page.       |
| `content/docs/**/meta.json`   | Per-folder navigation order and group titles.        |
| `lib/source.ts`               | Fumadocs source-API loader.                          |
| `lib/layout.shared.tsx`       | Shared header / nav for docs and home.               |
| `lib/shared.ts`               | App name and GitHub config used by layouts and OG.   |
| `source.config.ts`            | Fumadocs MDX configuration and Zod schemas.          |

## Writing Docs

Create a new `.mdx` file under `content/docs/`. The frontmatter schema is:

```mdx
---
title: Page title
description: One-line summary used in navigation and OG cards.
---
```

To add a navigation group, add a `meta.json` next to the pages:

```json
{
  "title": "Group title",
  "pages": ["index", "another-page"]
}
```

See the [Fumadocs page conventions](https://fumadocs.dev/docs/mdx/page) guide
for the full schema.

## Cross-Verification Policy

User-facing documentation in `content/docs/` should reflect the behavior in the
[KumoApp repository](https://github.com/ProjectKumo/KumoApp). When a change in
KumoApp meaningfully alters product behavior (CLI commands, navigation, paths,
permissions, persistence, runtime configuration), update the corresponding page
in the same change set. Each user-visible CLI command, app destination, and
file path documented here is cross-referenced against `docs/` and the source
under `Sources/` in KumoApp.

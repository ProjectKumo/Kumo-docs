/**
 * Map a Fumadocs node path (like "getting-started/install") to a section key
 * that the docs sidebar tabs use to colour their icons.
 *
 * The returned key is matched against the CSS custom property
 * `--<section>-color` defined in `app/global.css`.
 *
 * `getting-started` is the docs root tab (visiting /docs now redirects there),
 * so any path that does not start with a known track directory falls back
 * to `getting-started` rather than a dedicated welcome key.
 */
export function getSection(path: string | undefined): string {
  if (!path) return 'getting-started';
  const [dir] = path.split('/', 1);
  if (!dir) return 'getting-started';
  return (
    {
      'getting-started': 'getting-started',
      advanced: 'advanced',
      contributing: 'contributing',
      internals: 'internals',
      roadmap: 'roadmap',
    }[dir] ?? 'getting-started'
  );
}

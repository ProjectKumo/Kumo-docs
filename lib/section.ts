/**
 * Map a Fumadocs node path (like "for-everyone/install") to a section key
 * that the docs sidebar tabs use to colour their icons.
 *
 * The returned key is matched against the CSS custom property
 * `--<section>-color` defined in `app/global.css`.
 *
 * `for-everyone` is the docs root tab (visiting /docs now redirects there),
 * so any path that does not start with a known track directory falls back
 * to `for-everyone` rather than a dedicated welcome key.
 */
export function getSection(path: string | undefined): string {
  if (!path) return 'for-everyone';
  const [dir] = path.split('/', 1);
  if (!dir) return 'for-everyone';
  return (
    {
      'for-everyone': 'for-everyone',
      'power-user': 'power-user',
      contributing: 'contributing',
      internals: 'internals',
      roadmap: 'roadmap',
    }[dir] ?? 'for-everyone'
  );
}

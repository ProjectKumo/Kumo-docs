/**
 * Map a Fumadocs node path (like "for-everyone/install") to a section key
 * that the docs sidebar tabs use to colour their icons.
 *
 * The returned key is matched against the CSS custom property
 * `--<section>-color` defined in `app/global.css`.
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
    }[dir] ?? 'for-everyone'
  );
}

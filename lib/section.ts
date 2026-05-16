/**
 * Map a Fumadocs node path (like "for-everyone/install") to a section key
 * that the docs sidebar tabs use to colour their icons.
 *
 * The returned key is matched against the CSS custom property
 * `--<section>-color` defined in `app/global.css`.
 *
 * The Welcome tab lives in a `(welcome)` folder group; Fumadocs strips the
 * parens from the URL but keeps them in the node path. Anything that does
 * not start with a known track directory is treated as the welcome page
 * (which has no dedicated colour and falls back to the default foreground).
 */
export function getSection(path: string | undefined): string {
  if (!path) return 'welcome';
  const [dir] = path.split('/', 1);
  if (!dir) return 'welcome';
  return (
    {
      'for-everyone': 'for-everyone',
      'power-user': 'power-user',
      contributing: 'contributing',
      internals: 'internals',
      roadmap: 'roadmap',
    }[dir] ?? 'welcome'
  );
}

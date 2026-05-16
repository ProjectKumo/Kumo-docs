import { productGitConfig } from './shared';

export type Platform = 'macos-arm64' | 'macos-x64' | 'windows-x64' | 'windows-arm64' | 'linux-x64' | 'linux-arm64';

export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
  contentType: string;
}

export interface LatestRelease {
  tag: string;
  name: string;
  publishedAt: string;
  releaseUrl: string;
  assets: ReleaseAsset[];
  /** Asset matched to each platform (undefined when no build is published for that platform). */
  byPlatform: Partial<Record<Platform, ReleaseAsset>>;
}

interface RawAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

interface RawRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: RawAsset[];
}

/**
 * Match a GitHub Release asset filename to a platform we surface on /download.
 *
 * Conventions we accept (case-insensitive):
 *  - macOS arm64:   `*mac*arm64*.dmg` | `*macos*arm64*.dmg` | `*darwin*arm64*` | `*aarch64*mac*`
 *  - macOS x64:     `*mac*x64*.dmg`   | `*macos*x86_64*.dmg` | `*darwin*x64*` | `*amd64*mac*`
 *  - Windows x64:   `*windows*x64*.exe` | `*win*amd64*.exe` | `*win*x86_64*.msi`
 *  - Windows arm64: `*windows*arm64*.exe`
 *  - Linux x64:     `*linux*x64*` | `*linux*amd64*` | `*linux*x86_64*`
 *  - Linux arm64:   `*linux*arm64*` | `*linux*aarch64*`
 *
 * The first asset that matches a platform wins (so naming order in releases doesn't matter).
 */
export function matchAssetPlatform(name: string): Platform | null {
  const n = name.toLowerCase();

  const isMac = /(^|[-._/])(mac(os)?|darwin|osx)([-._/]|$)/.test(n);
  const isWin = /(^|[-._/])(win(dows)?)([-._/]|$)/.test(n);
  const isLinux = /(^|[-._/])linux([-._/]|$)/.test(n);

  const isArm64 = /(^|[-._/])(arm64|aarch64|apple-?silicon)([-._/]|$)/.test(n);
  const isX64 = /(^|[-._/])(x64|x86_64|amd64|intel)([-._/]|$)/.test(n);

  if (isMac) {
    if (isArm64) return 'macos-arm64';
    if (isX64) return 'macos-x64';
    return null;
  }
  if (isWin) {
    if (isArm64) return 'windows-arm64';
    if (isX64) return 'windows-x64';
    return null;
  }
  if (isLinux) {
    if (isArm64) return 'linux-arm64';
    if (isX64) return 'linux-x64';
    return null;
  }
  return null;
}

/** Pretty label for a platform. */
export function platformLabel(p: Platform): string {
  switch (p) {
    case 'macos-arm64':
      return 'macOS · Apple Silicon';
    case 'macos-x64':
      return 'macOS · Intel';
    case 'windows-x64':
      return 'Windows · x64';
    case 'windows-arm64':
      return 'Windows · ARM64';
    case 'linux-x64':
      return 'Linux · x64';
    case 'linux-arm64':
      return 'Linux · ARM64';
  }
}

/** OS family for a platform. */
export function platformOS(p: Platform): 'macos' | 'windows' | 'linux' {
  if (p.startsWith('macos')) return 'macos';
  if (p.startsWith('windows')) return 'windows';
  return 'linux';
}

const PLATFORM_ORDER: Platform[] = [
  'macos-arm64',
  'macos-x64',
  'windows-x64',
  'windows-arm64',
  'linux-x64',
  'linux-arm64',
];

export function sortPlatforms(platforms: Platform[]): Platform[] {
  return [...platforms].sort(
    (a, b) => PLATFORM_ORDER.indexOf(a) - PLATFORM_ORDER.indexOf(b),
  );
}

/**
 * Fetch the latest published GitHub Release for the product repo
 * and map its assets to platforms we surface.
 *
 * Cached with Next's fetch revalidation (1 hour). Returns null if the
 * upstream call fails, so the page can degrade gracefully.
 *
 * If `GITHUB_TOKEN` (or `GH_TOKEN`) is present in the environment, we
 * authenticate the call to raise the rate limit from 60/hr (anonymous)
 * to 5000/hr — important when this page is rendered from a shared
 * egress IP (Cloudflare Pages, Vercel, etc.).
 */
export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  const { user, repo } = productGitConfig;
  const url = `https://api.github.com/repos/${user}/${repo}/releases/latest`;

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': `${user}-${repo}-docs`,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawRelease;

    const assets: ReleaseAsset[] = data.assets.map((a) => ({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
      contentType: a.content_type,
    }));

    const byPlatform: Partial<Record<Platform, ReleaseAsset>> = {};
    for (const asset of assets) {
      const platform = matchAssetPlatform(asset.name);
      if (platform && !byPlatform[platform]) {
        byPlatform[platform] = asset;
      }
    }

    return {
      tag: data.tag_name,
      name: data.name || data.tag_name,
      publishedAt: data.published_at,
      releaseUrl: data.html_url,
      assets,
      byPlatform,
    };
  } catch {
    return null;
  }
}

/** Format a byte count as a short MB/GB string. */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

'use client';

import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { SiApple, SiLinux } from 'react-icons/si';
import type { LatestRelease, Platform } from '@/lib/releases';
import {
  formatSize,
  platformLabel,
  platformOS,
  sortPlatforms,
} from '@/lib/releases';

interface DownloadClientProps {
  release: LatestRelease | null;
  releasesUrl: string;
}

type DetectionState =
  | { kind: 'pending' }
  | { kind: 'unknown' }
  | { kind: 'detected'; platform: Platform };

/**
 * Detect the visitor's platform via UA-Client-Hints if available,
 * otherwise fall back to the userAgent string and `navigator.platform`.
 *
 * We never reach for a server header here — we want this to work even when
 * served as a static page (Cloudflare Pages can strip Sec-CH-* headers
 * before they reach a route handler in some cases).
 */
async function detectPlatform(): Promise<Platform | null> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let architecture: string | undefined;
  let os: 'macos' | 'windows' | 'linux' | undefined;

  // Modern Chromium exposes high-entropy UA-CH; ask for architecture so we can
  // distinguish Apple Silicon from Intel and ARM64 Windows from x64 Windows.
  // Spec: https://wicg.github.io/ua-client-hints/
  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
      getHighEntropyValues?: (hints: string[]) => Promise<{
        architecture?: string;
        bitness?: string;
        platform?: string;
      }>;
    };
  };

  if (nav.userAgentData?.getHighEntropyValues) {
    try {
      const high = await nav.userAgentData.getHighEntropyValues([
        'architecture',
        'bitness',
        'platform',
      ]);
      const p = (high.platform ?? nav.userAgentData.platform ?? '').toLowerCase();
      if (p.includes('mac')) os = 'macos';
      else if (p.includes('win')) os = 'windows';
      else if (p.includes('linux') || p.includes('chrome os')) os = 'linux';

      architecture = high.architecture?.toLowerCase();
      // UA-CH exposes a small set of values; normalize them to our two slots.
      // See https://wicg.github.io/ua-client-hints/#sec-ch-ua-arch
      if (architecture === 'arm' || architecture === 'aarch64') architecture = 'arm64';
      else if (architecture === 'x86' || architecture === 'x86_64') architecture = 'x64';
    } catch {
      // ignore — fall through to UA sniffing
    }
  }

  // Fallback: parse the legacy userAgent + navigator.platform
  if (!os) {
    const lower = ua.toLowerCase();
    if (/mac|darwin/.test(lower)) os = 'macos';
    else if (/win/.test(lower)) os = 'windows';
    else if (/linux|x11/.test(lower)) os = 'linux';
  }

  if (!architecture) {
    const lower = ua.toLowerCase();
    if (/arm64|aarch64/.test(lower)) architecture = 'arm64';
    else if (/x64|x86_64|wow64|win64|amd64/.test(lower)) architecture = 'x64';
    // Safari on Intel Macs emits "Macintosh; Intel Mac OS X 10_15_7" — no x64
    // token, but "intel" appears as its own word. Treat that as x64 so we
    // don't misroute Intel Mac users to an Apple Silicon DMG.
    else if (os === 'macos' && /\bintel\b/.test(lower)) architecture = 'x64';
  }

  if (!os) return null;

  // Best-effort default architecture per OS: Apple has shipped only Apple Silicon
  // Macs for years and most desktop installs are x64 on Windows/Linux. We still
  // surface the other slot in the matrix below.
  if (os === 'macos') {
    if (architecture === 'x64') return 'macos-x64';
    return 'macos-arm64';
  }
  if (os === 'windows') {
    if (architecture === 'arm64') return 'windows-arm64';
    return 'windows-x64';
  }
  if (architecture === 'arm64') return 'linux-arm64';
  return 'linux-x64';
}

// Simple Icons dropped the Windows mark in 2022 over brand-rights concerns,
// so we inline the canonical 4-square logo here as a static SVG to keep the
// macOS / Windows / Linux trio visually consistent (all filled brand glyphs).
function SiWindowsLegacy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"
      />
    </svg>
  );
}

type OsIcon = ComponentType<SVGProps<SVGSVGElement>>;

const OS_ICON: Record<'macos' | 'windows' | 'linux', OsIcon> = {
  macos: SiApple,
  windows: SiWindowsLegacy,
  linux: SiLinux,
};

const OS_LABEL: Record<'macos' | 'windows' | 'linux', string> = {
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux',
};

export function DownloadClient({ release, releasesUrl }: DownloadClientProps) {
  const [detection, setDetection] = useState<DetectionState>({ kind: 'pending' });

  useEffect(() => {
    let alive = true;
    detectPlatform().then((p) => {
      if (!alive) return;
      setDetection(p ? { kind: 'detected', platform: p } : { kind: 'unknown' });
    });
    return () => {
      alive = false;
    };
  }, []);

  const allPlatforms: Platform[] = [
    'macos-arm64',
    'macos-x64',
    'windows-x64',
    'windows-arm64',
    'linux-x64',
    'linux-arm64',
  ];

  const detected = detection.kind === 'detected' ? detection.platform : null;
  const detectedAsset = detected && release ? release.byPlatform[detected] : null;

  return (
    <div className="flex flex-col gap-10">
      <PrimaryCTA
        detection={detection}
        detectedAsset={detectedAsset ?? null}
        detectedPlatform={detected}
        release={release}
        releasesUrl={releasesUrl}
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">All platforms</h2>
          {release ? (
            <p className="text-sm text-fd-muted-foreground">
              {release.name} · published{' '}
              {new Date(release.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          ) : null}
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortPlatforms(allPlatforms).map((platform) => {
            const asset = release?.byPlatform[platform];
            const isCurrent = detected === platform;
            const os = platformOS(platform);
            const OsIcon = OS_ICON[os];
            return (
              <li
                key={platform}
                className={`rounded-lg border p-4 transition-colors ${
                  isCurrent
                    ? 'border-fd-primary bg-fd-primary/5'
                    : 'border-fd-border bg-fd-card hover:bg-fd-accent/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-fd-muted-foreground">
                    <OsIcon
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />
                    {OS_LABEL[os]}
                  </span>
                  {isCurrent ? (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-fd-primary">
                      your platform
                    </span>
                  ) : null}
                </div>
                <p className="font-medium mb-3">{platformLabel(platform)}</p>
                {asset ? (
                  <a
                    href={asset.url}
                    className="inline-flex items-center gap-1 text-sm font-medium text-fd-primary hover:underline"
                  >
                    Download {asset.name.split('.').pop()?.toUpperCase()}
                    <span className="text-fd-muted-foreground font-normal">
                      ({formatSize(asset.size)})
                    </span>
                  </a>
                ) : (
                  <p className="text-sm text-fd-muted-foreground">
                    Not yet available
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-sm text-fd-muted-foreground">
          Looking for an older version or full release notes?{' '}
          <a
            href={releasesUrl}
            className="text-fd-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            View all releases on GitHub →
          </a>
        </p>
      </section>
    </div>
  );
}

interface PrimaryCTAProps {
  detection: DetectionState;
  detectedPlatform: Platform | null;
  detectedAsset: LatestRelease['byPlatform'][Platform] | null;
  release: LatestRelease | null;
  releasesUrl: string;
}

function PrimaryCTA({
  detection,
  detectedPlatform,
  detectedAsset,
  release,
  releasesUrl,
}: PrimaryCTAProps) {
  if (!release) {
    return (
      <div className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 items-start">
        <p className="text-fd-muted-foreground">
          We couldn&apos;t load the latest release just now.
        </p>
        <a
          href={releasesUrl}
          className="rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90"
          target="_blank"
          rel="noreferrer"
        >
          Open releases on GitHub →
        </a>
      </div>
    );
  }

  if (detection.kind === 'pending') {
    return (
      <div
        className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 items-start"
        aria-live="polite"
      >
        <p className="text-fd-muted-foreground">Detecting your platform…</p>
      </div>
    );
  }

  if (detection.kind === 'unknown' || !detectedPlatform) {
    return (
      <div className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 items-start">
        <p className="text-fd-muted-foreground">
          We couldn&apos;t detect your platform. Pick the right build below, or
          browse the full release list:
        </p>
        <a
          href={releasesUrl}
          className="rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90"
          target="_blank"
          rel="noreferrer"
        >
          View releases on GitHub →
        </a>
      </div>
    );
  }

  const label = platformLabel(detectedPlatform);

  if (!detectedAsset) {
    return (
      <div className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 items-start">
        <p className="text-sm uppercase tracking-wider text-fd-muted-foreground">
          Detected: {label}
        </p>
        <p>
          A build for <strong>{label}</strong> isn&apos;t published yet in{' '}
          <code>{release.tag}</code>. Pick another platform below, or watch the
          repo for new builds.
        </p>
        <a
          href={releasesUrl}
          className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium hover:bg-fd-accent"
          target="_blank"
          rel="noreferrer"
        >
          Watch on GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col gap-3 items-start">
      <p className="text-sm uppercase tracking-wider text-fd-muted-foreground">
        Detected: {label} · {release.name}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">
        Download Kumo for {label}
      </h2>
      <p className="text-fd-muted-foreground">
        {detectedAsset.name} · {formatSize(detectedAsset.size)}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={detectedAsset.url}
          className="rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Download {release.tag}
        </a>
        <a
          href={releasesUrl}
          className="rounded-full border border-fd-border px-5 py-2.5 text-sm font-medium hover:bg-fd-accent"
          target="_blank"
          rel="noreferrer"
        >
          Release notes
        </a>
      </div>
    </div>
  );
}

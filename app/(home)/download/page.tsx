import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchLatestRelease } from '@/lib/releases';
import { appName, productGitConfig } from '@/lib/shared';
import { DownloadClient } from './download-client';

export const revalidate = 3600;

const releasesUrl = `https://github.com/${productGitConfig.user}/${productGitConfig.repo}/releases`;

export const metadata: Metadata = {
  title: `Download ${appName}`,
  description:
    'Get the latest Kumo build for your platform — auto-detected from your browser, with every other platform a click away.',
  openGraph: {
    title: `Download ${appName}`,
    description:
      'Get the latest Kumo build for your platform — auto-detected from your browser, with every other platform a click away.',
  },
};

export default async function DownloadPage() {
  const release = await fetchLatestRelease();

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-fd-muted-foreground uppercase tracking-widest text-xs">
            Downloads
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Install Kumo
          </h1>
          <p className="text-fd-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            We detect your platform and surface the matching build from the
            latest GitHub release. Other platforms are listed below — pick the
            one that fits the machine you actually want to install on.
          </p>
        </header>

        <DownloadClient release={release} releasesUrl={releasesUrl} />

        <footer className="text-sm text-fd-muted-foreground border-t border-fd-border pt-6 flex flex-col gap-2">
          <p>
            Need installation help?{' '}
            <Link href="/docs/for-everyone/install" className="text-fd-primary hover:underline">
              Read the install guide
            </Link>
            .
          </p>
          <p>
            Prefer the command line? Power users can install via Homebrew or
            build from source — see{' '}
            <Link
              href="/docs/power-user/command-line"
              className="text-fd-primary hover:underline"
            >
              Command line
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}

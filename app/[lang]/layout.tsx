import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import '../global.css';
import { Inter } from 'next/font/google';
import { i18nUI } from '@/lib/layout.shared';

const inter = Inter({
  subsets: ['latin'],
});

const siteTitle = 'Kumo — a calm proxy app for Mac';
const siteDescription =
  'Kumo is a native macOS proxy client built on Mihomo. Learn how to install, configure, and extend Kumo.';
const bannerImage = {
  url: '/kumo-banner.png',
  width: 2560,
  height: 1280,
  alt: 'Kumo — a calm proxy app for Mac',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kumo-docs.pages.dev'),
  title: {
    default: siteTitle,
    template: '%s · Kumo Docs',
  },
  description: siteDescription,
  applicationName: 'Kumo Docs',
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: 'Kumo Docs',
    type: 'website',
    images: [bannerImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [bannerImage],
  },
};

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider i18n={i18nUI.provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}

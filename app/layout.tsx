import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kumo-docs.pages.dev'),
  title: {
    default: 'Kumo — a calm proxy app for Mac',
    template: '%s · Kumo Docs',
  },
  description:
    'Kumo is a native macOS proxy client built on Mihomo. Learn how to install, configure, and extend Kumo.',
  applicationName: 'Kumo Docs',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

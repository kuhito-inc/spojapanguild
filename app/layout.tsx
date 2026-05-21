import { GoogleAnalyticsConsent } from '@/components/google-analytics-consent';
import { SiteFooter } from '@/components/site-footer';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

const ogImageUrl = 'https://spojapanguild.net/wp-content/uploads/2026/05/ogp2026.png';

export const metadata: Metadata = {
  metadataBase: new URL('https://spojapanguild.net'),
  title: {
    default: 'SPO JAPAN GUILD ドキュメント',
    template: '%s | SPO JAPAN GUILD ドキュメント',
  },
  description:
    'SPO JAPAN GUILD監修のステークプール構築ガイド。私たちは日本におけるステークプール構築を促進しカルダノ分散化に貢献してまいります。',
  openGraph: {
    title: 'SPO JAPAN GUILD ドキュメント',
    description: 'Cardano / Midnight インフラ構築・運用ガイド',
    url: '/',
    siteName: 'SPO JAPAN GUILD',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'SPO JAPAN GUILD ドキュメント',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPO JAPAN GUILD ドキュメント',
    description: 'Cardano / Midnight インフラ構築・運用ガイド',
    images: [ogImageUrl],
  },
  icons: {
    icon: [{ url: '/images/favicon.png', type: 'image/png' }],
    apple: '/images/favicon.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>
          <div className="flex min-h-screen flex-1 flex-col">
            <div className="flex flex-1 flex-col">{children}</div>
            <SiteFooter />
          </div>
        </RootProvider>
        <GoogleAnalyticsConsent />
      </body>
    </html>
  );
}

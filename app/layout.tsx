import { SiteFooter } from '@/components/site-footer';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://spojapanguild.net'),
  title: {
    default: 'SPO JAPAN GUILD DOCS',
    template: '%s | SPO JAPAN GUILD DOCS',
  },
  description:
    'SPO JAPAN GUILD監修のステークプール構築ガイド。私たちは日本におけるステークプール構築を促進しカルダノ分散化に貢献してまいります。',
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
      </body>
    </html>
  );
}

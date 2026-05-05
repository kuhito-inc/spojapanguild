import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SPO JAPAN GUILD DOCS',
    template: '%s | SPO JAPAN GUILD DOCS',
  },
  description: 'SPO JAPAN GUILD監修のステークプール構築ガイド。私たちは日本におけるステークプール構築を促進しカルダノ分散化に貢献してまいります。',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

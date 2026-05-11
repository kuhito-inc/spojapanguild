import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={source.getPageTree()}
      sidebar={{
        /** サイドバー直下〜子フォルダを初期表示で開く（未指定時は 0 でほぼ閉じた状態） */
        defaultOpenLevel: 2,
      }}
    >
      {children}
    </DocsLayout>
  );
}

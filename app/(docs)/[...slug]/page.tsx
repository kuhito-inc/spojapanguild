import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';

const ogImageUrl = 'https://spojapanguild.net/wp-content/uploads/2026/05/ogp2026.png';
const legacyPageSlugs: Record<string, string[]> = {
  'cardano/operation/create-a-lace-wallet': ['cardano', 'operation', 'create-a-lace-chrome'],
};
const staticNotFoundSlugs = [['favicon.ico']];

export const dynamicParams = false;

function resolvePageSlug(slug: string[]) {
  return legacyPageSlugs[slug.join('/')] ?? slug;
}

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(resolvePageSlug(params.slug));
  if (!page) notFound();

  const MDX = page.data.body;
  const lastModified =
    'lastModified' in page.data && page.data.lastModified
      ? new Date(page.data.lastModified as string | Date)
      : null;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: 'clerk' }}
      tableOfContentPopover={{ style: 'clerk' }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
      {lastModified && <PageLastUpdate date={lastModified} className="mt-10" />}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return [
    ...source.generateParams(),
    ...Object.keys(legacyPageSlugs).map((slug) => ({ slug: slug.split('/') })),
    ...staticNotFoundSlugs.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(resolvePageSlug(params.slug));
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl],
    },
  };
}

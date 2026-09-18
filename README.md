# sjg-docs

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

## Documentation links

Use root-relative page URLs such as `/cardano/setup/node-setup#sec-15` in MDX.
Published URLs have trailing slashes, so `./cardano/...` would resolve beneath
the current page. Do not include `.md` or `/index` in page URLs.

Keep existing explicit heading IDs (`[#sec-15]`, etc.) when moving or inserting
headings. Give new headings a unique, descriptive ID rather than renumbering
existing IDs. Check link text against the target heading when changing content:
an existing ID can still point to the wrong section.

Run `pnpm build` followed by `pnpm docs:check-links` before publishing. The latter
checks the exported HTML for missing internal pages, anchors, local assets, and
duplicate IDs. The deployment workflow runs this check before uploading the site.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs

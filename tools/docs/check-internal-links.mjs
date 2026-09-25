/** Check the actual HTML exported by `pnpm build`, including navigation and TOCs. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const exportRoot = path.resolve(process.argv[2] ?? path.join(repoRoot, 'out'));
const origin = `https://${fs.readFileSync(path.join(repoRoot, 'public/CNAME'), 'utf8').trim()}`;
const siteHost = new URL(origin).host;

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(filename);
    else if (entry.name.endsWith('.html')) yield filename;
  }
}

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
  // Template contents are inert and are not document fragment destinations.
}

function routeFor(filename) {
  return `/${path.relative(exportRoot, filename).split(path.sep).join('/')}`
    .replace(/\/index\.html$/, '/');
}

const pages = new Map();
const failures = new Set();
let checkedLinks = 0;

function fail(route, message) {
  failures.add(`${route}: ${message}`);
}

if (!fs.existsSync(exportRoot)) {
  console.error('Static export not found. Run pnpm build before pnpm docs:check-links.');
  process.exit(1);
}

for (const filename of htmlFiles(exportRoot)) {
  const route = routeFor(filename);
  const ids = new Set();
  const links = [];
  const assets = [];

  for (const node of elements(parse(fs.readFileSync(filename, 'utf8')))) {
    const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
    if (attrs.id) {
      if (ids.has(attrs.id)) fail(route, `duplicate id ${JSON.stringify(attrs.id)}`);
      ids.add(attrs.id);
    }
    if (node.tagName === 'a' && attrs.href !== undefined) links.push(attrs.href);
    if (['img', 'script', 'source'].includes(node.tagName) && attrs.src) assets.push(attrs.src);
  }

  pages.set(route, { ids, links, assets });
}

if (pages.size === 0) {
  console.error('No exported HTML pages found. Run pnpm build first.');
  process.exit(1);
}

for (const [route, { links, assets }] of pages) {
  for (const [href, isAsset] of [
    ...links.map((href) => [href, false]),
    ...assets.map((href) => [href, true]),
  ]) {
    let url;
    let pathname;
    let fragment;
    try {
      url = new URL(href, `${origin}${route}`);
      if (!['http:', 'https:'].includes(url.protocol) || url.host !== siteHost) continue;
      pathname = decodeURIComponent(url.pathname);
      fragment = decodeURIComponent(url.hash.slice(1));
    } catch {
      fail(route, `invalid URL ${JSON.stringify(href)}`);
      continue;
    }

    checkedLinks++;
    const target = pages.get(pathname.replace(/\/index\.html$/, '/')) ??
      pages.get(`${pathname.replace(/\/$/, '')}/`);
    if (target) {
      // Text fragments use the browser's text search rather than an element ID.
      const id = fragment.split(':~:text=')[0];
      if (!isAsset && id && !target.ids.has(id)) {
        fail(route, `missing anchor ${JSON.stringify(href)}`);
      }
      continue;
    }

    const filename = path.resolve(exportRoot, `.${pathname}`);
    if (!filename.startsWith(`${exportRoot}${path.sep}`) ||
        !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      fail(route, `missing ${isAsset ? 'asset' : 'page'} ${JSON.stringify(href)}`);
    }
  }
}

console.log(`Checked ${pages.size} HTML pages and ${checkedLinks} internal links/assets.`);
if (failures.size > 0) {
  for (const failure of failures) console.error(failure);
  console.error(`${failures.size} distinct internal link/ID errors.`);
  process.exitCode = 1;
} else {
  console.log('No missing internal pages, anchors, assets, or duplicate IDs.');
}

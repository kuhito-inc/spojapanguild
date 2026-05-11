/**
 * Rewrite relative markdown links (./foo.md, ../bar.md) under content/docs
 * to absolute /docs/... URLs (drop .md suffix; index.mdx maps to parent segment).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "docs");

function walkMdx(relDir, keys) {
  const abs = path.join(ROOT, relDir || ".");
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const relSeg = ent.name;
    const rel = relDir ? `${relDir}/${relSeg}` : relSeg;
    if (ent.isDirectory()) walkMdx(rel, keys);
    else if (ent.name.endsWith(".mdx"))
      keys.add(rel.replace(/\\/g, "/").slice(0, -".mdx".length));
  }
}

/** URL path under /docs: drop leading (...)/ route groups, strip trailing /index. */
function docPathToSlug(relNoExt) {
  let s = relNoExt.replace(/\\/g, "/").replace(/^(\([^/]+\)\/)+/, "");
  if (s.endsWith("/index")) s = s.slice(0, -"/index".length);
  return s;
}

function lookupPageKey(joinedNoExt, keys) {
  let cur = joinedNoExt.replace(/\\/g, "/").replace(/\/+$/, "").replace(/\.md$/i, "");

  const tryKeys = (c) => {
    if (keys.has(c)) return c;
    if (keys.has(`${c}/index`)) return `${c}/index`;
    return null;
  };

  const candidates = (c) => {
    const out = [c];
    const m2 = c.match(/^\(([^/]+)\)\/(.+)$/);
    if (m2) out.push(m2[2]);
    /** Fix ../../setup/foo written from cardano/* (resolve becomes setup/foo — wrong). */
    if (!c.startsWith("cardano/") && !c.startsWith("midnight/") && !/^\([^/]+\)\//.test(c)) {
      out.push(`cardano/${c}`);
      out.push(`midnight/${c}`);
    }
    /// (intro)/sjg/* -> (intro)/*
    const m = c.match(/^\(([^/]+)\)\/sjg\/(.+)$/);
    if (m) out.push(`(${m[1]})/${m[2]}`, m[2]);
    return out;
  };

  for (let k = 0; k < 16; k++) {
    for (const cand of candidates(cur)) {
      const hit = tryKeys(cand);
      if (hit) return hit;
    }
    if (/^\([^/]+\)\//.test(cur)) {
      cur = cur.replace(/^\([^/]+\)\//, "");
      continue;
    }
    break;
  }
  return null;
}

/** Deleted or renamed `.md` targets → absolute /docs slug (logical path keys). */
const LEGACY_REDIRECT = {
  "midnight/midnight-glacier-drop": "/docs/midnight",
  "cardano/operation/blocknotify-reinstall": "/docs/cardano/setup/blocknotify-setup",
  "cardano/operation/ubuntu22-migration": "/docs/cardano/operation/ubuntu24-migration",
  "cardano/operation/grafana-repo": "/docs/cardano/operation/grafana-security",
  "cardano/operation/p2p-settings": "/docs/cardano/setup/relay-bp-setup",
  "cardano/operation/add-relay": "/docs/cardano/operation/relay-migration",
};

function legacyHref(joinedNoExt, fragment) {
  let j = joinedNoExt.replace(/\\/g, "/").replace(/\/+$/, "").replace(/\.md$/i, "");
  while (/^\([^/]+\)\//.test(j)) j = j.replace(/^\([^/]+\)\//, "");
  const h = LEGACY_REDIRECT[j];
  return h ? h + fragment : null;
}

/** [text](href) */
const LINK_RX = /\[[^\]\n]*\]\(\s*([^)\s]+)\s*\)/g;

function rewriteHref(fromFileRelSlash, innerHref, keys) {
  const raw = innerHref.trim();
  const hashIdx = raw.indexOf("#");
  let pathOnly = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
  const fragment = hashIdx === -1 ? "" : raw.slice(hashIdx);

  pathOnly = pathOnly.replace(/\/*$/, "");

  if (!(pathOnly.startsWith("./") || pathOnly.startsWith("../"))) {
    if (pathOnly.startsWith("/docs")) return pathOnly.replace(/\.md$/i, "") + fragment;
    return raw;
  }

  const fromDir = path.posix.dirname(fromFileRelSlash.replace(/\\/g, "/"));
  let joined = path.posix.normalize(path.posix.join(fromDir, pathOnly));
  joined = joined.replace(/\.md$/i, "").replace(/\/+$/, "");

  const key = lookupPageKey(joined, keys);
  if (key) return `/docs/${docPathToSlug(key)}${fragment}`;

  const leg = legacyHref(joined, fragment);
  if (leg) return leg;

  console.warn(`Unresolved: ${fromFileRelSlash} -> ${innerHref}`);
  return raw;
}

function processFile(relPathSlash, keys) {
  const abs = path.join(ROOT, ...relPathSlash.split("/"));
  let text = fs.readFileSync(abs, "utf8");
  let modified = false;

  const out = text.replace(LINK_RX, (full, href) => {
    const trimmed = href.trim();
    const next = rewriteHref(relPathSlash, trimmed, keys);
    if (next !== trimmed) {
      modified = true;
      const lp = full.lastIndexOf("(");
      return full.slice(0, lp + 1) + next + ")";
    }
    return full;
  });

  if (modified) fs.writeFileSync(abs, out);
}

const keys = new Set();
walkMdx("", keys);

const allMdx = [...keys].map((k) => `${k}.mdx`);
for (const k of keys) {
  const rel = `${k}.mdx`;
  processFile(rel.replace(/\\/g, "/"), keys);
}

console.error(`absolutize-docs-links: scanned ${allMdx.length} files, keys ${keys.size}`);

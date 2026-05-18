/**
 * english-anchor-docs.mjs の後続: `./foo.md#old` 形式の相対パス＋フラグメントを
 * Git HEAD（移行前）の見出しスラッグと現在の `sec-N` を行順で対応づけて置換する。
 *
 * Usage（リポジトリルート）: node scripts/fix-relative-doc-fragments.mjs [--dry-run]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Slugger from "github-slugger";

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.join(REPO, "content", "docs");
const DRY = process.argv.includes("--dry-run");

const CUSTOM_ID = /\s*\[#([^\]]+)\]\s*$/;
const MD_HEADING = /^(#{1,6})\s+(.+)$/;
const SEC_SUFFIX = /\[#(sec-\d+)\]\s*$/;

function docPathToSlug(relNoExt) {
  let s = relNoExt.replace(/\\/g, "/").replace(/^(\([^/]+\)\/)+/, "");
  if (s.endsWith("/index")) s = s.slice(0, -"/index".length);
  return s;
}

function flattenHeadingForSlug(titleLine) {
  let s = titleLine.replace(CUSTOM_ID, "").trim();
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return s.trim();
}

function extractHeadings(content) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(\s*)```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(MD_HEADING);
    if (!m) continue;
    out.push({ titleRest: m[2] });
  }
  return out;
}

function oldHeadingIds(headings) {
  const slugger = new Slugger();
  return headings.map((h) => {
    const cust = h.titleRest.match(CUSTOM_ID);
    if (cust) return cust[1];
    return slugger.slug(flattenHeadingForSlug(h.titleRest));
  });
}

function newHeadingSecIds(headings) {
  return headings.map((h) => {
    const m = h.titleRest.match(SEC_SUFFIX);
    return m ? m[1] : null;
  });
}

function fileAbsToDocsUrlPath(absFile) {
  const rel = path.relative(ROOT, absFile).replace(/\\/g, "/");
  const slug = docPathToSlug(rel.replace(/\.mdx$/, ""));
  return `/docs/${slug}`;
}

function gitShowHead(relFromRepoRoot) {
  try {
    return execSync(`git show HEAD:${relFromRepoRoot}`, {
      encoding: "utf8",
      cwd: REPO,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

function walkMdxFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(p, acc);
    else if (ent.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

function buildGlobalFragmentMap(files) {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const abs of files) {
    const repoPath = path.relative(REPO, abs).replace(/\\/g, "/");
    const headRaw = gitShowHead(repoPath);
    if (!headRaw) continue;
    const docSlug = docPathToSlug(repoPath.replace(/^content\/docs\//, "").replace(/\.mdx$/, ""));
    const headH = extractHeadings(headRaw);
    const curRaw = fs.readFileSync(abs, "utf8");
    const curH = extractHeadings(curRaw);
    const olds = oldHeadingIds(headH);
    const news = newHeadingSecIds(curH);
    const n = Math.min(olds.length, news.length);
    if (olds.length !== news.length) {
      console.warn(
        `WARN ${docSlug}: heading count HEAD ${olds.length} vs current ${news.length}`,
      );
    }
    for (let i = 0; i < n; i++) {
      const nf = news[i];
      if (!nf) continue;
      map.set(`${docSlug}#${olds[i]}`, nf);
      // `./page.md#2` のように番号だけのリンク向け（2番目の見出し → sec-2）
      map.set(`${docSlug}#${String(i + 1)}`, nf);
    }
  }
  return map;
}

function resolvePathPartToDocSlug(fromFileAbs, pathPart) {
  const basePath = fileAbsToDocsUrlPath(fromFileAbs);
  try {
    const u = new URL(pathPart, `http://_a${basePath}`);
    let p = u.pathname.replace(/^\/docs\/?/, "").replace(/\.mdx?$/i, "");
    return docPathToSlug(p);
  } catch {
    return null;
  }
}

function replaceRelativeFragments(content, fromFileAbs, fragmentMap) {
  return content.replace(/\]\((\.[^)]+)\)/g, (full, inner) => {
    if (inner.startsWith("./http") || inner.startsWith("../http")) return full;
    const hashIdx = inner.indexOf("#");
    const pathPart = hashIdx === -1 ? inner : inner.slice(0, hashIdx);
    const frag = hashIdx === -1 ? "" : inner.slice(hashIdx + 1);
    if (!frag) return full;

    const slug = resolvePathPartToDocSlug(fromFileAbs, pathPart);
    if (!slug) return full;
    try {
      const dec = decodeURIComponent(frag);
      const key = `${slug}#${dec}`;
      const newFrag = fragmentMap.get(key);
      if (!newFrag) return full;
      const newInner = hashIdx === -1 ? inner : `${pathPart}#${newFrag}`;
      return `](${newInner})`;
    } catch {
      return full;
    }
  });
}

function main() {
  const files = walkMdxFiles(ROOT).sort();
  const fragmentMap = buildGlobalFragmentMap(files);
  console.log(`Built fragment map entries: ${fragmentMap.size}`);

  let changed = 0;
  for (const abs of files) {
    const original = fs.readFileSync(abs, "utf8");
    const next = replaceRelativeFragments(original, abs, fragmentMap);
    if (next !== original) {
      changed++;
      if (!DRY) fs.writeFileSync(abs, next, "utf8");
    }
  }
  console.log(DRY ? `[dry-run] ${changed} files would change` : `Updated ${changed} files.`);
}

main();

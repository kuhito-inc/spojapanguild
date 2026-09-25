/**
 * ID 未指定の MDX 見出しに英数字 ID（sec-N）を付与し、
 * ルート相対の内部リンクのフラグメントを対応表で一括置換する。
 * 既存の明示 ID は保持し、見出し追加・並べ替えによる再採番を避ける。
 *
 * fumadocs の remark-heading と同様、末尾の `[#custom-id]` がある見出しは
 * その文字列を oldId（移行前の URL フラグメント）として扱う。
 *
 * Usage: node tools/docs/english-anchor-docs.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Slugger from "github-slugger";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "content", "docs");
const DRY = process.argv.includes("--dry-run");

function docPathToSlug(relNoExt) {
  let s = relNoExt.replace(/\\/g, "/").replace(/^(\([^/]+\)\/)+/, "");
  if (s.endsWith("/index")) s = s.slice(0, -"/index".length);
  return s;
}

function walkMdxFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(p, acc);
    else if (ent.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

const CUSTOM_ID = /\s*\[#([^\]]+)\]\s*$/;
const MD_HEADING = /^(#{1,6})\s+(.+)$/;

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
  let fence = null;
  let inComment = false;
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (fence) {
      const end = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (end && end[1][0] === fence[0] && end[1].length >= fence.length) fence = null;
      continue;
    }

    // MDX comments can contain retired headings and entire fenced examples.
    let visible = '';
    while (line.length > 0) {
      if (inComment) {
        const end = line.indexOf('*/}');
        if (end === -1) break;
        line = line.slice(end + 3);
        inComment = false;
      } else {
        const start = line.indexOf('{/*');
        if (start === -1) {
          visible += line;
          break;
        }
        visible += line.slice(0, start);
        line = line.slice(start + 3);
        inComment = true;
      }
    }
    line = visible;
    const start = line.match(/^\s*(`{3,}|~{3,})/);
    if (start) {
      fence = start[1];
      continue;
    }

    const m = line.match(MD_HEADING);
    if (!m) continue;
    out.push({ lineIndex: i, hashes: m[1], titleRest: m[2] });
  }
  return { lines, headings: out };
}

function computeMappingsForFile(docSlug, headings) {
  const slugger = new Slugger();
  const rows = [];
  // Allocate after existing numeric IDs; never change a published explicit ID.
  let n = headings.reduce((max, h) => {
    const id = h.titleRest.match(CUSTOM_ID)?.[1];
    const number = id?.match(/^sec-(\d+)$/);
    return number ? Math.max(max, Number(number[1])) : max;
  }, 0);

  for (const h of headings) {
    const cust = h.titleRest.match(CUSTOM_ID);
    const newId = cust ? cust[1] : `sec-${++n}`;
    let oldId;
    if (cust) {
      oldId = cust[1];
    } else {
      const flat = flattenHeadingForSlug(h.titleRest);
      oldId = slugger.slug(flat);
    }
    rows.push({
      oldId,
      newId,
      lineIndex: h.lineIndex,
      hashes: h.hashes,
      titleRest: h.titleRest,
    });
  }
  return rows;
}

function applyHeadingRewrites(lines, rows) {
  const out = [...lines];
  for (const r of rows) {
    if (r.oldId === r.newId) continue;
    const titleOnly = r.titleRest.replace(CUSTOM_ID, "").trimEnd();
    out[r.lineIndex] = `${r.hashes} ${titleOnly} [#${r.newId}]`;
  }
  return out.join("\n");
}

function hrefToKey(hrefPath, fragment) {
  let p = hrefPath.replace(/^\//, "").replace(/\.mdx?$/i, "").replace(/\/$/, "");
  p = docPathToSlug(p);
  if (!fragment) return null;
  try {
    return `${p}#${decodeURIComponent(fragment)}`;
  } catch {
    return `${p}#${fragment}`;
  }
}

function replaceDocLinks(content, fragmentMap) {
  return content.replace(/\]\(\s*(\/[^)]+)\s*\)/g, (full, inner) => {
    const hashIdx = inner.indexOf("#");
    if (hashIdx === -1) return full;

    const pathOnly = inner.slice(0, hashIdx);
    const afterHash = inner.slice(hashIdx + 1);
    const qIdx = afterHash.indexOf("?");
    const frag = qIdx === -1 ? afterHash : afterHash.slice(0, qIdx);
    const query = qIdx === -1 ? "" : afterHash.slice(qIdx);

    const key = hrefToKey(pathOnly, frag);
    if (!key) return full;

    const newFrag = fragmentMap.get(key);
    if (!newFrag) return full;

    return `](${pathOnly}#${newFrag}${query})`;
  });
}

function main() {
  const files = walkMdxFiles(ROOT).sort();
  /** @type {Map<string, string>} */
  const originals = new Map();
  for (const abs of files) {
    originals.set(abs, fs.readFileSync(abs, "utf8"));
  }

  /** @type {Map<string, string>} */
  const fragmentMap = new Map();

  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    const docSlug = docPathToSlug(rel.replace(/\.mdx$/, ""));
    const raw = originals.get(abs);
    const { headings } = extractHeadings(raw);
    const rows = computeMappingsForFile(docSlug, headings);

    for (const r of rows) {
      const k = `${docSlug}#${r.oldId}`;
      if (fragmentMap.has(k) && fragmentMap.get(k) !== r.newId) {
        console.warn(`WARN: duplicate map key ${k}`);
      }
      fragmentMap.set(k, r.newId);
    }
  }

  let changed = 0;
  for (const abs of files) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    const docSlug = docPathToSlug(rel.replace(/\.mdx$/, ""));

    let raw = originals.get(abs);
    const { lines, headings } = extractHeadings(raw);
    const rows = computeMappingsForFile(docSlug, headings);
    raw = applyHeadingRewrites(lines, rows);
    raw = replaceDocLinks(raw, fragmentMap);

    if (raw !== originals.get(abs)) {
      changed++;
      if (!DRY) fs.writeFileSync(abs, raw, "utf8");
    }
  }

  console.log(
    DRY ? `[dry-run] ${changed} files would be modified` : `Updated ${changed} files.`,
  );
  console.log(`Fragment mappings: ${fragmentMap.size}`);
}

main();

/**
 * ` ``` ` だけのコードフェンス（言語未指定）に、本文から推論した言語タグを付与する。
 * 閉じの ``` は触らない。
 *
 * Usage: node scripts/infer-code-fence-lang.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "docs");
const DRY = process.argv.includes("--dry-run");

function walkMdx(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdx(p, acc);
    else if (ent.name.endsWith(".mdx")) acc.push(p);
  }
  return acc;
}

/** 開きフェンスに既に言語・属性があるか（```bash / ```yaml title= 等） */
function fenceHasLang(line) {
  const m = line.match(/^```(\S*)/);
  if (!m) return false;
  const rest = m[1];
  return rest.length > 0;
}

function inferLang(body) {
  const t = body.trim();
  if (!t) return "text";

  // mermaid
  if (
    /^(graph\s|flowchart\s|sequenceDiagram|gantt|pie\s|classDiagram|erDiagram|stateDiagram|journey)/im.test(
      t,
    )
  ) {
    return "mermaid";
  }

  // JSON
  const maybeJson = t.replace(/^\uFEFF/, "");
  if ((maybeJson.startsWith("{") && maybeJson.includes("}")) || (maybeJson.startsWith("[") && maybeJson.includes("]"))) {
    try {
      JSON.parse(maybeJson);
      return "json";
    } catch {
      /* continue */
    }
  }

  // YAML（先頭 --- / key: スタイル / docker-compose 風）
  if (
    /^\s*---\s*\r?\n/.test(body) ||
    (/^[\w.-]+:\s*$/m.test(t) && /(^|\n)[\w.-]+:\s+/.test(t)) ||
    (/^services:\s*$/m.test(t) && /^ {2}\w+:\s*$/m.test(t))
  ) {
    return "yaml";
  }

  // HTML / XML 断片
  if (/^<[a-zA-Z][^>]+>/.test(t) && /<\/[a-zA-Z]+>/.test(t)) {
    return "html";
  }

  // Windows PowerShell / Cmd 風
  if (/\b(Get-|Set-|New-|Remove-)Item\b|\$env:|`\s*$/m.test(t)) {
    return "powershell";
  }

  // .env / shell 変数代入が主体
  if (/^(export\s+[A-Z]|MACHINE_HOST=|[A-Z][A-Z0-9_]*=)/m.test(t) && !/\{/.test(t.slice(0, 80))) {
    if (/^[\w.-]+:\s/m.test(t)) return "yaml";
    return "bash";
  }

  // 典型的なシェル・Cardano / Linux コマンド
  if (
    /\b(sudo|apt|dnf|yum|cd|export|source\s|systemctl|journalctl|chmod|mkdir|\|\||&&|;&\s|curl\s|wget\s|grep\s|sed\s|awk\s|cardano-cli|cardano-node|docker\s|kubectl|\$\s|\$\()/i.test(
      t,
    ) ||
    /^#!/m.test(t) ||
    /^\$\s/m.test(t)
  ) {
    return "bash";
  }

  // git conflict / diff
  if (/^<{7}|^>{7}|^={7}/m.test(t)) {
    return "diff";
  }

  // SQL
  if (/^\s*(SELECT|INSERT\s+INTO|CREATE\s+TABLE|UPDATE\s|DELETE\s+FROM)\s/i.test(t)) {
    return "sql";
  }

  // INI 風 [section]
  if (/^\s*\[[^\]]+\]\s*$/m.test(t) && /^[^#\n]+=[^\n]+$/m.test(t)) {
    return "ini";
  }

  if (/^[\w.-]+:\s*[^\n]+/m.test(t) && !/\$/.test(t)) {
    return "yaml";
  }

  return "bash";
}

function processContent(raw) {
  const lines = raw.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inFence = false;

  while (i < lines.length) {
    const line = lines[i];
    const isFenceLine = line.startsWith("```");

    if (!inFence) {
      if (isFenceLine) {
        if (fenceHasLang(line)) {
          inFence = true;
          out.push(line);
          i += 1;
          continue;
        }
        // 開き：言語なし ` ``` ` のみ
        const start = i + 1;
        let j = start;
        const bodyLines = [];
        while (j < lines.length && !/^```\s*$/.test(lines[j])) {
          bodyLines.push(lines[j]);
          j += 1;
        }
        if (j >= lines.length) {
          out.push(line);
          i += 1;
          continue;
        }
        const body = bodyLines.join("\n");
        const lang = inferLang(body);
        out.push("```" + lang);
        for (const bl of bodyLines) out.push(bl);
        out.push("```");
        i = j + 1;
        continue;
      }
      out.push(line);
      i += 1;
      continue;
    }

    // inFence
    // 閉じはバッククォートのみの行（```bash は別ブロックの開始なので閉じにしない）
    if (inFence && /^```\s*$/.test(line)) {
      inFence = false;
      out.push(line);
      i += 1;
      continue;
    }
    out.push(line);
    i += 1;
  }

  return out.join("\n");
}

function main() {
  const files = walkMdx(ROOT).sort();
  let changed = 0;
  for (const abs of files) {
    const before = fs.readFileSync(abs, "utf8");
    const after = processContent(before);
    if (after !== before) {
      changed += 1;
      if (!DRY) fs.writeFileSync(abs, after, "utf8");
    }
  }
  console.log(DRY ? `[dry-run] would modify ${changed} files` : `Updated ${changed} files.`);
}

main();

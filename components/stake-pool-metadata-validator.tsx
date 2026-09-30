'use client';

import { useId, useState } from 'react';
import { CircleCheck, CircleX, LoaderCircle, TriangleAlert } from 'lucide-react';
import {
  validateMetadataDocument,
  type MetadataImageTarget,
  type MetadataValidationIssue,
  type StakePoolMetadataKind,
} from '@/lib/stake-pool-metadata-validator';

const fieldClass = 'mt-1 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-fd-primary';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50';

type ImageCheck = MetadataImageTarget & {
  status: 'success' | 'error';
  message: string;
  width?: number;
  height?: number;
};

type ValidationResult = {
  source: string;
  issues: MetadataValidationIssue[];
  images: ImageCheck[];
};

export function StakePoolMetadataValidator() {
  const baseId = useId();
  const [kind, setKind] = useState<StakePoolMetadataKind>('extended');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  async function inspectImage(target: MetadataImageTarget): Promise<ImageCheck> {
    return new Promise((resolve) => {
      const image = new window.Image();
      const timer = window.setTimeout(() => {
        image.onload = null;
        image.onerror = null;
        image.src = '';
        resolve({ ...target, status: 'error', message: '10秒以内に画像を読み込めませんでした。' });
      }, 10_000);

      image.onload = () => {
        window.clearTimeout(timer);
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        if (target.require64Square && (width !== 64 || height !== 64)) {
          resolve({ ...target, status: 'error', width, height, message: `画像は表示できますが、サイズが ${width}×${height} です。64×64にしてください。` });
          return;
        }
        resolve({ ...target, status: 'success', width, height, message: `画像を表示できました（${width}×${height}）。` });
      };
      image.onerror = () => {
        window.clearTimeout(timer);
        resolve({ ...target, status: 'error', message: '画像URLを読み込めませんでした。URLと公開設定を確認してください。' });
      };
      image.referrerPolicy = 'no-referrer';
      image.src = target.url;
    });
  }

  async function validateText(text: string, source: string, initialIssues: MetadataValidationIssue[] = []) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/^\uFEFF/, ''));
    } catch {
      setResult({
        source,
        issues: [...initialIssues, { level: 'error', message: 'JSONを解析できません。構文やカンマ、引用符を確認してください。' }],
        images: [],
      });
      return;
    }

    const byteLength = new TextEncoder().encode(text).byteLength;
    const validation = validateMetadataDocument(kind, parsed, byteLength);
    const images = await Promise.all(validation.images.map(inspectImage));
    const imageIssues: MetadataValidationIssue[] = images.map((image) => ({
      level: image.status,
      message: `${image.label}: ${image.message}`,
    }));
    setResult({ source, issues: [...initialIssues, ...validation.issues, ...imageIssues], images });
  }

  async function validateUrl() {
    const candidate = url.trim();
    try {
      const parsedUrl = new URL(candidate);
      if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname || parsedUrl.username || parsedUrl.password) throw new Error('invalid');
    } catch {
      setResult({ source: '公開URL', issues: [{ level: 'error', message: 'https:// から始まる有効な公開URLを入力してください。' }], images: [] });
      return;
    }

    setLoading(true);
    setResult(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(candidate, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) {
        setResult({ source: candidate, issues: [{ level: 'error', message: `公開URLの取得に失敗しました（HTTP ${response.status}）。` }], images: [] });
        return;
      }
      const text = await response.text();
      const contentType = response.headers.get('content-type') ?? '';
      const initialIssues: MetadataValidationIssue[] = [
        { level: 'success', message: `公開URLからJSONファイルを取得できました（HTTP ${response.status}）。` },
      ];
      if (!/application\/(?:[\w.+-]+\+)?json/i.test(contentType)) {
        initialIssues.push({ level: 'warning', message: `Content-TypeがJSONではありません（${contentType || '未設定'}）。` });
      }
      await validateText(text, candidate, initialIssues);
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      setResult({
        source: candidate,
        issues: [{
          level: 'error',
          message: timedOut
            ? '公開URLの取得が15秒でタイムアウトしました。'
            : '公開URLを取得できませんでした。URL、公開設定、CORS（Access-Control-Allow-Origin）を確認してください。',
        }],
        images: [],
      });
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  }

  async function validateFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      if (file.size > 5 * 1024 * 1024) {
        setResult({ source: file.name, issues: [{ level: 'error', message: '検証できるファイルサイズは5MBまでです。' }], images: [] });
        return;
      }
      await validateText(await file.text(), file.name, [
        { level: 'success', message: '選択したJSONファイルをブラウザ内で読み込みました。' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function switchKind(nextKind: StakePoolMetadataKind) {
    setKind(nextKind);
    setResult(null);
  }

  return <div className="not-prose my-6 min-w-0 space-y-5 rounded-xl border border-fd-border bg-fd-card p-4 sm:p-6" role="region" aria-label="公開メタデータJSON検証フォーム">
    <div>
      <p className="text-lg font-semibold">公開したメタデータJSONを検証</p>
      <p className="mt-2 text-sm text-fd-muted-foreground">公開URLまたは手元のJSONファイルを検証します。拡張JSONではアイコンとロゴを実際に読み込みます。入力内容やファイルはSJGサーバーへ送信・保存されません。</p>
    </div>

    <div>
      <label htmlFor={`${baseId}-kind`} className="text-sm font-medium">検証するファイル</label>
      <select id={`${baseId}-kind`} className={fieldClass} value={kind} onChange={(event) => switchKind(event.target.value as StakePoolMetadataKind)}>
        <option value="extended">拡張メタデータJSON</option>
        <option value="standard">通常メタデータJSON（poolMetaData.json）</option>
      </select>
    </div>

    <div className="space-y-3">
      <div>
        <label htmlFor={`${baseId}-url`} className="text-sm font-medium">公開URL</label>
        <input id={`${baseId}-url`} className={fieldClass} value={url} inputMode="url" autoComplete="url" spellCheck={false}
          placeholder={kind === 'extended' ? 'https://example.com/extended-metadata.json' : 'https://example.com/poolMetaData.json'}
          onChange={(event) => { setUrl(event.target.value); setResult(null); }} />
      </div>
      <button type="button" className={buttonClass} disabled={loading || !url.trim()} onClick={() => void validateUrl()}>
        {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
        公開URLを検証
      </button>
    </div>

    <div className="border-t border-fd-border pt-4">
      <label htmlFor={`${baseId}-file`} className="text-sm font-medium">または、手元のJSONファイルを選択</label>
      <input id={`${baseId}-file`} type="file" accept="application/json,.json" className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-fd-border file:bg-fd-background file:px-3 file:py-2 file:text-sm hover:file:bg-fd-accent disabled:opacity-50"
        disabled={loading} onChange={(event) => void validateFile(event.target.files?.[0])} />
      <p className="mt-1 text-xs text-fd-muted-foreground">ファイル選択ではJSON内容と画像を検証します。公開URLから取得できるかどうかは確認しません。</p>
    </div>

    {result && <section className="space-y-4 border-t border-fd-border pt-4" aria-label="検証結果">
      <div>
        <p className="font-semibold">検証結果</p>
        <p className="mt-1 break-all text-xs text-fd-muted-foreground">{result.source}</p>
      </div>
      <ul className="space-y-2">
        {result.issues.map((issue, index) => <li key={`${issue.level}-${index}`} className="flex items-start gap-2 text-sm">
          {issue.level === 'success' && <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />}
          {issue.level === 'warning' && <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
          {issue.level === 'error' && <CircleX className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />}
          <span>{issue.message}</span>
        </li>)}
      </ul>

      {result.images.length > 0 && <div>
        <p className="mb-3 font-semibold">画像プレビュー</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {result.images.map((image) => <div key={image.field} className="min-w-0 rounded-lg border border-fd-border p-3">
            <p className="mb-2 text-sm font-medium">{image.label}</p>
            {image.width && image.height
              ? <img src={image.url} alt={`${image.label}の検証プレビュー`} referrerPolicy="no-referrer" className="h-40 w-full rounded-md bg-white object-contain" />
              : <div className="flex h-40 items-center justify-center rounded-md bg-fd-muted px-3 text-center text-sm text-red-600 dark:text-red-400">画像を表示できません</div>}
            <p className="mt-2 break-all text-xs text-fd-muted-foreground">{image.url}</p>
          </div>)}
        </div>
      </div>}
    </section>}

    <p role="status" aria-live="polite" className="sr-only">{loading ? '検証中です。' : result ? '検証が完了しました。' : ''}</p>
  </div>;
}

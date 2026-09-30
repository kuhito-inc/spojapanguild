'use client';

import { useId, useState } from 'react';
import { Check, Clipboard, Download } from 'lucide-react';
import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import {
  generateExtendedStakePoolMetadata,
  generateStakePoolMetadata,
  MAX_METADATA_BYTES,
  type ExtendedStakePoolMetadataField,
  type ExtendedStakePoolMetadataInput,
  type StakePoolMetadataField,
  type StakePoolMetadataInput,
} from '@/lib/stake-pool-metadata-generator';

const fieldClass = 'mt-1 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-fd-primary';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50';

const initialInput: StakePoolMetadataInput = {
  name: '',
  description: '',
  ticker: '',
  homepage: '',
  includeExtended: false,
  extended: '',
};

const initialExtendedInput: ExtendedStakePoolMetadataInput = {
  iconUrl: '',
  logoUrl: '',
  location: '',
  twitterHandle: '',
  telegramHandle: '',
  youtubeHandle: '',
  discordHandle: '',
  githubHandle: '',
};

export function StakePoolMetadataGenerator() {
  const baseId = useId();
  const [input, setInput] = useState(initialInput);
  const [touched, setTouched] = useState<Partial<Record<StakePoolMetadataField, boolean>>>({});
  const [extendedInput, setExtendedInput] = useState(initialExtendedInput);
  const [extendedTouched, setExtendedTouched] = useState<Partial<Record<ExtendedStakePoolMetadataField, boolean>>>({});
  const [feedback, setFeedback] = useState('');
  const result = generateStakePoolMetadata(input);
  const valid = Object.keys(result.errors).length === 0;
  const extendedResult = generateExtendedStakePoolMetadata(extendedInput);
  const extendedValid = Object.keys(extendedResult.errors).length === 0;

  function update(patch: Partial<StakePoolMetadataInput>) {
    setInput((current) => ({ ...current, ...patch }));
    setFeedback('');
  }

  function markTouched(field: StakePoolMetadataField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function fieldError(field: StakePoolMetadataField) {
    if (!touched[field]) return null;
    const error = result.errors[field];
    return error ? <p id={`${baseId}-${field}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p> : null;
  }

  function updateExtended(field: keyof ExtendedStakePoolMetadataInput, value: string) {
    setExtendedInput((current) => ({ ...current, [field]: value }));
    setFeedback('');
  }

  function extendedField(
    field: keyof ExtendedStakePoolMetadataInput,
    label: string,
    placeholder: string,
    options: { url?: boolean; help?: string } = {},
  ) {
    const error = extendedResult.errors[field];
    const errorId = `${baseId}-extended-${field}-error`;
    const helpId = options.help ? `${baseId}-extended-${field}-help` : undefined;
    return <div key={field}>
      <label htmlFor={`${baseId}-extended-${field}`} className="text-sm font-medium">{label}</label>
      <input id={`${baseId}-extended-${field}`} className={fieldClass} value={extendedInput[field]}
        inputMode={options.url ? 'url' : 'text'} autoComplete="off" spellCheck={false} placeholder={placeholder}
        aria-invalid={Boolean(extendedTouched[field] && error)}
        aria-describedby={[helpId, extendedTouched[field] && error ? errorId : undefined].filter(Boolean).join(' ') || undefined}
        onBlur={() => setExtendedTouched((current) => ({ ...current, [field]: true }))}
        onChange={(event) => updateExtended(field, event.target.value)} />
      {options.help && <p id={helpId} className="mt-1 text-xs text-fd-muted-foreground">{options.help}</p>}
      {extendedTouched[field] && error && <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>;
  }

  async function copyJson(json: string, label: string) {
    try {
      setFeedback(await copyTextToClipboard(json)
        ? `${label}をコピーしました。`
        : 'コピーできませんでした。表示内容を選択してコピーしてください。');
    } catch {
      setFeedback('コピーできませんでした。表示内容を選択してコピーしてください。');
    }
  }

  function downloadJson(json: string, filename: string) {
    const objectUrl = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    setFeedback(`${filename}をダウンロードしました。`);
  }

  return <div className="not-prose my-6 min-w-0 space-y-6 rounded-xl border border-fd-border bg-fd-card p-4 sm:p-6" role="region" aria-label="ステークプールメタデータJSON生成フォーム">
    <div>
      <p className="text-lg font-semibold">ステークプールメタデータJSONを生成</p>
      <p className="mt-2 text-sm text-fd-muted-foreground">プール情報を入力すると、poolMetaData.jsonの内容を生成します。入力内容はSJGサーバーには送信・保存されず、再読み込みでリセットされます。</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${baseId}-name`} className="text-sm font-medium">プール名（name）</label>
        <input id={`${baseId}-name`} className={fieldClass} value={input.name} required autoComplete="organization" placeholder="MyPoolName"
          aria-invalid={Boolean(touched.name && result.errors.name)} aria-describedby={touched.name && result.errors.name ? `${baseId}-name-error` : undefined}
          onBlur={() => markTouched('name')} onChange={(event) => update({ name: event.target.value })} />
        <p className="mt-1 text-xs text-fd-muted-foreground">50文字以内</p>
        {fieldError('name')}
      </div>

      <div>
        <label htmlFor={`${baseId}-ticker`} className="text-sm font-medium">Ticker（ticker）</label>
        <input id={`${baseId}-ticker`} className={fieldClass} value={input.ticker} required autoComplete="off" spellCheck={false} placeholder="MPN"
          aria-invalid={Boolean(touched.ticker && result.errors.ticker)} aria-describedby={touched.ticker && result.errors.ticker ? `${baseId}-ticker-error` : undefined}
          onBlur={() => markTouched('ticker')} onChange={(event) => update({ ticker: event.target.value.toUpperCase() })} />
        <p className="mt-1 text-xs text-fd-muted-foreground">半角英大文字・数字の3〜5文字</p>
        {fieldError('ticker')}
      </div>
    </div>

    <div>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={`${baseId}-description`} className="text-sm font-medium">説明（description）</label>
        <span className="text-xs text-fd-muted-foreground">{Array.from(input.description).length} / 255文字</span>
      </div>
      <textarea id={`${baseId}-description`} className={`${fieldClass} min-h-28 resize-y`} value={input.description} required placeholder="My pool description"
        aria-invalid={Boolean(touched.description && result.errors.description)} aria-describedby={touched.description && result.errors.description ? `${baseId}-description-error` : undefined}
        onBlur={() => markTouched('description')} onChange={(event) => update({ description: event.target.value })} />
      {fieldError('description')}
    </div>

    <div>
      <label htmlFor={`${baseId}-homepage`} className="text-sm font-medium">ホームページURL（homepage）</label>
      <input id={`${baseId}-homepage`} className={fieldClass} value={input.homepage} required inputMode="url" autoComplete="url" spellCheck={false} placeholder="https://myadapoolnamerocks.com"
        aria-invalid={Boolean(touched.homepage && result.errors.homepage)} aria-describedby={touched.homepage && result.errors.homepage ? `${baseId}-homepage-error` : undefined}
        onBlur={() => markTouched('homepage')} onChange={(event) => update({ homepage: event.target.value })} />
      <p className="mt-1 text-xs text-fd-muted-foreground">https:// から始まる64文字以内のURL</p>
      {fieldError('homepage')}
    </div>

    <section className="space-y-4 rounded-lg border border-fd-border p-3 sm:p-4" aria-label="拡張メタデータ">
      <label htmlFor={`${baseId}-include-extended`} className="flex cursor-pointer items-start gap-3 text-sm font-medium">
        <input id={`${baseId}-include-extended`} type="checkbox" className="mt-0.5 size-4 accent-fd-primary" checked={input.includeExtended}
          onChange={(event) => update({ includeExtended: event.target.checked })} />
        <span>拡張メタデータ（extended）を追加する</span>
      </label>
      <p className="text-xs text-fd-muted-foreground">チェックすると、ADAPools形式の拡張JSON作成フォームと公開URLの入力欄を表示します。</p>
      {input.includeExtended && <div className="space-y-6 border-t border-fd-border pt-4">
        <div>
          <p className="font-semibold">1. extended-metadata.jsonを作成</p>
          <p className="mt-1 text-sm text-fd-muted-foreground">画像と所在地を入力してください。利用していないSNSのハンドルは空欄のままで構いません。すでに拡張JSONを公開済みの場合、この手順は省略できます。</p>
        </div>

        <details open className="rounded-lg border border-fd-border p-3">
          <summary className="cursor-pointer font-medium">基本情報</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extendedField('iconUrl', '64×64アイコンURL', 'https://example.com/icon-64.png', { url: true, help: '64×64ピクセルのPNG画像を指定します。' })}
            {extendedField('logoUrl', 'ロゴ画像URL', 'https://example.com/logo.png', { url: true })}
            {extendedField('location', '所在地', 'Tokyo, Japan')}
          </div>
        </details>

        <details className="rounded-lg border border-fd-border p-3">
          <summary className="cursor-pointer font-medium">SNS・コミュニティ</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extendedField('twitterHandle', 'X（Twitter）ハンドル', 'xstakepool', { help: '@を付けずに入力します。' })}
            {extendedField('telegramHandle', 'Telegramハンドル', 'xstakepool')}
            {extendedField('discordHandle', 'Discord', 'xstakepool')}
            {extendedField('githubHandle', 'GitHubハンドル', 'xstakepool')}
            {extendedField('youtubeHandle', 'YouTubeハンドル', 'xstakepool')}
          </div>
        </details>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">拡張メタデータJSON</p>
            <p className="text-xs text-fd-muted-foreground">{extendedResult.byteLength}バイト</p>
          </div>
          <div className="relative rounded-md bg-fd-muted p-4 pr-14">
            <pre tabIndex={0} className="max-h-80 overflow-auto text-xs"><code>{extendedResult.json}</code></pre>
            <button type="button" className="absolute right-2 top-2 rounded-md p-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!extendedValid} title={feedback === '拡張メタデータJSONをコピーしました。' ? 'コピー済み' : '拡張メタデータJSONをコピー'} aria-label="生成した拡張メタデータJSONをコピー"
              onClick={() => void copyJson(extendedResult.json, '拡張メタデータJSON')}>
              {feedback === '拡張メタデータJSONをコピーしました。' ? <Check className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
            </button>
          </div>
          <button type="button" className={buttonClass} disabled={!extendedValid}
            onClick={() => downloadJson(extendedResult.json, 'extended-metadata.json')}>
            <Download className="size-4" aria-hidden="true" /> extended-metadata.jsonをダウンロード
          </button>
        </div>

        <div className="space-y-3 border-t border-fd-border pt-4">
          <div>
            <p className="font-semibold">2. 拡張JSONを公開してURLを入力</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">ダウンロードしたファイルをGitHubまたはWebサーバーへ公開し、そのURLを入力してください。</p>
          </div>
          <div>
            <label htmlFor={`${baseId}-extended`} className="text-sm font-medium">拡張メタデータURL（extended）</label>
            <input id={`${baseId}-extended`} className={fieldClass} value={input.extended} required inputMode="url" autoComplete="url" spellCheck={false} placeholder="https://xstakepool.com/xsp-extended.json"
              aria-invalid={Boolean(touched.extended && result.errors.extended)} aria-describedby={touched.extended && result.errors.extended ? `${baseId}-extended-error` : undefined}
              onBlur={() => markTouched('extended')} onChange={(event) => update({ extended: event.target.value })} />
            {fieldError('extended')}
          </div>
        </div>
      </div>}
    </section>

    <section aria-label="生成結果" className="space-y-3 border-t border-fd-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{input.includeExtended ? '3. ' : ''}poolMetaData.jsonを生成</p>
        <p className={`text-xs ${result.byteLength > MAX_METADATA_BYTES ? 'text-red-600 dark:text-red-400' : 'text-fd-muted-foreground'}`}>{result.byteLength} / {MAX_METADATA_BYTES}バイト</p>
      </div>
      <div className="relative rounded-md bg-fd-muted p-4 pr-14">
        <pre tabIndex={0} className="max-h-80 overflow-auto text-xs"><code>{result.json}</code></pre>
        <button type="button" className="absolute right-2 top-2 rounded-md p-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!valid} title={feedback === '通常メタデータJSONをコピーしました。' ? 'コピー済み' : 'JSONをコピー'} aria-label="生成したJSONをコピー" onClick={() => void copyJson(result.json, '通常メタデータJSON')}>
          {feedback === '通常メタデータJSONをコピーしました。' ? <Check className="size-4" aria-hidden="true" /> : <Clipboard className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {result.errors.file && <p className="text-sm text-red-600 dark:text-red-400">{result.errors.file}</p>}
      {!valid && <p className="text-sm text-fd-muted-foreground">すべての入力が有効になると、コピーとダウンロードができます。</p>}
      <button type="button" className={buttonClass} disabled={!valid} onClick={() => downloadJson(result.json, 'poolMetaData.json')}>
        <Download className="size-4" aria-hidden="true" /> poolMetaData.jsonをダウンロード
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">{feedback}</p>
    </section>
  </div>;
}

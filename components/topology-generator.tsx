'use client';

import { useId, useRef, useState } from 'react';
import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import { generateTopology, topologyCommand, type Peer, type TopologyInput } from '@/lib/topology-generator';

const fieldClass = 'mt-1 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-fd-primary';
const buttonClass = 'rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50';

export function TopologyGenerator() {
  const baseId = useId();
  const nextId = useRef(1);
  const [input, setInput] = useState<TopologyInput>({
    mode: 'relay',
    bp: { id: 'bp', address: '', port: '', advertise: false },
    relays: [{ id: 'relay-0', address: '', port: '6000', advertise: true }],
    external: [],
    snapshotPath: '',
  });
  const [feedback, setFeedback] = useState('');
  const { errors, json } = generateTopology(input);
  const command = json === null ? null : topologyCommand(json);

  function update(change: Partial<TopologyInput>) {
    setInput((current) => ({ ...current, ...change }));
    setFeedback('');
  }

  function peerFields(peer: Peer, label: string, kind: 'bp' | 'relays' | 'external') {
    function change(patch: Partial<Peer>) {
      if (kind === 'bp') update({ bp: { ...peer, ...patch } });
      else update({ [kind]: input[kind].map((item) => item.id === peer.id ? { ...item, ...patch } : item) });
    }
    return (
      <fieldset key={peer.id} className="min-w-0 rounded-lg border border-fd-border p-3">
        <legend className="px-1 text-sm font-medium">{label}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['address', 'port'] as const).map((name) => {
            const id = `${baseId}-${peer.id}-${name}`;
            const error = errors[`${peer.id}-${name}`];
            return <div key={name}>
              <label htmlFor={id} className="text-sm">{name === 'port' ? 'ポート' : kind === 'bp' ? 'IP アドレス' : 'IP アドレス／DNS'}</label>
              <input id={id} className={fieldClass} value={peer[name]} required
                inputMode={name === 'port' ? 'numeric' : 'text'} autoComplete="off" spellCheck={false}
                placeholder={name === 'address' ? (kind === 'bp' ? '192.0.2.10' : 'relay.example.com') : undefined}
                aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) => change({ [name]: event.target.value })} />
              {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>;
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          {kind === 'relays' ? <div>
            <label htmlFor={`${baseId}-${peer.id}-advertise`} className="text-sm">advertise</label>
            <select id={`${baseId}-${peer.id}-advertise`} className={fieldClass} value={String(peer.advertise)}
              aria-describedby={`${baseId}-advertise-help`}
              onChange={(event) => change({ advertise: event.target.value === 'true' })}>
              <option value="true">true</option><option value="false">false</option>
            </select>
          </div> : <p className="text-sm text-fd-muted-foreground">advertise: false（固定）</p>}
          {kind !== 'bp' && <button type="button" className={buttonClass}
            aria-label={`${label}を削除`}
            onClick={() => update({ [kind]: input[kind].filter((item) => item.id !== peer.id) })}>削除</button>}
        </div>
      </fieldset>
    );
  }

  function peerList(kind: 'relays' | 'external', title: string) {
    return <section className="space-y-3" aria-label={title}>
      <p className="font-semibold">{title} <span className="text-xs font-normal text-fd-muted-foreground">{kind === 'relays' ? 'localRoots' : 'publicRoots'}</span></p>
      {kind === 'relays' && <p id={`${baseId}-advertise-help`} className="text-sm text-fd-muted-foreground">advertise：この接続先を他のノードに知らせるか</p>}
      {input[kind].map((peer, index) => peerFields(peer, `${title} ${index + 1}`, kind))}
      {kind === 'relays' && errors.relays && <p className="text-sm text-red-600 dark:text-red-400">{errors.relays}</p>}
      <button type="button" className={buttonClass} onClick={() => update({
        [kind]: [...input[kind], { id: `${kind}-${nextId.current++}`, address: '', port: '6000', advertise: kind === 'relays' }],
      })}>＋ {title}を追加</button>
    </section>;
  }

  async function copy(text: string, label: string) {
    try {
      setFeedback(await copyTextToClipboard(text) ? `${label}をコピーしました。` : 'コピーできませんでした。表示内容を選択してコピーしてください。');
    } catch {
      setFeedback('コピーできませんでした。表示内容を選択してコピーしてください。');
    }
  }

  function download() {
    if (json === null) return;
    const url = URL.createObjectURL(new Blob([json + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'topology.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback('JSON のダウンロードを開始しました。');
  }

  return <div className="not-prose my-6 min-w-0 space-y-6 rounded-xl border border-fd-border bg-fd-card p-4 sm:p-6" role="region" aria-label="トポロジー JSON 生成フォーム">
    <div>
      <p className="text-lg font-semibold">トポロジー JSON を生成</p>
      <p className="mt-2 text-sm text-fd-muted-foreground">接続先の情報を入力してください。入力内容は送信・保存されず、再読み込みでリセットされます。</p>
    </div>
    <div role="group" aria-label="生成対象" className="flex gap-2">
      {(['relay', 'bp'] as const).map((mode) => <button key={mode} type="button" aria-pressed={input.mode === mode}
        className={`${buttonClass} ${input.mode === mode ? 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90' : ''}`}
        onClick={() => update({ mode })}>{mode === 'relay' ? 'リレー用' : 'BP用'}</button>)}
    </div>
    <p className="text-sm">{input.mode === 'relay'
      ? '生成対象ノード自身は登録せず、BP・自分が管理する他のリレー・外部リレーを分けて入力してください。不要なリレー欄は削除できます。'
      : '接続する自リレーを1台以上登録してください。BP 自身の IP・ポートは不要です。'}</p>
    {input.mode === 'relay' && peerFields(input.bp, 'BP（localRoots）', 'bp')}
    {peerList('relays', '自リレー')}
    {input.mode === 'relay' && <>
      {peerList('external', '外部リレー')}
      <div>
        <label htmlFor={`${baseId}-snapshot`} className="text-sm font-medium">Peer Snapshot ファイルの絶対パス</label>
        <input id={`${baseId}-snapshot`} className={fieldClass} value={input.snapshotPath} autoComplete="off" spellCheck={false} required
          placeholder="/home/cardano/cnode/mainnet-peer-snapshot.json"
          aria-invalid={Boolean(errors.snapshotPath)} aria-describedby={`${baseId}-snapshot-help`}
          onChange={(event) => update({ snapshotPath: event.target.value })} />
        <p id={`${baseId}-snapshot-help`} className={`mt-1 text-xs ${errors.snapshotPath ? 'text-red-600 dark:text-red-400' : 'text-fd-muted-foreground'}`}>
          {errors.snapshotPath || '生成対象ノードに配置したファイルのパスです。ネットワークに対応するファイルを指定してください。'}</p>
      </div>
    </>}
    <section aria-label="生成結果" className="space-y-3 border-t border-fd-border pt-4">
      <p className="font-semibold">{input.mode === 'relay' ? 'リレー用' : 'BP用'} JSON</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={json === null} onClick={() => json !== null && void copy(json, 'JSON')}>JSONをコピー</button>
        <button type="button" className={buttonClass} disabled={json === null} onClick={download}>JSONをダウンロード</button>
      </div>
      {json === null ? <p className="text-sm text-fd-muted-foreground">入力内容を確認してください。すべての入力が有効になると JSON が表示されます。</p>
        : <pre tabIndex={0} className="max-h-[32rem] overflow-auto rounded-md bg-fd-muted p-4 text-xs"><code>{json}</code></pre>}
      <p className="text-xs text-fd-muted-foreground">ダウンロード名は topology.json です。配置時はネットワークに合わせて mainnet-topology.json などに変更してください。</p>
      <details>
        <summary className="cursor-pointer text-sm font-medium">ファイル作成コマンド</summary>
        <p className="my-3 text-sm text-fd-muted-foreground">生成対象ノードで NODE_HOME・NODE_CONFIG を設定してから実行します。既存のトポロジーファイルを上書きします。</p>
        <button type="button" className={buttonClass} disabled={command === null} onClick={() => command !== null && void copy(command, 'コマンド')}>コマンドをコピー</button>
        {command !== null && <pre tabIndex={0} className="mt-3 max-h-[32rem] overflow-auto rounded-md bg-fd-muted p-4 text-xs"><code>{command}</code></pre>}
      </details>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">{feedback}</p>
    </section>
  </div>;
}

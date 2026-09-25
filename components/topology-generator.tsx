'use client';

import { useId, useRef, useState } from 'react';
import { Check, Clipboard } from 'lucide-react';
import { copyTextToClipboard } from '@/components/copy-to-clipboard';
import { DEFAULT_SNAPSHOT_PATH, generateTopology, topologyCommand, type Peer, type TopologyInput } from '@/lib/topology-generator';

const fieldClass = 'mt-1 w-full rounded-md border border-fd-border bg-fd-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-fd-primary';
const buttonClass = 'rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-primary disabled:cursor-not-allowed disabled:opacity-50';
const bpPortCommand = 'grep -E \'^[[:space:]]*PORT=\' "$NODE_HOME/startBlockProducingNode.sh"';

export function TopologyGenerator() {
  const baseId = useId();
  const nextId = useRef(1);
  const [relayNumber, setRelayNumber] = useState<1 | 2>(1);
  const relayInputsByMode = useRef<Record<TopologyInput['mode'], Peer[]>>({
    relay: [],
    bp: [
      { id: 'bp-relay-1', address: '', port: '6000', advertise: true },
      { id: 'bp-relay-2', address: '', port: '6000', advertise: true },
    ],
  });
  const [input, setInput] = useState<TopologyInput>({
    mode: 'relay',
    bp: { id: 'bp', address: '', port: '', advertise: false },
    relays: [{ id: 'relay-0', address: '', port: '6000', advertise: true }],
    external: [],
    snapshotPath: DEFAULT_SNAPSHOT_PATH,
  });
  const [feedback, setFeedback] = useState('');
  const { errors, json } = generateTopology(input);
  const command = json === null ? null : topologyCommand(json);

  function update(change: Partial<TopologyInput>) {
    setInput((current) => ({ ...current, ...change }));
    setFeedback('');
  }

  function switchMode(mode: TopologyInput['mode']) {
    if (mode === input.mode) return;
    relayInputsByMode.current[input.mode] = input.relays;
    update({ mode, relays: relayInputsByMode.current[mode] });
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
        {kind === 'bp' && <div className="mt-3 space-y-2">
          <p className="text-xs text-fd-muted-foreground">BP ノードで次のコマンドを実行し、表示された PORT= の値をポート欄に入力してください。</p>
          <div className="relative rounded-md bg-fd-muted p-3 pr-14">
            <pre tabIndex={0} className="overflow-auto text-xs"><code>{bpPortCommand}</code></pre>
            <button type="button" className="absolute right-2 top-2 rounded-md p-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-fd-primary"
              title={feedback === 'BPポート確認コマンドをコピーしました。' ? 'コピー済み' : '確認コマンドをコピー'}
              aria-label="BPポート確認コマンドをコピー"
              onClick={() => void copy(bpPortCommand, 'BPポート確認コマンド')}>
              {feedback === 'BPポート確認コマンドをコピーしました。'
                ? <Check className="size-4" aria-hidden="true" />
                : <Clipboard className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          {kind === 'relays' ? <div>
            <label htmlFor={`${baseId}-${peer.id}-advertise`} className="text-sm">advertise</label>
            <select id={`${baseId}-${peer.id}-advertise`} className={fieldClass} value={String(peer.advertise)}
              aria-describedby={`${baseId}-${peer.id}-advertise-help`}
              onChange={(event) => change({ advertise: event.target.value === 'true' })}>
              <option value="true">true</option><option value="false">false</option>
            </select>
            <p id={`${baseId}-${peer.id}-advertise-help`} className="mt-1 text-xs text-fd-muted-foreground">この接続先を他のノードに知らせるか。デフォルトは true</p>
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
      {kind === 'external' && <p className="text-sm text-fd-muted-foreground">外部リレー（publicRoots）は、通常は追加しなくても問題ありません。必要な場合のみ登録してください。</p>}
      {kind === 'relays' && input.mode === 'relay' && <p className="text-sm text-fd-muted-foreground">
        リレー{relayNumber === 1 ? 2 : 1}の IP・ポートを入力してください。それ以外にも接続する自リレーがある場合は「＋ 自リレーを追加」で登録してください。リレー{relayNumber}自身は登録しないでください。
      </p>}
      {input[kind].map((peer, index) => {
        const label = kind === 'relays' && input.mode === 'relay'
          ? index === 0 ? `リレー${relayNumber === 1 ? 2 : 1}` : `その他の自リレー ${index}`
          : kind === 'relays' ? `リレー${index + 1}` : `${title} ${index + 1}`;
        return peerFields(peer, label, kind);
      })}
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

  return <div className="not-prose my-6 min-w-0 space-y-6 rounded-xl border border-fd-border bg-fd-card p-4 sm:p-6" role="region" aria-label="トポロジー JSON 生成フォーム">
    <div>
      <p className="text-lg font-semibold">トポロジーファイル作成コマンドを生成</p>
      <p className="mt-2 text-sm text-fd-muted-foreground">接続先の情報を入力してください。入力内容はSJGサーバーには送信・保存されず、再読み込みでリセットされます。</p>
    </div>
    <div role="group" aria-label="生成対象" className="flex gap-2">
      {(['relay', 'bp'] as const).map((mode) => <button key={mode} type="button" aria-pressed={input.mode === mode}
        className={`${buttonClass} ${input.mode === mode ? 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90' : ''}`}
        onClick={() => switchMode(mode)}>{mode === 'relay' ? 'リレー用' : 'BP用'}</button>)}
    </div>
    {input.mode === 'relay' && <div>
      <label htmlFor={`${baseId}-relay-number`} className="text-sm font-medium">トポロジーを作成するリレー</label>
      <select id={`${baseId}-relay-number`} className={fieldClass} value={relayNumber}
        aria-describedby={`${baseId}-relay-number-help`}
        onChange={(event) => {
          setRelayNumber(Number(event.target.value) as 1 | 2);
          update({ relays: [{ id: `relays-${nextId.current++}`, address: '', port: '6000', advertise: true }] });
        }}>
        <option value="1">リレー1用</option>
        <option value="2">リレー2用</option>
      </select>
      <p id={`${baseId}-relay-number-help`} className="mt-1 text-xs text-fd-muted-foreground">作成対象を切り替えると、自リレーの入力欄をリセットします。</p>
    </div>}
    <p className="text-sm">{input.mode === 'relay'
      ? `リレー${relayNumber}用のトポロジーを作成します。BP・自分が管理する他のリレー・外部リレーを分けて入力してください。不要なリレー欄は削除できます。`
      : '接続する自リレーを1台以上登録してください。BP 自身の IP・ポートは不要です。'}</p>
    {input.mode === 'relay' && peerFields(input.bp, 'BP（localRoots）', 'bp')}
    {peerList('relays', '自リレー')}
    {input.mode === 'relay' && <>
      {peerList('external', '外部リレー')}
      <div>
        <label htmlFor={`${baseId}-snapshot`} className="text-sm font-medium">Peer Snapshot ファイルのパス</label>
        <input id={`${baseId}-snapshot`} className={fieldClass} value={input.snapshotPath} autoComplete="off" spellCheck={false} required
          placeholder={DEFAULT_SNAPSHOT_PATH}
          aria-invalid={Boolean(errors.snapshotPath)} aria-describedby={`${baseId}-snapshot-help${errors.snapshotPath ? ` ${baseId}-snapshot-error` : ''}`}
          onChange={(event) => update({ snapshotPath: event.target.value })} />
        <p id={`${baseId}-snapshot-help`} className="mt-1 text-xs text-fd-muted-foreground">
          通常はこのままで問題ありません。独自のパスを採用している場合は変更してください。環境変数はコマンド実行時に対象ノードの値へ展開されます。</p>
        {errors.snapshotPath && <p id={`${baseId}-snapshot-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.snapshotPath}</p>}
      </div>
    </>}
    <section aria-label="生成結果" className="space-y-3 border-t border-fd-border pt-4">
      <p className="font-semibold">{input.mode === 'relay' ? `リレー${relayNumber}用` : 'BP用'} ファイル作成コマンド</p>
      <p className="text-sm text-fd-muted-foreground">以下のコマンドをコピーしてサーバーで実行してください</p>
      <button type="button" className={buttonClass} disabled={command === null} onClick={() => command !== null && void copy(command, 'コマンド')}>コマンドをコピー</button>
      {command === null ? <p className="text-sm text-fd-muted-foreground">入力内容を確認してください。すべての入力が有効になるとコマンドが表示されます。</p>
        : <pre tabIndex={0} className="max-h-[32rem] overflow-auto rounded-md bg-fd-muted p-4 text-xs"><code>{command}</code></pre>}
      <p role="status" aria-live="polite" className="min-h-5 text-sm">{feedback}</p>
    </section>
  </div>;
}

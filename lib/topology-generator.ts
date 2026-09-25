export type Peer = {
  id: string;
  address: string;
  port: string;
  advertise: boolean;
};

export type TopologyInput = {
  mode: 'relay' | 'bp';
  bp: Peer;
  relays: Peer[];
  external: Peer[];
  snapshotPath: string;
};

type Root = {
  accessPoints: { address: string; port: number }[];
  advertise: boolean;
};

export const DEFAULT_SNAPSHOT_PATH = '$NODE_HOME/${NODE_CONFIG}-peer-snapshot.json';
const environmentVariable = /\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/g;

function isIPv4(address: string): boolean {
  const parts = address.split('.');
  return parts.length === 4 && parts.every((part) => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

export function normalizeAddress(value: string): string {
  const address = value.trim().toLowerCase();
  if (address.includes(':')) {
    try {
      // URL's IPv6 parser also canonicalizes equivalent spellings for duplicate detection.
      return new URL(`http://[${address}]/`).hostname.slice(1, -1);
    } catch {
      return address;
    }
  }
  return address.replace(/\.$/, '');
}

export function validAddress(value: string, allowDNS: boolean): boolean {
  const address = value.trim();
  if (address.includes(':')) {
    if (!/^[\da-f:.]+$/i.test(address)) return false;
    try {
      return new URL(`http://[${address}]/`).hostname.startsWith('[');
    } catch {
      return false;
    }
  }
  if (/^[\d.]+$/.test(address)) return isIPv4(address);
  const hostname = address.replace(/\.$/, '');
  return allowDNS && hostname.length <= 253 && hostname.split('.').every(
    (label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label),
  );
}

export function generateTopology(input: TopologyInput) {
  const errors: Record<string, string> = {};
  const local = input.mode === 'relay'
    ? [{ ...input.bp, advertise: false }, ...input.relays]
    : input.relays;
  const external = input.mode === 'relay'
    ? input.external.map((peer) => ({ ...peer, advertise: false }))
    : [];
  const seen = new Map<string, string>();

  for (const peer of [...local, ...external]) {
    if (!validAddress(peer.address, peer.id !== input.bp.id)) {
      errors[`${peer.id}-address`] = peer.id === input.bp.id
        ? '有効な IP アドレスを入力してください。'
        : '有効な IP アドレスまたは DNS 名を入力してください。';
    }
    if (!/^\d+$/.test(peer.port) || Number(peer.port) < 1 || Number(peer.port) > 65535) {
      errors[`${peer.id}-port`] = 'ポートは 1〜65535 の整数で入力してください。';
    }
    if (!errors[`${peer.id}-address`] && !errors[`${peer.id}-port`]) {
      const key = `${normalizeAddress(peer.address)}|${Number(peer.port)}`;
      const previous = seen.get(key);
      if (previous) {
        errors[`${peer.id}-address`] = '同じアドレス・ポートが重複しています。';
        errors[`${previous}-address`] = '同じアドレス・ポートが重複しています。';
      }
      seen.set(key, peer.id);
    }
  }

  if (input.mode === 'bp' && !input.relays.length) {
    errors.relays = '自リレーを1台以上追加してください。';
  }
  const snapshotPath = input.snapshotPath.trim();
  const pathWithoutVariables = snapshotPath.replace(environmentVariable, 'ENV');
  const hasAbsolutePrefix = snapshotPath.startsWith('/') || /^\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)(?:\/|$)/.test(snapshotPath);
  if (input.mode === 'relay' && (!hasAbsolutePrefix || snapshotPath.endsWith('/') || /[$\x00-\x1f\x7f]/.test(pathWithoutVariables))) {
    errors.snapshotPath = '絶対パス、または $NODE_HOME などの環境変数を使ったファイルパスを入力してください。';
  }
  if (Object.keys(errors).length) return { errors, json: null };

  function group(peers: Peer[]): Root[] {
    const groups: Root[] = [];
    for (const peer of peers) {
      let root = groups.find((item) => item.advertise === peer.advertise);
      if (!root) {
        root = { accessPoints: [], advertise: peer.advertise };
        groups.push(root);
      }
      root.accessPoints.push({ address: normalizeAddress(peer.address), port: Number(peer.port) });
    }
    return groups;
  }

  const topology = {
    localRoots: group(local).map((root) => ({ ...root, trustable: false, hotValency: root.accessPoints.length })),
    ...(input.mode === 'relay' ? { peerSnapshotFile: snapshotPath } : {}),
    publicRoots: group(external),
    useLedgerAfterSlot: input.mode === 'relay' ? 194140785 : -1,
  };
  return { errors, json: JSON.stringify(topology, null, 2) };
}

export function topologyCommand(json: string): string {
  // Expand simple environment references at execution time; keep other shell syntax literal.
  // Double JSON backslashes so the unquoted heredoc preserves JSON escaping.
  const body = json.replace(/\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)|[\\`$]/g,
    (token) => token.length > 1 ? token : '\\' + token);
  return 'cat > "${NODE_HOME}/${NODE_CONFIG}-topology.json" <<TOPOLOGY_JSON\n' + body + '\nTOPOLOGY_JSON';
}

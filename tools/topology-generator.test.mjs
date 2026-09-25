import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

// Load the pure TypeScript module without adding a test-runner dependency.
const source = readFileSync(new URL('../lib/topology-generator.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { DEFAULT_SNAPSHOT_PATH, generateTopology, topologyCommand, validAddress } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

const peer = (id, address, advertise = true) => ({ id, address, port: '6000', advertise });
const fixture = () => ({
  mode: 'relay',
  bp: { ...peer('bp', '192.0.2.10', true), port: '50000' },
  relays: [peer('r1', '198.51.100.11'), peer('r2', '203.0.113.12')],
  external: [peer('e1', 'external.example.com'), peer('e2', 'other.example.com')],
  snapshotPath: '/home/cardano/cnode/mainnet-peer-snapshot.json',
});
function generate(input) {
  const result = generateTopology(input);
  assert.deepEqual(result.errors, {});
  return JSON.parse(result.json);
}

test('relay output enforces BP/external privacy and groups each root separately', () => {
  const result = generate(fixture());
  assert.deepEqual(result.localRoots, [
    { accessPoints: [{ address: '192.0.2.10', port: 50000 }], advertise: false, trustable: false, hotValency: 1 },
    { accessPoints: [{ address: '198.51.100.11', port: 6000 }, { address: '203.0.113.12', port: 6000 }], advertise: true, trustable: false, hotValency: 2 },
  ]);
  assert.deepEqual(result.publicRoots, [{
    accessPoints: [{ address: 'external.example.com', port: 6000 }, { address: 'other.example.com', port: 6000 }], advertise: false,
  }]);
  assert.equal(result.useLedgerAfterSlot, 194140785);
  assert.equal(result.peerSnapshotFile, fixture().snapshotPath);
});

test('private self-managed relays join the BP group', () => {
  const input = fixture();
  input.relays[0].advertise = false;
  const result = generate(input);
  assert.equal(result.localRoots[0].accessPoints.length, 2);
  assert.equal(result.localRoots[0].hotValency, 2);
  assert.equal(result.localRoots[1].hotValency, 1);
});

test('BP output ignores hidden fields and retains self-relay advertise choices', () => {
  const input = fixture();
  input.mode = 'bp';
  input.bp.address = '';
  input.external[0].port = 'invalid';
  input.snapshotPath = '';
  const result = generate(input);
  assert.equal(result.localRoots.length, 1);
  assert.equal(result.localRoots[0].advertise, true);
  assert.equal(result.localRoots[0].hotValency, 2);
  assert.deepEqual(result.publicRoots, []);
  assert.equal(result.useLedgerAfterSlot, -1);
  assert.equal('peerSnapshotFile' in result, false);
});

test('zero relays is allowed for relay output but not BP output', () => {
  const input = { ...fixture(), relays: [], external: [] };
  assert.deepEqual(generate(input).publicRoots, []);
  const result = generateTopology({ ...input, mode: 'bp' });
  assert.equal(result.json, null);
  assert.ok(result.errors.relays);
});

test('port boundaries and malformed input block output', () => {
  for (const port of ['', '0', '65536', '-1', '1.5', '1e3', 'abc']) {
    const input = fixture();
    input.bp.port = port;
    const result = generateTopology(input);
    assert.equal(result.json, null, port);
    assert.ok(result.errors['bp-port'], port);
  }
  for (const port of ['1', '65535']) {
    const input = fixture();
    input.bp.port = port;
    assert.equal(generate(input).localRoots[0].accessPoints[0].port, Number(port));
  }
});

test('accepts IPv4/IPv6 and DNS only where allowed', () => {
  for (const address of ['192.0.2.10', '2001:db8::1', '::1', '::ffff:192.0.2.1']) assert.ok(validAddress(address, false), address);
  for (const address of ['', '999.1.1.1', '01.2.3.4', 'https://relay.example.com', 'relay.example.com:6000', 'a b', '-bad.example', 'bad_.example', '[::1]', '2001:::1']) assert.equal(validAddress(address, true), false, address);
  assert.equal(validAddress('relay.example.com', false), false);
  assert.equal(validAddress('relay.example.com', true), true);
});

test('duplicates across roots and equivalent DNS/IPv6 spellings block output', () => {
  for (const addresses of [['RELAY.example.com.', 'relay.example.com'], ['2001:db8::1', '2001:0db8:0:0:0:0:0:1']]) {
    const input = fixture();
    input.relays[0].address = addresses[0];
    input.external[0].address = addresses[1];
    const result = generateTopology(input);
    assert.equal(result.json, null);
    assert.match(result.errors['r1-address'], /重複/);
    assert.match(result.errors['e1-address'], /重複/);
  }
});

test('snapshot paths require an absolute path or valid environment references', () => {
  for (const snapshotPath of ['', 'relative.json', '/home/cardano/', '/tmp/file\n.json', '${NODE_HOME/mainnet.json', '/tmp/$(whoami).json', '${NODE_HOME:-/tmp}/snapshot.json']) {
    const result = generateTopology({ ...fixture(), snapshotPath });
    assert.equal(result.json, null);
    assert.ok(result.errors.snapshotPath);
  }
});

test('snapshot paths retain environment references in the generated command', () => {
  assert.equal(DEFAULT_SNAPSHOT_PATH, '$NODE_HOME/${NODE_CONFIG}-peer-snapshot.json');
  for (const snapshotPath of [DEFAULT_SNAPSHOT_PATH, '${NODE_HOME}/$NODE_CONFIG-peer-snapshot.json', '$HOME/cnode/${NODE_CONFIG}-peer-snapshot.json', '/home/$USER/mainnet.json']) {
    const input = { ...fixture(), snapshotPath };
    assert.equal(generate(input).peerSnapshotFile, snapshotPath);
    assert.ok(topologyCommand(generateTopology(input).json).includes(snapshotPath));
  }
});

test('default snapshot path expands on the target node for each network', () => {
  const directory = mkdtempSync(join(tmpdir(), 'topology env test-'));
  try {
    for (const network of ['mainnet', 'preprod', 'preview']) {
      const { json } = generateTopology({ ...fixture(), snapshotPath: DEFAULT_SNAPSHOT_PATH });
      const command = topologyCommand(json);
      assert.ok(command.startsWith('cat > "${NODE_HOME}/${NODE_CONFIG}-topology.json" <<TOPOLOGY_JSON\n'));
      execFileSync('bash', ['--noprofile', '--norc', '-c', command], {
        env: { PATH: process.env.PATH, BASH_ENV: '/dev/null', NODE_HOME: directory, NODE_CONFIG: network },
      });
      const saved = JSON.parse(readFileSync(join(directory, `${network}-topology.json`), 'utf8'));
      assert.equal(saved.peerSnapshotFile, `${directory}/${network}-peer-snapshot.json`);
      assert.deepEqual(saved.localRoots, JSON.parse(json).localRoots);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('generated command writes identical JSON without expanding shell content', () => {
  const directory = mkdtempSync(join(tmpdir(), 'topology-test-'));
  try {
    const input = fixture();
    input.snapshotPath = '/tmp/`printf SHOULD_NOT_RUN`/a"b\\c.json';
    const { json } = generateTopology(input);
    assert.ok(json);
    execFileSync('bash', ['--noprofile', '--norc', '-c', topologyCommand(json)], {
      env: { PATH: process.env.PATH, BASH_ENV: '/dev/null', NODE_HOME: directory, NODE_CONFIG: 'mainnet' },
    });
    assert.equal(readFileSync(join(directory, 'mainnet-topology.json'), 'utf8'), json + '\n');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

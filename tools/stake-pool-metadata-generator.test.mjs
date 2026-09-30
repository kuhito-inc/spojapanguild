import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Load the pure TypeScript module without adding a test-runner dependency.
const source = readFileSync(new URL('../lib/stake-pool-metadata-generator.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { generateExtendedStakePoolMetadata, generateStakePoolMetadata, MAX_METADATA_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

const standardInput = {
  name: 'MyPoolName',
  description: 'My pool description',
  ticker: 'MPN',
  homepage: 'https://myadapoolnamerocks.com',
  includeExtended: false,
  extended: '',
};

const extendedInput = {
  iconUrl: '',
  logoUrl: '',
  location: '',
  twitterHandle: '',
  telegramHandle: '',
  youtubeHandle: '',
  discordHandle: '',
  githubHandle: '',
};

test('generates the standard four-field metadata JSON', () => {
  const result = generateStakePoolMetadata(standardInput);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(JSON.parse(result.json), {
    name: 'MyPoolName',
    description: 'My pool description',
    ticker: 'MPN',
    homepage: 'https://myadapoolnamerocks.com',
  });
  assert.equal('extended' in JSON.parse(result.json), false);
});

test('adds extended only when the checkbox is enabled', () => {
  const url = 'https://xstakepool.com/xsp-extended.json';
  const disabled = generateStakePoolMetadata({ ...standardInput, extended: 'invalid' });
  assert.deepEqual(disabled.errors, {});
  assert.equal('extended' in JSON.parse(disabled.json), false);

  const enabled = generateStakePoolMetadata({ ...standardInput, includeExtended: true, extended: url });
  assert.deepEqual(enabled.errors, {});
  assert.equal(JSON.parse(enabled.json).extended, url);
});

test('accepts the requested Japanese extended metadata sample', () => {
  const result = generateStakePoolMetadata({
    name: 'X-StakePool',
    description: 'XSPは2020年よりCardanoステークプールを運営し、SPO支援やコミュニティ活動を通じて日本のCardanoエコシステムの発展に取り組んでいます。今後も安定運営と分散化への貢献を続けてまいります。',
    ticker: 'XSP',
    homepage: 'https://xstakepool.com',
    includeExtended: true,
    extended: 'https://xstakepool.com/xsp-extended.json',
  });
  assert.deepEqual(result.errors, {});
  assert.ok(result.byteLength <= MAX_METADATA_BYTES);
  assert.equal(Buffer.byteLength(result.json), result.byteLength);
});

test('normalizes ticker casing and surrounding whitespace', () => {
  const result = generateStakePoolMetadata({ ...standardInput, name: ' My Pool ', ticker: 'mp1' });
  assert.deepEqual(result.errors, {});
  assert.equal(JSON.parse(result.json).name, 'My Pool');
  assert.equal(JSON.parse(result.json).ticker, 'MP1');
});

test('rejects malformed fields and non-HTTPS URLs', () => {
  const result = generateStakePoolMetadata({
    ...standardInput,
    name: '',
    description: 'a'.repeat(256),
    ticker: 'AB-',
    homepage: 'http://example.com',
    includeExtended: true,
    extended: 'not-a-url',
  });
  for (const field of ['name', 'description', 'ticker', 'homepage', 'extended']) assert.ok(result.errors[field], field);
});

test('blocks generated files larger than 512 UTF-8 bytes', () => {
  const result = generateStakePoolMetadata({
    ...standardInput,
    name: 'n'.repeat(50),
    description: '界'.repeat(120),
    homepage: `https://${'a'.repeat(52)}.com`,
  });
  assert.ok(result.byteLength > MAX_METADATA_BYTES);
  assert.ok(result.errors.file);
});

test('generates the reduced extended metadata structure and keeps blank social keys', () => {
  const result = generateExtendedStakePoolMetadata({
    ...extendedInput,
    iconUrl: 'https://example.com/icon.png',
    logoUrl: 'https://example.com/logo.png',
    location: 'Japan',
    twitterHandle: 'xstakepool',
    discordHandle: 'xstakepool',
  });
  assert.deepEqual(result.errors, {});
  assert.deepEqual(JSON.parse(result.json), {
    info: {
      url_png_icon_64x64: 'https://example.com/icon.png',
      url_png_logo: 'https://example.com/logo.png',
      location: 'Japan',
      social: {
        twitter_handle: 'xstakepool',
        telegram_handle: '',
        youtube_handle: '',
        discord_handle: 'xstakepool',
        github_handle: '',
      },
    },
  });
});

test('generates a blank template and validates supplied image URLs', () => {
  const empty = generateExtendedStakePoolMetadata(extendedInput);
  assert.deepEqual(empty.errors, {});
  assert.deepEqual(Object.keys(JSON.parse(empty.json)), ['info']);

  const invalid = generateExtendedStakePoolMetadata({
    ...extendedInput,
    iconUrl: 'http://example.com/icon.png',
    logoUrl: 'not-a-url',
  });
  for (const field of ['iconUrl', 'logoUrl']) assert.ok(invalid.errors[field], field);
});

test('maps the five supported social handles and excludes removed sections', () => {
  const result = generateExtendedStakePoolMetadata({
    ...extendedInput,
    twitterHandle: 'twitter',
    telegramHandle: 'telegram',
    youtubeHandle: 'youtube',
    discordHandle: 'discord',
    githubHandle: 'github',
  });
  assert.deepEqual(result.errors, {});
  const json = JSON.parse(result.json);
  assert.deepEqual(json.info.social, {
    twitter_handle: 'twitter',
    telegram_handle: 'telegram',
    youtube_handle: 'youtube',
    discord_handle: 'discord',
    github_handle: 'github',
  });
  for (const key of ['company', 'about', 'my-pool-ids', 'when-satured-then-recommend']) {
    assert.equal(key in json, false, key);
    assert.equal(key in json.info, false, `info.${key}`);
  }
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/stake-pool-metadata-validator.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { validateMetadataDocument } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

const extended = () => ({
  info: {
    url_png_icon_64x64: 'https://example.com/icon.png',
    url_png_logo: 'https://example.com/logo.png',
    location: 'Japan',
    social: {
      twitter_handle: '',
      telegram_handle: '',
      youtube_handle: '',
      discord_handle: '',
      github_handle: '',
    },
  },
});

test('accepts the supported extended structure and returns both image checks', () => {
  const result = validateMetadataDocument('extended', extended(), 300);
  assert.equal(result.issues.some((issue) => issue.level === 'error'), false);
  assert.match(result.issues[0].message, /構造/);
  assert.deepEqual(result.images, [
    { field: 'url_png_icon_64x64', label: '64×64アイコン', url: 'https://example.com/icon.png', require64Square: true },
    { field: 'url_png_logo', label: 'ロゴ', url: 'https://example.com/logo.png', require64Square: false },
  ]);
});

test('reports removed and unknown extended keys', () => {
  const value = extended();
  value.company = {};
  value.info.about = {};
  value.info.social.facebook_handle = '';
  const result = validateMetadataDocument('extended', value, 300);
  const warnings = result.issues.filter((issue) => issue.level === 'warning').map((issue) => issue.message).join('\n');
  assert.match(warnings, /company/);
  assert.match(warnings, /about/);
  assert.match(warnings, /facebook_handle/);
});

test('rejects missing social fields and invalid image URLs', () => {
  const value = extended();
  value.info.url_png_icon_64x64 = 'http://example.com/icon.png';
  value.info.social = { twitter_handle: 123 };
  const result = validateMetadataDocument('extended', value, 300);
  const errors = result.issues.filter((issue) => issue.level === 'error').map((issue) => issue.message).join('\n');
  assert.match(errors, /url_png_icon_64x64/);
  assert.match(errors, /twitter_handle/);
  assert.match(errors, /github_handle/);
  assert.equal(result.images.some((image) => image.field === 'url_png_icon_64x64'), false);
});

test('accepts standard metadata within 512 bytes', () => {
  const value = {
    name: 'MyPoolName',
    description: 'My pool description',
    ticker: 'MPN',
    homepage: 'https://example.com',
    extended: 'https://example.com/extended-metadata.json',
  };
  const result = validateMetadataDocument('standard', value, Buffer.byteLength(JSON.stringify(value)));
  assert.equal(result.issues.some((issue) => issue.level === 'error'), false);
  assert.equal(result.images.length, 0);
});

test('rejects oversized or malformed standard metadata', () => {
  const result = validateMetadataDocument('standard', {
    name: '',
    description: 'description',
    ticker: 'bad',
    homepage: 'http://example.com',
  }, 513);
  const errors = result.issues.filter((issue) => issue.level === 'error').map((issue) => issue.message).join('\n');
  assert.match(errors, /name/);
  assert.match(errors, /ticker/);
  assert.match(errors, /homepage/);
  assert.match(errors, /512/);
});

export type StakePoolMetadataKind = 'standard' | 'extended';
export type MetadataValidationLevel = 'success' | 'warning' | 'error';

export type MetadataValidationIssue = {
  level: MetadataValidationLevel;
  message: string;
};

export type MetadataImageTarget = {
  field: 'url_png_icon_64x64' | 'url_png_logo';
  label: string;
  url: string;
  require64Square: boolean;
};

export type MetadataDocumentValidation = {
  issues: MetadataValidationIssue[];
  images: MetadataImageTarget[];
};

const standardKeys = new Set(['name', 'description', 'ticker', 'homepage', 'extended']);
const infoKeys = new Set(['url_png_icon_64x64', 'url_png_logo', 'location', 'social']);
const socialKeys = ['twitter_handle', 'telegram_handle', 'youtube_handle', 'discord_handle', 'github_handle'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function characterLength(value: string): number {
  return Array.from(value).length;
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function unexpectedKeys(value: Record<string, unknown>, allowed: Set<string>): string[] {
  return Object.keys(value).filter((key) => !allowed.has(key));
}

export function validateMetadataDocument(
  kind: StakePoolMetadataKind,
  value: unknown,
  byteLength: number,
): MetadataDocumentValidation {
  return kind === 'standard'
    ? validateStandardMetadata(value, byteLength)
    : validateExtendedMetadata(value);
}

function validateStandardMetadata(value: unknown, byteLength: number): MetadataDocumentValidation {
  const issues: MetadataValidationIssue[] = [];
  if (!isRecord(value)) {
    return { issues: [{ level: 'error', message: 'JSONの最上位はオブジェクトにしてください。' }], images: [] };
  }

  const fields = ['name', 'description', 'ticker', 'homepage'] as const;
  for (const field of fields) {
    if (typeof value[field] !== 'string' || !value[field].trim()) {
      issues.push({ level: 'error', message: `${field} は空でない文字列にしてください。` });
    }
  }
  if (typeof value.name === 'string' && characterLength(value.name.trim()) > 50) {
    issues.push({ level: 'error', message: 'name は50文字以内にしてください。' });
  }
  if (typeof value.description === 'string' && characterLength(value.description.trim()) > 255) {
    issues.push({ level: 'error', message: 'description は255文字以内にしてください。' });
  }
  if (typeof value.ticker === 'string' && !/^[A-Z0-9]{3,5}$/.test(value.ticker.trim())) {
    issues.push({ level: 'error', message: 'ticker は半角英大文字・数字の3〜5文字にしてください。' });
  }
  if (typeof value.homepage === 'string' && !isHttpsUrl(value.homepage.trim())) {
    issues.push({ level: 'error', message: 'homepage は https:// から始まる有効なURLにしてください。' });
  }
  if ('extended' in value && (typeof value.extended !== 'string' || !isHttpsUrl(value.extended.trim()))) {
    issues.push({ level: 'error', message: 'extended は https:// から始まる有効なURLにしてください。' });
  }
  if (byteLength > 512) {
    issues.push({ level: 'error', message: `ファイルサイズは512バイト以内にしてください（現在 ${byteLength}バイト）。` });
  } else {
    issues.push({ level: 'success', message: `ファイルサイズは ${byteLength}バイトで、512バイト以内です。` });
  }

  const extras = unexpectedKeys(value, standardKeys);
  if (extras.length) {
    issues.push({ level: 'warning', message: `標準外のキーがあります: ${extras.join(', ')}` });
  }
  if (!issues.some((issue) => issue.level === 'error')) {
    issues.unshift({ level: 'success', message: '通常メタデータの必須項目と形式を確認できました。' });
  }
  return { issues, images: [] };
}

function validateExtendedMetadata(value: unknown): MetadataDocumentValidation {
  const issues: MetadataValidationIssue[] = [];
  const images: MetadataImageTarget[] = [];
  if (!isRecord(value)) {
    return { issues: [{ level: 'error', message: 'JSONの最上位はオブジェクトにしてください。' }], images };
  }
  if (!isRecord(value.info)) {
    return { issues: [{ level: 'error', message: 'info オブジェクトがありません。' }], images };
  }

  const rootExtras = unexpectedKeys(value, new Set(['info']));
  if (rootExtras.length) {
    issues.push({ level: 'warning', message: `不要な最上位キーがあります: ${rootExtras.join(', ')}` });
  }
  const infoExtras = unexpectedKeys(value.info, infoKeys);
  if (infoExtras.length) {
    issues.push({ level: 'warning', message: `info に不要なキーがあります: ${infoExtras.join(', ')}` });
  }

  for (const [field, label, require64Square] of [
    ['url_png_icon_64x64', '64×64アイコン', true],
    ['url_png_logo', 'ロゴ', false],
  ] as const) {
    const imageUrl = value.info[field];
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      issues.push({ level: 'warning', message: `${field} が未設定です。` });
    } else if (!isHttpsUrl(imageUrl.trim())) {
      issues.push({ level: 'error', message: `${field} は https:// から始まる有効なURLにしてください。` });
    } else {
      images.push({ field, label, url: imageUrl.trim(), require64Square });
    }
  }

  if (typeof value.info.location !== 'string' || !value.info.location.trim()) {
    issues.push({ level: 'warning', message: 'location が未設定です。' });
  }
  if (!isRecord(value.info.social)) {
    issues.push({ level: 'error', message: 'info.social オブジェクトがありません。' });
  } else {
    for (const key of socialKeys) {
      if (typeof value.info.social[key] !== 'string') {
        issues.push({ level: 'error', message: `info.social.${key} は文字列にしてください。未使用の場合は空文字にします。` });
      }
    }
    const socialExtras = unexpectedKeys(value.info.social, new Set(socialKeys));
    if (socialExtras.length) {
      issues.push({ level: 'warning', message: `social に標準外のキーがあります: ${socialExtras.join(', ')}` });
    }
  }

  if (!issues.some((issue) => issue.level === 'error')) {
    issues.unshift({ level: 'success', message: '拡張メタデータのJSON構造を確認できました。' });
  }
  return { issues, images };
}

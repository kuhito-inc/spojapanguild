export type StakePoolMetadataInput = {
  name: string;
  description: string;
  ticker: string;
  homepage: string;
  includeExtended: boolean;
  extended: string;
};

export type StakePoolMetadataField = 'name' | 'description' | 'ticker' | 'homepage' | 'extended' | 'file';

export type StakePoolMetadataResult = {
  errors: Partial<Record<StakePoolMetadataField, string>>;
  json: string;
  byteLength: number;
};

export type ExtendedStakePoolMetadataInput = {
  iconUrl: string;
  logoUrl: string;
  location: string;
  twitterHandle: string;
  telegramHandle: string;
  youtubeHandle: string;
  discordHandle: string;
  githubHandle: string;
};

export type ExtendedStakePoolMetadataField = keyof ExtendedStakePoolMetadataInput;

export type ExtendedStakePoolMetadataResult = {
  errors: Partial<Record<ExtendedStakePoolMetadataField, string>>;
  json: string;
  byteLength: number;
};

export const MAX_METADATA_BYTES = 512;

function characterLength(value: string): number {
  return Array.from(value).length;
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

export function generateStakePoolMetadata(input: StakePoolMetadataInput): StakePoolMetadataResult {
  const errors: StakePoolMetadataResult['errors'] = {};
  const name = input.name.trim();
  const description = input.description.trim();
  const ticker = input.ticker.trim().toUpperCase();
  const homepage = input.homepage.trim();
  const extended = input.extended.trim();

  if (!name) errors.name = 'プール名を入力してください。';
  else if (characterLength(name) > 50) errors.name = 'プール名は50文字以内で入力してください。';

  if (!description) errors.description = 'プールの説明を入力してください。';
  else if (characterLength(description) > 255) errors.description = '説明は255文字以内で入力してください。';

  if (!/^[A-Z0-9]{3,5}$/.test(ticker)) {
    errors.ticker = 'Tickerは半角英大文字と数字を使い、3〜5文字で入力してください。';
  }

  if (!isHttpsUrl(homepage)) errors.homepage = 'https:// から始まる有効なURLを入力してください。';
  else if (characterLength(homepage) > 64) errors.homepage = 'ホームページURLは64文字以内で入力してください。';

  if (input.includeExtended && !isHttpsUrl(extended)) {
    errors.extended = 'https:// から始まる拡張メタデータのURLを入力してください。';
  }

  const metadata: Record<string, string> = { name, description, ticker, homepage };
  if (input.includeExtended) metadata.extended = extended;

  const json = `${JSON.stringify(metadata, null, 2)}\n`;
  const byteLength = new TextEncoder().encode(json).byteLength;
  if (byteLength > MAX_METADATA_BYTES) {
    errors.file = `生成されるJSONは${MAX_METADATA_BYTES}バイト以内にしてください（現在 ${byteLength}バイト）。`;
  }

  return { errors, json, byteLength };
}

export function generateExtendedStakePoolMetadata(input: ExtendedStakePoolMetadataInput): ExtendedStakePoolMetadataResult {
  const errors: ExtendedStakePoolMetadataResult['errors'] = {};
  const values = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value.trim()]),
  ) as Record<keyof ExtendedStakePoolMetadataInput, string>;

  for (const field of ['iconUrl', 'logoUrl'] as const) {
    if (values[field] && !isHttpsUrl(values[field])) {
      errors[field] = 'https:// から始まる有効なURLを入力してください。';
    }
  }

  const metadata = {
    info: {
      url_png_icon_64x64: values.iconUrl,
      url_png_logo: values.logoUrl,
      location: values.location,
      social: {
        twitter_handle: values.twitterHandle,
        telegram_handle: values.telegramHandle,
        youtube_handle: values.youtubeHandle,
        discord_handle: values.discordHandle,
        github_handle: values.githubHandle,
      },
    },
  };
  const json = `${JSON.stringify(metadata, null, 2)}\n`;

  return {
    errors,
    json,
    byteLength: new TextEncoder().encode(json).byteLength,
  };
}

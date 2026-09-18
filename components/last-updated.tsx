export type LastUpdatedProps = {
  date?: Date | string | null;
  version?: string;
};

/** The docs page supplies this document's latest Git commit date. */
export function LastUpdated({ date, version }: LastUpdatedProps) {
  const parsed = date ? new Date(date) : null;
  const valid = parsed && !Number.isNaN(parsed.getTime());

  return (
    <p>
      最終更新日：
      {valid ? (
        <time dateTime={parsed.toISOString()}>
          {new Intl.DateTimeFormat('ja-JP', {
            timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
          }).format(parsed)}
        </time>
      ) : '未コミット'}
      {version && ` ${version}`}
    </p>
  );
}

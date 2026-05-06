export function getSection(path: string | undefined) {
  if (!path) return 'intro';
  const [dir] = path.split('/', 1);
  if (!dir) return 'intro';
  return (
    {
      cardano: 'cardano',
      midnight: 'midnight',
    }[dir] ?? 'intro'
  );
}

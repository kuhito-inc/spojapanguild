export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-fd-border bg-fd-background py-4">
      <p className="text-center text-xs tracking-wide text-fd-muted-foreground">
        Copyright © 2020 – {year} SPO JAPAN GUILD
      </p>
    </footer>
  );
}

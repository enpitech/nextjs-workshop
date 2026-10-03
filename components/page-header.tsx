// The top of a page: a small label, the title, and the page's own intro.
// No directive: it joins whichever graph imports it. Its importers are pages, so it renders on the server.
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {children}
    </header>
  );
}

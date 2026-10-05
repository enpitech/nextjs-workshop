import Link from "next/link";

const parts = [
  {
    href: "/spa/query",
    title: "TanStack Query, first data from the server",
    text: "A Server Component fetches. The Client Component keeps using useSuspenseQuery.",
  },
  {
    href: "/spa/use",
    title: "A promise in a provider, read with use()",
    text: "A Server Component starts the read. A Client Component deep below unwraps it.",
  },
];

export default function Spa() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Live demos
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Your SPA inside Next.js</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          You keep your React components and TanStack Query. You add a server to one route at a
          time. Open each route with the Network tab on.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {parts.map((p, i) => (
          <li key={p.href} className="panel flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-semibold text-accent-strong tabular-nums">
                {i + 1}
              </span>
              <h2 className="pt-1.5 font-medium leading-snug">{p.title}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted">{p.text}</p>
            <Link
              href={p.href}
              className="btn-primary mt-auto inline-flex items-center justify-center rounded-[0.625rem] border px-3 py-1.5 text-sm font-medium"
            >
              {p.href}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import Link from "next/link";

const breaks = [
  { n: 1, title: "A function crosses the boundary", routes: ["broken", "fixed"] },
  { n: 2, title: "The barrel-file trap", routes: ["broken", "fixed"] },
  { n: 3, title: "The dynamic cascade", routes: ["broken/a", "fixed/a"] },
  { n: 4, title: "The waterfall", routes: ["broken", "fixed"] },
  { n: 5, title: "The stale read", routes: ["broken", "fixed"] },
  { n: 6, title: "Pages-era patterns", routes: ["broken", "fixed"] },
  { n: 7, title: "The hydration mismatch", routes: ["broken", "fixed"] },
  { n: 8, title: "The provider in the layout", routes: ["broken", "fixed"] },
  { n: 9, title: "The secret in the client graph", routes: ["broken", "fixed"] },
];

export default function Breaks() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Live demos
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Breaks</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          Nine ways an App Router app goes wrong. Each break has a broken route and a fixed route.
          Open both and compare the code.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {breaks.map((b) => (
          <li key={b.n} className="panel flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-semibold text-accent-strong tabular-nums">
                #{b.n}
              </span>
              <h2 className="pt-1.5 font-medium leading-snug">{b.title}</h2>
            </div>
            <div className="mt-auto flex gap-2 text-sm">
              {b.routes.map((r) => {
                const broken = r.startsWith("broken");
                return (
                  <Link
                    key={r}
                    href={`/breaks/${b.n}/${r}`}
                    className={
                      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[0.625rem] border px-3 py-1.5 font-medium transition-colors " +
                      (broken
                        ? "border-danger/20 bg-danger-soft text-danger hover:border-danger/50"
                        : "border-line-strong bg-surface hover:border-accent hover:bg-accent-soft hover:text-accent-strong")
                    }
                  >
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${broken ? "bg-danger" : "bg-accent"}`}
                    />
                    {r}
                  </Link>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

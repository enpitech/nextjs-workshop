// The "Best guesses from Jev" box. It gets plain [name, probability] pairs,
// so it never touches lib/jev.ts.
const pct = (n: number) => Math.round(n * 100);

export function GuessBars({ guesses }: { guesses: [string, number][] }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-4 py-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Best guesses from Jev
      </p>
      <ul className="space-y-2 text-sm">
        {guesses.map(([name, p], i) => (
          <li key={name} className="flex items-center gap-3">
            <span className={`w-36 truncate ${i === 0 ? "font-medium" : "text-muted"}`}>
              {name}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className={`block h-2 rounded-full ${i === 0 ? "bg-accent" : "bg-faint"}`}
                style={{ width: `${pct(p)}%` }}
              />
            </span>
            <span className="w-10 text-right text-muted tabular-nums">{pct(p)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

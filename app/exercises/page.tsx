import Link from "next/link";

const exercises = [
  { n: 0, title: "Build the speakers section" },
  { n: 1, title: "Fix Break #1 yourself" },
  { n: 2, title: "The boundary refactor" },
  { n: 3, title: "Fix the waterfall" },
  { n: 4, title: "Write the vote action" },
  { n: 5, title: "A title for every talk (homework)" },
  { n: 6, title: "A Route Handler with status codes (homework)" },
  { n: 7, title: "Catch the errors" },
];

export default function Exercises() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Hands on
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Exercises</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          Each exercise has a README.md next to its page.tsx. Edit in place. Reset with{" "}
          <code>git checkout .</code>
        </p>
      </header>
      <ul className="space-y-3">
        {exercises.map((e) => (
          <li key={e.n} className="panel flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft font-semibold text-accent-strong tabular-nums">
              {e.n}
            </span>
            <span className="flex-1 font-medium">{e.title}</span>
            <span className="flex gap-2 text-sm">
              <Link
                href={`/exercises/${e.n}`}
                className="btn-primary inline-flex rounded-[0.625rem] border px-3.5 py-1.5 font-medium"
              >
                Start
              </Link>
              <Link
                href={`/exercises/${e.n}/solution`}
                className="inline-flex rounded-[0.625rem] border border-line-strong bg-surface px-3.5 py-1.5 font-medium transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-strong"
              >
                Solution
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

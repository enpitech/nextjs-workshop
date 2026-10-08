// Exercise 9: the links below go to routes that do not exist yet. Build them. See README.md.
import Link from "next/link";

const pages = [
  { href: "/exercises/9/board", note: "Tasks 1 to 5: the board, the greeting, the vote" },
];

// Plain <a> on purpose: the browser shows the raw response.
const api = [
  { href: "/exercises/9/board/api/talks", note: "Task 6: the talks as JSON, from the cache" },
];

export default function Exercise9() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 9: make the talk board fast</h1>
      <p className="mb-6 text-sm text-muted">
        Every link shows the 404 page until you create the files under{" "}
        <code>app/exercises/9/board/</code>. Work through the tasks in README.md in order. The
        webhook in Task 7 takes a POST, so you call it with curl, not with a link.
      </p>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Page</h2>
      <ul className="panel mb-6 divide-y divide-line">
        {pages.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-accent-soft/60"
            >
              <code className="text-ink">{p.href}</code>
              <span className="text-sm text-muted">{p.note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Route Handler
      </h2>
      <ul className="panel divide-y divide-line">
        {api.map((p) => (
          <li key={p.href}>
            <a
              href={p.href}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-accent-soft/60"
            >
              <code className="text-ink">{p.href}</code>
              <span className="text-sm text-muted">{p.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

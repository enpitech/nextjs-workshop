// Exercise 8: the links below go to routes that do not exist yet. Build them. See README.md.
import Link from "next/link";

const pages = [
  { href: "/exercises/8/dashboard", note: "Tasks 1 to 4 and 11: the layout, the numbers, the speakers, the theme" },
  { href: "/exercises/8/dashboard/talks", note: "Tasks 5 and 6: the table and the vote button" },
  { href: "/exercises/8/dashboard/talks/1", note: "Tasks 7 and 9: one talk, with its own title" },
  { href: "/exercises/8/dashboard/talks/99", note: "Task 8: no such talk, so a 404" },
  { href: "/exercises/8/dashboard/talks/boom", note: "Task 8: a crash, so the error box" },
  { href: "/exercises/8/dashboard/votes", note: "Stretch: an old bookmark that must still work" },
];

// Plain <a> on purpose: the browser shows the raw response.
const api = [
  { href: "/exercises/8/dashboard/api/talks", note: "Task 10: 200 and all talks as JSON" },
  { href: "/exercises/8/dashboard/api/talks?category=ai", note: "Task 10: 200 and the ai talks" },
  { href: "/exercises/8/dashboard/api/talks?category=xyz", note: "Task 10: 400 and an error body" },
];

export default function Exercise8() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 8: the organizer dashboard</h1>
      <p className="mb-6 text-sm text-muted">
        Every link shows the 404 page until you create the files under{" "}
        <code>app/exercises/8/dashboard/</code>. Work through the tasks in README.md in order.
      </p>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Pages</h2>
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

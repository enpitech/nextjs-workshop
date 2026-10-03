// Exercise 0: the links below go to routes that do not exist yet. Build them. See README.md.
import Link from "next/link";

const targets = [
  { href: "/exercises/0/speakers", note: "the list page and the layout" },
  { href: "/exercises/0/speakers/1", note: "one speaker" },
  { href: "/exercises/0/speakers/3", note: "another speaker" },
  { href: "/exercises/0/speakers/99", note: "stretch: no such speaker" },
];

export default function Exercise0() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 0</h1>
      <p className="mb-6 text-sm text-muted">
        Every link shows the 404 page until you create the files under{" "}
        <code>app/exercises/0/speakers/</code>.
      </p>
      <ul className="panel divide-y divide-line">
        {targets.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent-soft/60"
            >
              <code className="text-ink">{t.href}</code>
              <span className="text-sm text-muted">{t.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

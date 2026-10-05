// Exercise 7, solution. The same three links, one folder down.
import Link from "next/link";

const targets = [
  { href: "/exercises/7/solution/1", note: "works: one speaker" },
  { href: "/exercises/7/solution/boom", note: "error.tsx catches it" },
  { href: "/exercises/7/solution/99", note: "the closer not-found.tsx" },
];

export default function Solution7() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 7: solution</h1>
      <p className="mb-6 text-sm text-muted">
        Open each link. The nav stays, and only the speaker area changes.
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

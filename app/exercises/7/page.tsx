// Exercise 7: two of the links below fail in a bad way. Fix them with error.tsx and not-found.tsx. See README.md.
import Link from "next/link";

const targets = [
  { href: "/exercises/7/1", note: "works: one speaker" },
  { href: "/exercises/7/boom", note: "throws a render error" },
  { href: "/exercises/7/99", note: "no such speaker" },
];

export default function Exercise7() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 7</h1>
      <p className="mb-6 text-sm text-muted">
        Open each link. Then add <code>error.tsx</code> and <code>not-found.tsx</code> in{" "}
        <code>app/exercises/7/[id]/</code>.
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

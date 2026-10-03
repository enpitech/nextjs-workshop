// Exercise 0, solution. A nested layout: it wraps the speakers list page and every speaker page.
// It stays mounted when you click from speaker to speaker, so the note field keeps its text.
// Swap one <Link> for a plain <a> and the note is gone after the click: a full page load.
import Link from "next/link";
import { getSpeakers } from "@/lib/speakers";

const base = "/exercises/0/solution/speakers";

export default async function SpeakersLayout({ children }: { children: React.ReactNode }) {
  const speakers = await getSpeakers();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Speakers</h1>
      <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
        <aside className="space-y-4">
          <input
            placeholder="Type a note"
            className="w-full rounded-[0.625rem] border border-line-strong bg-surface px-3 py-1.5 text-sm"
          />
          <ul className="space-y-1 text-sm">
            {speakers.map((s) => (
              <li key={s.id}>
                <Link
                  href={`${base}/${s.id}`}
                  className="block rounded-lg px-3 py-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-accent-strong"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}

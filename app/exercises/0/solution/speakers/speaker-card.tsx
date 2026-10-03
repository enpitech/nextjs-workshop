// Exercise 0, solution. Not a route: the file is not named page.tsx.
// Open /exercises/0/solution/speakers/speaker-card and you get the 404 page.
import Link from "next/link";
import type { Speaker, Talk } from "@/lib/types";

export function SpeakerCard({ speaker, talks }: { speaker: Speaker; talks: Talk[] }) {
  return (
    <article className="panel p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{speaker.name}</h2>
      <p className="mt-2 text-muted">{speaker.bio}</p>
      <h3 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Talks
      </h3>
      <ul className="space-y-1">
        {talks.map((t) => (
          <li key={t.id}>
            <Link href={`/talks/${t.id}`} className="text-accent-strong hover:underline">
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

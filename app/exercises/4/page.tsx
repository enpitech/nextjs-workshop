// Exercise 4: write the vote action. See README.md.
import { Suspense } from "react";
import { connection } from "next/server";
import { getTalks } from "@/lib/talks";
import { upvote } from "./actions";
import { VoteButton } from "./vote-button";

export default function Exercise4() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 4</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Talks />
      </Suspense>
    </main>
  );
}

async function Talks() {
  await connection(); // keeps `next build` green while the route is broken. Remove it when you fix the route.
  const talks = await getTalks();
  return (
    <ul className="space-y-3">
      {talks.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4">
          <span>
            {t.title}: <strong>{t.votes}</strong> votes
          </span>
          <VoteButton id={t.id} action={upvote} />
        </li>
      ))}
    </ul>
  );
}

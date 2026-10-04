// Exercise 4, solution. The page did not change, except that connection() is gone:
// getTalks() is cached, so the route prerenders again.
import { getTalks } from "@/lib/talks";
import { upvote } from "./actions";
import { VoteButton } from "./vote-button";

export default async function Solution4() {
  const talks = await getTalks();
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 4: solution</h1>
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
    </main>
  );
}

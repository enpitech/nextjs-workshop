// Break #1: a Server Component passes a function across the boundary.
// Predict what happens before you open /breaks/1/broken.
import { Suspense } from "react";
import { connection } from "next/server";
import { getTalks } from "@/lib/talks";
import { VoteList } from "../vote-list";

export default function Broken() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #1: broken</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Talks />
      </Suspense>
    </main>
  );
}

async function Talks() {
  // Render at request time only, so `next build` passes and the error
  // shows when you open the route. Not a pattern for real code.
  await connection();
  const talks = await getTalks();

  function onVote(id: number) {
    console.log("vote for", id);
  }

  return <VoteList talks={talks} onVote={onVote} />;
}

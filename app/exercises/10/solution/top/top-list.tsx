"use client";
// Exercise 10, Task 5. The toggle is browser state, so only this leaf is a Client Component.
// The page passes `talks` as a prop. Plain data crosses the line as JSON.
import { useState } from "react";
import type { Talk } from "@/lib/types";
import { VoteButton } from "./vote-button";

export function TopList({ talks }: { talks: Talk[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? talks : talks.slice(0, 3);

  return (
    <div>
      <button className="mb-4 rounded border px-3 py-1" onClick={() => setShowAll(!showAll)}>
        {showAll ? "Show the top 3" : "Show all talks"}
      </button>
      <ul className="panel divide-y divide-line">
        {shown.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
            <span className="min-w-0 flex-1 font-medium">{t.title}</span>
            <span className="text-sm tabular-nums text-muted">{t.votes} votes</span>
            <VoteButton id={t.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

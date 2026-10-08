"use client";
// Exercise 8, Task 5. The filter is browser state, so this file is a Client Component.
// The page passes `talks` as a prop. Plain data crosses the line as JSON.
import { useState } from "react";
import Link from "next/link";
import { Badge } from "../../../badge";
import type { Talk } from "@/lib/types";
import { VoteButton } from "./vote-button";

export function TalkTable({ talks }: { talks: Talk[] }) {
  const [category, setCategory] = useState("all");
  const categories = Array.from(new Set(talks.map((t) => t.category)));
  const shown = category === "all" ? talks : talks.filter((t) => t.category === category);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 text-sm">
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <ul className="panel divide-y divide-line">
        {shown.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/exercises/8/solution/dashboard/talks/${t.id}`}
                className="font-medium hover:text-accent-strong"
              >
                {t.title}
              </Link>
              <div className="mt-1">
                <Badge>{t.category}</Badge>
              </div>
            </div>
            <span className="text-sm tabular-nums text-muted">{t.votes} votes</span>
            <VoteButton id={t.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

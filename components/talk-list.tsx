"use client";
// Client Component. It holds the filter state, so it must run in the browser.
// The talks arrive as props across the boundary, so they must be serializable.
// next/link comes in through talk-group.tsx -> talk-row.tsx. Neither has a directive; both join this client graph.
import { useState } from "react";
import { CATEGORIES, type Talk } from "@/lib/types";
import { CategoryFilter } from "./category-filter";
import { TalkGroup } from "./talk-group";

export function TalkList({ talks }: { talks: Talk[] }) {
  const [category, setCategory] = useState<Talk["category"] | "all">("all");
  const shown = category === "all" ? talks : talks.filter((t) => t.category === category);

  // One group per category, in the order of the list in lib/types.ts. Empty ones are dropped.
  const groups = CATEGORIES.map((c) => [c, shown.filter((t) => t.category === c)] as const).filter(
    ([, list]) => list.length > 0,
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <CategoryFilter value={category} onChange={setCategory} />
        <p className="text-sm text-muted">
          {shown.length} {shown.length === 1 ? "talk" : "talks"}
        </p>
      </div>

      {groups.length === 0 && (
        <div className="panel px-6 py-12 text-center text-sm text-muted">
          No talks in this category.
        </div>
      )}

      <div className="space-y-10">
        {groups.map(([name, list]) => (
          <TalkGroup key={name} name={name} talks={list} />
        ))}
      </div>
    </div>
  );
}

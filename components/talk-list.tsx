"use client";
// Client Component. It holds the filter state, so it must run in the browser.
// The talks arrive as props across the boundary, so they must be serializable.
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, type Talk } from "@/lib/types";

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
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-muted">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(CATEGORIES.find((c) => c === e.target.value) ?? "all")}
            className="min-w-48"
          >
            <option value="all">all</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
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
          <section key={name}>
            <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {name}
              <span className="h-px flex-1 bg-line" />
            </h2>
            <ul className="panel divide-y divide-line overflow-hidden">
              {list.map((talk) => (
                <li key={talk.id}>
                  <Link
                    href={`/talks/${talk.id}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent-soft/60"
                  >
                    <span className="font-medium text-ink group-hover:text-accent-strong">
                      {talk.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted tabular-nums">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className="size-4 fill-current text-faint group-hover:text-accent"
                      >
                        <path d="M10 3.5 3.5 10.6h3.9V16.5h5.2v-5.9h3.9L10 3.5Z" />
                      </svg>
                      {talk.votes}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

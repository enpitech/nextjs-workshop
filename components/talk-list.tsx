"use client";
// Client Component. It holds the filter state, so it must run in the browser.
// The talks arrive as props across the boundary, so they must be serializable.
import { useState } from "react";
import Link from "next/link";
import type { Talk } from "@/lib/types";

const tracks = ["all", "core", "data", "ai"] as const;

export function TalkList({ talks }: { talks: Talk[] }) {
  const [track, setTrack] = useState<(typeof tracks)[number]>("all");
  const shown = track === "all" ? talks : talks.filter((t) => t.track === track);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {tracks.map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={`rounded border px-2 py-1 text-sm ${t === track ? "bg-black text-white" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {shown.map((talk) => (
          <li key={talk.id} className="flex justify-between rounded border p-3">
            <Link href={`/talks/${talk.id}`}>{talk.title}</Link>
            <span className="text-sm text-gray-500">{talk.votes} votes</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

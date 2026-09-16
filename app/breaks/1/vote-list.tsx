"use client";
// Shared by the broken and the fixed route. It takes a function prop.
import type { Talk } from "@/lib/types";

export function VoteList({
  talks,
  onVote,
}: {
  talks: Talk[];
  onVote: (id: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {talks.map((talk) => (
        <li key={talk.id} className="flex justify-between rounded border p-3">
          <span>{talk.title}</span>
          <button className="rounded border px-2" onClick={() => onVote(talk.id)}>
            +1 ({talk.votes})
          </button>
        </li>
      ))}
    </ul>
  );
}

"use client";
import { useState } from "react";
import type { Talk } from "@/lib/types";
import { VoteList } from "../vote-list";

export function VotePanel({ talks }: { talks: Talk[] }) {
  const [last, setLast] = useState<number | null>(null);
  return (
    <div>
      <p className="mb-3 text-sm text-gray-500">
        Last vote: {last ?? "none"} (handler lives in the client graph)
      </p>
      <VoteList talks={talks} onVote={setLast} />
    </div>
  );
}

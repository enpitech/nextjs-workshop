"use client";
// Search as you type. The data changes on every key press, after the first render,
// so props from a Server Component cannot carry it. The browser calls a Route Handler.
// Plain fetch keeps the demo free of a library. SWR or React Query add caching and retries.
import { useEffect, useState } from "react";
import type { Talk } from "@/lib/types";
import { TalkRow } from "./talk-row";

export function TalkSearch() {
  const [q, setQ] = useState("");
  const [talks, setTalks] = useState<Talk[] | null>(null);

  useEffect(() => {
    // Abort the request for the previous key press, so an old answer cannot win.
    const controller = new AbortController();
    fetch(`/api/talks/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then(setTalks)
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, [q]);

  return (
    <div className="space-y-6">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-muted">Title contains</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="server"
          className="w-full max-w-md"
        />
      </label>

      {talks === null && <p className="text-sm text-muted">Loading…</p>}
      {talks?.length === 0 && (
        <div className="panel px-6 py-12 text-center text-sm text-muted">No talk matches.</div>
      )}
      {talks && talks.length > 0 && (
        <ul className="panel divide-y divide-line overflow-hidden">
          {talks.map((talk) => (
            <TalkRow key={talk.id} talk={talk} />
          ))}
        </ul>
      )}
    </div>
  );
}

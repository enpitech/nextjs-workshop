"use client";
// The same code you would write in a Vite app. The data was already in the cache when it first rendered.
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { talksCache } from "./talks-cache";

export function TalksView() {
  const { data: talks, refetch, isFetching } = useSuspenseQuery(talksCache.options());
  const [refetches, setRefetches] = useState(0);

  return (
    <section className="panel grid gap-3 p-5">
      <ul className="list-disc pl-5 text-sm">
        {talks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
      <button
        className="btn-primary justify-self-start"
        disabled={isFetching}
        onClick={async () => {
          await refetch();
          setRefetches((n) => n + 1);
        }}
      >
        {isFetching ? "Fetching /api/talks…" : "Refetch from /api/talks"}
      </button>
      <p className="text-sm text-muted">
        Browser requests to <code>/api/talks</code> so far: {refetches}
      </p>
    </section>
  );
}

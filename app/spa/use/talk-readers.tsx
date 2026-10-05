"use client";
// Two readers of the same promise. use() suspends each one until the promise is ready.
import { use } from "react";
import { useTalks } from "./talks-provider";

export function TalkCount() {
  const talks = use(useTalks());
  return <p className="text-sm font-medium">{talks.length} talks, read with use()</p>;
}

export function TalkTitles() {
  const talks = use(useTalks());
  return (
    <ul className="list-disc pl-5 text-sm">
      {talks.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}

// The data layer for talks. Reads are cached with "use cache". Writes are not.
// "server-only" turns an import from a Client Component into a build error.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { API, read } from "./api";
import type { Talk } from "./types";

// Reads. Cached with "use cache". The tag is how a write finds the entry.
export async function getTalks(): Promise<Talk[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("talks");
  return read<Talk[]>("/talks");
}

export async function getTalk(id: number): Promise<Talk> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`talk-${id}`);
  return read<Talk>(`/talks/${id}`);
}

// Writes. Not cached. Called from Server Actions and Route Handlers only.
export async function addVote(id: number): Promise<Talk> {
  const talk = await read<Talk>(`/talks/${id}`);
  const res = await fetch(`${API}/talks/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ votes: talk.votes + 1 }),
  });
  if (!res.ok) throw new Error(`PATCH /talks/${id} failed with ${res.status}`);
  return res.json();
}

// Used by the /submit Server Action. json-server assigns the id.
export async function addTalk(input: {
  title: string;
  speakerId: number;
  category: Talk["category"];
}): Promise<Talk> {
  const res = await fetch(`${API}/talks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, votes: 0 }),
  });
  if (!res.ok) throw new Error(`POST /talks failed with ${res.status}`);
  return res.json();
}

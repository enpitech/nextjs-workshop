// The data layer for talks. Every read goes to json-server on port 3001.
// "server-only" turns an import from a Client Component into a build error.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Talk } from "./types";

export const API = "http://localhost:3001";

export async function read<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
  return res.json();
}

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

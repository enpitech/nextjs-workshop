// Exercise 9, given. The plain calls to the data server, with no cache at all.
// This is how code looks before the flag: every call is a fetch, every time.
// You wrap these reads in "use cache" functions of your own. Do not change this file.
// "server-only" turns an import from a Client Component into a build error.
import "server-only";
import { API, read } from "@/lib/api";
import type { Speaker, Talk } from "@/lib/types";

export function fetchTalks(): Promise<Talk[]> {
  return read<Talk[]>("/talks");
}

export function fetchSpeakers(): Promise<Speaker[]> {
  return read<Speaker[]>("/speakers");
}

export function fetchSpeaker(id: number): Promise<Speaker> {
  return read<Speaker>(`/speakers/${id}`);
}

// A write. It adds one vote and returns the talk with the new count.
export async function saveVote(id: number): Promise<Talk> {
  const talk = await read<Talk>(`/talks/${id}`);
  const res = await fetch(`${API}/talks/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ votes: talk.votes + 1 }),
  });
  if (!res.ok) throw new Error(`PATCH /talks/${id} failed with ${res.status}`);
  return res.json();
}

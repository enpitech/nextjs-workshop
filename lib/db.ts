// The data layer. Every read goes to json-server on port 3001.
// "server-only" turns an import from a Client Component into a build error.
import "server-only";
import { cacheTag } from "next/cache";
import type { Comment, Speaker, Talk } from "./types";

export const API = "http://localhost:3001";

async function read<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
  return res.json();
}

export async function getTalks(): Promise<Talk[]> {
  "use cache";
  cacheTag("talks");
  return read<Talk[]>("/talks");
}

export async function getTalk(id: number): Promise<Talk> {
  "use cache";
  cacheTag(`talk-${id}`);
  return read<Talk>(`/talks/${id}`);
}

export async function getSpeaker(id: number): Promise<Speaker> {
  "use cache";
  cacheTag("speakers");
  return read<Speaker>(`/speakers/${id}`);
}

export async function getComments(talkId: number): Promise<Comment[]> {
  "use cache";
  cacheTag(`comments-${talkId}`);
  return read<Comment[]>(`/comments?talkId=${talkId}`);
}

// The data layer for comments. Same shape as lib/talks.ts.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { read } from "./api";
import type { Comment } from "./types";

export async function getComments(talkId: number): Promise<Comment[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${talkId}`);
  return read<Comment[]>(`/comments?talkId=${talkId}`);
}

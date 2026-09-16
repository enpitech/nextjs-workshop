// The data layer for speakers and comments. Same shape as lib/db.ts.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { read } from "./db";
import type { Comment, Speaker } from "./types";

export async function getSpeaker(id: number): Promise<Speaker> {
  "use cache";
  cacheLife("hours");
  cacheTag("speakers");
  return read<Speaker>(`/speakers/${id}`);
}

export async function getComments(talkId: number): Promise<Comment[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments-${talkId}`);
  return read<Comment[]>(`/comments?talkId=${talkId}`);
}

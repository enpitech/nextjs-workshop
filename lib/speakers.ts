// The data layer for speakers. Same shape as lib/talks.ts.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { read } from "./api";
import type { Speaker } from "./types";

export async function getSpeaker(id: number): Promise<Speaker> {
  "use cache";
  cacheLife("hours");
  cacheTag("speakers");
  return read<Speaker>(`/speakers/${id}`);
}

export async function getSpeakers(): Promise<Speaker[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("speakers");
  return read<Speaker[]>("/speakers");
}

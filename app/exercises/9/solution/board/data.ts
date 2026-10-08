// Exercise 9, Tasks 3 to 5. The cached reads. Each one wraps a plain call from ../../backend.ts.
// "use cache" stores the return value. cacheLife says how long. cacheTag names the entry,
// so a write can expire it. Everything the function needs is an argument (Task 4).
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { fetchSpeaker, fetchSpeakers, fetchTalks } from "../../backend";

export async function getTalks() {
  "use cache";
  cacheLife("hours");
  cacheTag("talks");
  return fetchTalks();
}

export async function getSpeakers() {
  "use cache";
  cacheLife("days");
  cacheTag("speakers");
  return fetchSpeakers();
}

// Task 4: the id comes in as an argument. The cookie is read outside, in greeting.tsx.
// One cache entry per id.
export async function getSpeaker(id: number) {
  "use cache";
  cacheLife("days");
  cacheTag("speakers");
  return fetchSpeaker(id);
}

// Exercise 10, Tasks 2 and 4. "use server" makes every export here a Server Action.
"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export async function vote(formData: FormData) {
  const id = Number(formData.get("id"));
  // A Server Action is a public POST endpoint, so it checks its own input.
  if (!Number.isInteger(id) || id < 1) return;

  await addVote(id);
  // updateTag, not revalidateTag: in a Server Action, the next read waits for fresh data,
  // so the person who voted sees the new count. lib/talks.ts caches under two tags.
  // A write must name both: "talks" for the list, `talk-${id}` for the one talk.
  updateTag("talks");
  updateTag(`talk-${id}`);
}

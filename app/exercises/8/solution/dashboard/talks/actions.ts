// Exercise 8, Task 6. "use server" makes every export here a Server Action:
// the browser gets an ID, and the code stays on the server.
// A Server Action is a public POST endpoint, so it checks its own input.
"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export type VoteState = { message: string };

export async function vote(_prev: VoteState, formData: FormData): Promise<VoteState> {
  const id = Number(formData.get("id"));
  // An expected problem comes back as state. It is not thrown.
  if (!Number.isInteger(id) || id < 1) return { message: "No talk id in the form." };

  const talk = await addVote(id);
  // The reads in lib/talks.ts are cached. These two lines mark the cached talks as old,
  // so the next read gets the new vote count.
  updateTag("talks");
  updateTag(`talk-${id}`);
  return { message: `Thanks. ${talk.votes} votes now.` };
}

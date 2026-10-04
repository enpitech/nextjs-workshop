// Exercise 4, solution. "use server" makes every export a Server Action:
// the browser gets an ID, and the code stays on the server.
"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export type UpvoteState = { message: string };

// Part 2: with useActionState, the action gets the previous state first and returns the next state.
export async function upvote(_prev: UpvoteState, formData: FormData): Promise<UpvoteState> {
  const talk = await addVote(Number(formData.get("id")));
  updateTag("talks");
  return { message: `${talk.votes} votes now.` };
}

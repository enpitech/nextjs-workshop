"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export async function vote(formData: FormData) {
  const id = Number(formData.get("id"));
  await addVote(id);
  updateTag("talks");
  updateTag(`talk-${id}`);
}

// 2.4b: the same action, shaped for useActionState (previous state in, new state out).
export type VoteState = { ok: boolean; message: string };

export async function voteWithState(_prev: VoteState, formData: FormData): Promise<VoteState> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return { ok: false, message: "No talk id in the form." };
  const talk = await addVote(id);
  updateTag("talks");
  updateTag(`talk-${id}`);
  return { ok: true, message: `Thanks. ${talk.title} now has ${talk.votes} votes.` };
}

"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

// Break #5, broken: the write happens. Nothing tells the cache.
export async function voteStale(formData: FormData) {
  await addVote(Number(formData.get("id")));
}

// Break #5, fixed: the write happens, then the entry for this talk is expired.
// updateTag guarantees that this user sees the new value on the next read.
export async function voteFresh(formData: FormData) {
  const id = Number(formData.get("id"));
  await addVote(id);
  updateTag(`talk-${id}`);
}

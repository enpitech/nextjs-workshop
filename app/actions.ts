"use server";
import { updateTag } from "next/cache";
import { addVote } from "@/lib/db";

export async function vote(formData: FormData) {
  await addVote(Number(formData.get("id")));
  updateTag("talks");
}

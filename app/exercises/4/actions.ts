// Exercise 4: this file is missing one line. See README.md.
import { updateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export async function upvote(formData: FormData) {
  await addVote(Number(formData.get("id")));
  updateTag("talks");
}

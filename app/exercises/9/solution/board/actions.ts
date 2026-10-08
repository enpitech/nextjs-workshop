// Exercise 9, Task 5. The vote. "use server" makes the export a Server Action.
"use server";
import { updateTag } from "next/cache";
import { saveVote } from "../../backend";

export async function vote(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;

  await saveVote(id);
  // The user who voted must see the new count, so expire the entry now.
  // Only "talks" changed. The speakers stay cached.
  updateTag("talks");
}

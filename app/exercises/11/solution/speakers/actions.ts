// Exercise 11, Task 5. "use server" makes every export here a Server Action.
// Every export must be an async function. A constant such as `export const MAX = 280` is a build error.
"use server";
import { updateTag } from "next/cache";
import { API } from "@/lib/api";

// Not exported, on purpose. See the note above.
const MAX_LENGTH = 280;

export async function addComment(formData: FormData) {
  const talkId = Number(formData.get("talkId"));
  const text = String(formData.get("text") ?? "").trim();
  // A Server Action is a public POST endpoint, so it checks its own input.
  if (!Number.isInteger(talkId) || talkId < 1) return;
  if (text.length === 0 || text.length > MAX_LENGTH) return;

  const res = await fetch(`${API}/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ talkId, text }),
  });
  if (!res.ok) throw new Error(`POST /comments failed with ${res.status}`);

  // updateTag, not revalidateTag: in a Server Action, the next read waits for fresh data,
  // so the person who commented sees the new count. lib/comments.ts caches under this one tag.
  updateTag(`comments-${talkId}`);
}

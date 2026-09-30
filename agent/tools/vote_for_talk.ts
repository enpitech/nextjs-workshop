// A write, so a person approves every call. always() parks the turn until someone
// clicks Approve. The pause is durable: the process can restart and the turn waits.
import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { APP, type TalkRow } from "../lib/app";

export default defineTool({
  description: "Add one vote to a talk.",
  inputSchema: z.object({ id: z.number().int().min(1) }),
  approval: always(),
  async execute({ id }) {
    // POST /api/talks/vote calls revalidateTag. updateTag works only in a Server Action,
    // and this code is not one: it runs in the eve process.
    const res = await fetch(`${APP}/api/talks/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error(`POST /api/talks/vote failed with ${res.status}`);
    const talk: TalkRow = await res.json();
    return { id: talk.id, title: talk.title, votes: talk.votes };
  },
});

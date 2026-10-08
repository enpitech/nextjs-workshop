// Exercise 10, Task 7. A tool is a file. Copied to agent/tools/get_talk.ts, this is the tool `get_talk`.
// It runs in the eve process, not inside Next. "use cache", cacheTag and server-only belong to Next,
// so the tool does not import lib/talks.ts. It reads over HTTP, like any caller outside the app.
import { defineTool } from "eve/tools";
import { z } from "zod";

// The same values as agent/lib/app.ts, written out so that this file works in any folder.
const APP = "http://localhost:3000";
type TalkRow = { id: number; title: string; category: string; votes: number };

export default defineTool({
  description: "Get one conference talk by its id, with its vote count.",
  // eve checks the input against this schema before execute runs. A talk id is a whole number from 1.
  inputSchema: z.object({ id: z.number().int().min(1) }),
  // A read, so no approval. Only a write waits for a person.
  async execute({ id }) {
    // The same Route Handler that list_talks calls. It reads through the cached getTalks().
    const res = await fetch(`${APP}/api/talks`);
    if (!res.ok) throw new Error(`GET /api/talks failed with ${res.status}`);
    const talks: TalkRow[] = await res.json();
    const talk = talks.find((t) => t.id === id);
    if (!talk) throw new Error(`No talk with the id ${id}`);
    return { id: talk.id, title: talk.title, votes: talk.votes };
  },
});

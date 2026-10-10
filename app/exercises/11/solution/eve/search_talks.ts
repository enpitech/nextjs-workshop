// Exercise 11, Task 7. A tool is a file. Copied to agent/tools/search_talks.ts, this is the tool `search_talks`.
// It runs in the eve process, not inside Next. So it does not import lib/talks.ts. It calls
// GET /api/talks/search, the Route Handler of the app, like any caller outside the app.
import { defineTool } from "eve/tools";
import { z } from "zod";

// The same value as agent/lib/app.ts, written out so that this file works in any folder.
const APP = "http://localhost:3000";
type TalkRow = { id: number; title: string; category: string; votes: number };

export default defineTool({
  // A real model picks a tool by this text. Say what it does, and when to use it.
  description:
    "Search the conference talks by a word in the title. Returns the matching talks with their ids and vote counts. Use it when the person names a topic, such as server or cache.",
  // eve checks the input against this schema before execute runs. An empty query would match every talk.
  inputSchema: z.object({ q: z.string().trim().min(1).max(50) }),
  // A read, so no approval. Only a write waits for a person.
  async execute({ q }) {
    // encodeURIComponent, so that a query such as "a&b" stays one value.
    const res = await fetch(`${APP}/api/talks/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`GET /api/talks/search failed with ${res.status}`);
    const talks: TalkRow[] = await res.json();
    return talks.map(({ id, title, votes }) => ({ id, title, votes }));
  },
});

// A tool is a file. The file name is the tool name: this is `list_talks`.
// It reads through GET /api/talks, the same cached read the app uses.
import { defineTool } from "eve/tools";
import { z } from "zod";
import { APP, type TalkRow } from "../lib/app";

export default defineTool({
  description: "List the conference talks with the most votes first.",
  inputSchema: z.object({ limit: z.number().int().min(1).max(20).default(3) }),
  async execute({ limit }) {
    const res = await fetch(`${APP}/api/talks`);
    if (!res.ok) throw new Error(`GET /api/talks failed with ${res.status}`);
    const talks: TalkRow[] = await res.json();
    return talks
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit)
      .map(({ id, title, category, votes }) => ({ id, title, category, votes }));
  },
});

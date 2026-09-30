// A scripted stand-in for an LLM, so every run in the room is the same and needs no key.
// eve still does the real work: it runs the loop, calls the tools, parks for approval.
// Only the "which tool, and what to say" decision is an if/else instead of a model.
import { mockModel } from "eve/evals";
import type { TalkRow } from "./app";

export const scriptedModel = mockModel({
  provider: "workshop",
  modelId: "scripted",
  respond: ({ messages, lastUserMessage, toolResults }) => {
    // A tool just returned: turn its output into a reply.
    if (messages.at(-1)?.role === "tool") {
      const result = toolResults.at(-1)!;
      if (result.isError) return "The vote did not happen. Nothing changed.";
      if (result.name === "list_talks") {
        const talks = result.output as TalkRow[];
        const lines = talks.map((t) => `#${t.id} "${t.title}" (${t.votes} votes)`);
        return `The top talks right now: ${lines.join(", ")}.`;
      }
      const talk = result.output as Pick<TalkRow, "title" | "votes">;
      return `Done. "${talk.title}" now has ${talk.votes} votes.`;
    }

    // A new user message: pick a tool, the way a model would.
    const text = (lastUserMessage ?? "").toLowerCase();
    const id = Number(text.match(/\d+/)?.[0]);
    if (text.includes("vote") && id > 0) {
      return { toolCalls: [{ name: "vote_for_talk", input: { id } }] };
    }
    if (/top|best|popular|talks/.test(text)) {
      return { toolCalls: [{ name: "list_talks", input: { limit: 3 } }] };
    }
    return 'Try "What are the top talks?" or "Vote for talk 2".';
  },
});

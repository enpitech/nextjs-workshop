// `npx eve eval` runs this file against the agent. The app must be up on port 3000,
// because the tools call its Route Handlers. The model is scripted, so the result is stable.
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "The agent reads before it answers, and asks before it writes.",
  async test(t) {
    const top = await t.send("What are the top talks?");
    t.calledTool("list_talks");
    t.check(top.message, includes("votes"));

    // The vote parks the turn. Nothing is written until someone approves.
    const parked = await top.session.send("Vote for talk 2");
    parked.calledTool("vote_for_talk", { status: "pending", count: 1 });
    const request = parked.session.requireInputRequest({ toolName: "vote_for_talk" });

    const done = await parked.session.respond([
      { requestId: request.requestId, optionId: "approve" },
    ]);
    t.calledTool("vote_for_talk", { status: "completed", count: 1 });
    t.check(done.message, includes("now has"));
  },
});

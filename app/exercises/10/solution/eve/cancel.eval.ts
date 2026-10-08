// Exercise 10, Task 7. Copied to evals/cancel.eval.ts, `npx eve eval` runs it next to agent.eval.ts.
// agent.eval.ts tests Approve. This file tests the other answer, Cancel: the vote must not happen.
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "A vote waits for a person, and Cancel writes nothing.",
  async test(t) {
    // The vote parks the turn and offers two answers.
    const parked = await t.send("Vote for talk 2");
    parked.calledTool("vote_for_talk", { status: "pending", count: 1 });
    const request = parked.session.requireInputRequest({
      toolName: "vote_for_talk",
      optionIds: ["approve", "cancel"],
    });

    // A person clicks Cancel. The call ends as "rejected", and execute never runs.
    const done = await parked.session.respond([
      { requestId: request.requestId, optionId: "cancel" },
    ]);
    t.calledTool("vote_for_talk", { status: "rejected", count: 1 });
    t.check(done.message, includes("Nothing changed"));
  },
});

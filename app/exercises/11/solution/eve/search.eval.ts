// Exercise 11, Task 7. Copied to evals/search.eval.ts, `npx eve eval` runs it next to agent.eval.ts.
// It needs the two changes in scripted-model.patch.txt, because the scripted model does not
// know search_talks. A real model finds the tool by its description.
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "A topic question calls search_talks once, and the answer names a matching talk.",
  async test(t) {
    const turn = await t.send("Search the talks for server");
    t.calledTool("search_talks", { status: "completed", count: 1 });
    t.check(turn.message, includes("Server Actions in production"));
  },
});

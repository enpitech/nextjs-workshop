// The agent's configuration. Everything else in agent/ is found by its path.
import { defineAgent } from "eve";
import { scriptedModel } from "./lib/scripted-model";

export default defineAgent({
  // To use a real model, write a model string here, for example
  // model: "anthropic/claude-opus-5.5", and set AI_GATEWAY_API_KEY in .env.local.
  model: scriptedModel,
  // eve looks up a real model's context window by its name. A scripted one has none.
  modelContextWindowTokens: 200_000,
  // No built-in bash, file or web tools. The agent can use only the two files in tools/.
  defaultTools: false,
});

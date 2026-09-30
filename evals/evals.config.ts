// eve eval needs this file. The judge model would score t.judge(...) checks;
// agent.eval.ts uses exact checks only, so no judge is set.
import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({});

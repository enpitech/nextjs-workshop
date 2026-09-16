// Turns a `claude -p --output-format stream-json --verbose` transcript into a readable Markdown file.
// Usage: node scripts/transcript-to-md.mjs <run.stream.jsonl> <title> [prompt.txt] [diff]
import { readFileSync } from "node:fs";

const [file, title, promptFile, diffFile] = process.argv.slice(2);
const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
const out = [];
out.push(`# ${title}`, "");
out.push(`Real transcript of \`claude -p\` (Claude Code CLI) against this repo. Nothing was edited by hand. Tool inputs are cut at 300 characters.`, "");
if (promptFile) out.push("## Prompt", "", "```", readFileSync(promptFile, "utf8").trim(), "```", "");
out.push("## Transcript", "");
let n = 0;
const resultsById = new Map();
for (const l of lines) {
  let j;
  try { j = JSON.parse(l); } catch { continue; }
  if (j.type === "user" && j.message?.content) {
    for (const c of j.message.content) if (c.type === "tool_result") {
      const text = Array.isArray(c.content) ? c.content.map((x) => x.text || "").join("\n") : String(c.content ?? "");
      resultsById.set(c.tool_use_id, text);
    }
  }
}
for (const l of lines) {
  let j;
  try { j = JSON.parse(l); } catch { continue; }
  if (j.type === "system" && j.subtype === "init") {
    out.push(`Model: \`${j.model}\`. MCP servers: ${JSON.stringify(j.mcp_servers)}.`, "");
  }
  if (j.type === "assistant" && j.message?.content) {
    for (const c of j.message.content) {
      if (c.type === "text" && c.text.trim()) out.push(`> ${c.text.trim().replace(/\n/g, "\n> ")}`, "");
      if (c.type === "tool_use") {
        n++;
        const input = JSON.stringify(c.input);
        out.push(`${n}. **${c.name}** \`${input.length > 300 ? input.slice(0, 300) + "…" : input}\``);
        const r = resultsById.get(c.id);
        if (r) {
          const short = r.replace(/\r/g, "").split("\n").slice(0, 6).join("\n");
          out.push("", "   ```", "   " + short.replace(/\n/g, "\n   ").slice(0, 600), "   ```", "");
        }
      }
    }
  }
  if (j.type === "result") {
    out.push("", "## Result", "", `Turns: ${j.num_turns}. Duration: ${Math.round(j.duration_ms / 1000)} s. Cost: $${(j.total_cost_usd ?? 0).toFixed(2)}.`, "", (j.result || "").trim(), "");
  }
}
if (diffFile) {
  const d = readFileSync(diffFile, "utf8").trim();
  out.push("## Diff the agent left in the working tree", "", "```diff", d.length > 6000 ? d.slice(0, 6000) + "\n… (cut)" : d, "```", "");
}
process.stdout.write(out.join("\n"));

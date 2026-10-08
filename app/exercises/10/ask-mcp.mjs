// Exercise 10, Task 1. Ask the running dev server the questions that an agent asks.
//   node app/exercises/10/ask-mcp.mjs                  lists the tools of the dev server
//   node app/exercises/10/ask-mcp.mjs get_errors       calls one tool
//   node app/exercises/10/ask-mcp.mjs compile_route routeSpecifier=/exercises/10/top
//                                                      calls one tool with an argument
// It sends the same request that next-devtools-mcp sends: a JSON-RPC POST to /_next/mcp.
// Only `next dev` answers on that path. `next start` does not.
const [tool, ...pairs] = process.argv.slice(2);
const args = Object.fromEntries(pairs.map((p) => [p.split("=")[0], p.slice(p.indexOf("=") + 1)]));
const body = tool
  ? { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: tool, arguments: args } }
  : { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} };

let res;
try {
  res = await fetch("http://localhost:3000/_next/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify(body),
  });
} catch {
  console.error("Nothing answers on port 3000. Start the dev server with npm run dev.");
  process.exit(1);
}

// The answer comes as a server-sent event. The JSON is on the line that starts with "data: ".
const text = await res.text();
const line = text.split("\n").find((l) => l.startsWith("data: "));
if (!line) {
  console.error(`HTTP ${res.status}. No MCP answer. Is this next dev?`);
  process.exit(1);
}
const answer = JSON.parse(line.slice("data: ".length));
if (answer.error) {
  console.error(answer.error.message);
  process.exit(1);
}

if (tool) {
  for (const part of answer.result.content) console.log(part.text);
} else {
  for (const t of answer.result.tools) console.log(t.name);
}

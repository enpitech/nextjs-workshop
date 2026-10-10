// Exercise 11: drive an agent end to end. The first route below exists only after you run the
// copy script, and it fails until you fix it. See README.md.
import Link from "next/link";

const pages = [
  { href: "/exercises/11/speakers", note: "Tasks 1 and 5: the speakers page from the draft" },
  { href: "/exercises/11/solution", note: "The fixed page, to compare with yours" },
];

const commands = [
  { cmd: "node app/exercises/11/copy-draft.mjs", note: "Setup: copy the draft into speakers/" },
  { cmd: "node app/exercises/11/ask-mcp.mjs", note: "Task 1: the tools of the dev server" },
  { cmd: "node app/exercises/11/ask-mcp.mjs get_routes", note: "Task 1: call one tool" },
  { cmd: "npx tsc --noEmit", note: "Tasks 5 and 7: the type check" },
  { cmd: "npx next build --debug-prerender", note: "Task 5: the build, with a source frame for prerender errors" },
];

// eve needs Node 24. Only the Stretch runs the agent, so the page just says which Node this is.
const nodeMajor = Number(process.versions.node.split(".")[0]);

export default function Exercise11() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 11: drive an agent end to end</h1>
      <p className="mb-6 text-sm text-muted">
        The draft in <code>app/exercises/11/draft/</code> and the run in{" "}
        <code>transcript.txt</code> are planted: the workshop author wrote them to look like a
        typical agent run. They are not a real agent run. Work through the tasks in README.md in
        order.
      </p>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Pages</h2>
      <ul className="panel mb-6 divide-y divide-line">
        {pages.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-accent-soft/60"
            >
              <code className="text-ink">{p.href}</code>
              <span className="text-sm text-muted">{p.note}</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Commands, from the repo root
      </h2>
      <ul className="panel mb-6 divide-y divide-line">
        {commands.map((c) => (
          <li
            key={c.cmd}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5"
          >
            <code className="text-ink">{c.cmd}</code>
            <span className="text-sm text-muted">{c.note}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted">
        This server runs Node {process.versions.node}.{" "}
        {nodeMajor >= 24
          ? "You can run the eve Stretch."
          : "The eve Stretch needs Node 24. Every task works on this Node."}
      </p>
    </main>
  );
}

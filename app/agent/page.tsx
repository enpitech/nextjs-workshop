import { Suspense } from "react";
import { AgentChat } from "./agent-chat";

// eve needs Node 24. next.config.ts turns it on only there, so the page says so on Node 22.
const nodeMajor = Number(process.versions.node.split(".")[0]);

export default function Agent() {
  return (
    <main>
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          eve
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Ask the agent</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          An eve agent lives in the <code>agent/</code> folder. It has two tools:{" "}
          <code>list_talks</code> reads the talks, and <code>vote_for_talk</code> adds a vote
          after you approve it. The model is scripted, so every run gives the same answer.
        </p>
      </header>
      <div className="panel p-6 sm:p-8">
        {nodeMajor >= 24 ? (
          // AgentChat reads the URL with useSearchParams, so it needs its own boundary.
          <Suspense>
            <AgentChat />
          </Suspense>
        ) : (
          <p className="text-sm">
            This page needs Node 24, and this server runs Node {process.versions.node}. The
            rest of the app works as before. See &quot;The eve demo&quot; in README.md.
          </p>
        )}
      </div>
    </main>
  );
}

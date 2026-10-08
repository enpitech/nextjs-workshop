// Exercise 9, the talk board. The build prints ◐ for this route: a static shell
// with the cached lists in it, and one hole (the greeting) that streams per request.
import { Suspense } from "react";
import { vote } from "./actions";
import { getSpeakers, getTalks } from "./data";
import { Greeting } from "./greeting";

const base = "/exercises/9/solution/board";

export default async function Board() {
  // Task 3: both reads are cached, so the build can put their result in the shell.
  const [talks, speakers] = await Promise.all([getTalks(), getSpeakers()]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Talk board</h1>

      {/* Task 2: the cookie read waits for the request, so it gets its own boundary. */}
      <Suspense fallback={<p>Checking who you are…</p>}>
        <Greeting />
      </Suspense>

      <ul className="panel divide-y divide-line">
        {talks.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span>
              {t.title}, by {speakers.find((s) => s.id === t.speakerId)?.name ?? "unknown"}
            </span>
            {/* Task 5: a plain form with a Server Action. It works with no client code. */}
            <form action={vote} className="flex items-center gap-3">
              <input type="hidden" name="id" value={t.id} />
              <span className="tabular-nums">{t.votes} votes</span>
              <button className="rounded-[0.625rem] border border-line-strong px-3 py-1 text-sm">
                Vote
              </button>
            </form>
          </li>
        ))}
      </ul>

      {/* Task 6: a plain <a>, because the browser must load the JSON itself. */}
      <a className="underline" href={`${base}/api/talks`}>
        The talks as JSON
      </a>
    </main>
  );
}

import {getTalks} from "@/lib/talks";
import {TalkList} from "@/components/talk-list";
// import {Suspense} from "react";

// Server Component. It runs on the server, awaits data, and ships no JS.
export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const talks = await getTalks();
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <main>
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Program
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Talks</h1>
        <p className="mt-2 max-w-prose text-muted">
          Browse the submitted talks, open one for the speaker and the comments,
          and vote for the ones you want to see.
        </p>
      </header>
      <TalkList talks={talks} />
    </main>
    // </Suspense>
  );
}

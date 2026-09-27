// Exercise 1: this is Break #1. Fix it in place.
import {Suspense} from "react";
import {connection} from "next/server";
import {getTalks} from "@/lib/talks";
import {VoteList} from "@/app/breaks/1/vote-list";

export default function Exercise1() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 1</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Talks />
      </Suspense>
    </main>
  );
}

async function Talks() {
  await connection(); // keeps `next build` green while the route is broken. Remove it when you fix the route.
  const talks = await getTalks();

  function onVote(id: number) {
    console.log("vote for", id);
  }

  return <VoteList talks={talks} onVote={onVote} />;
}

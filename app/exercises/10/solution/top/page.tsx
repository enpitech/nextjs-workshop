// Exercise 10, Tasks 3 to 5. The page is a Server Component again: no directive.
// It reads on the server, and only the toggle in top-list.tsx runs in the browser.
// getTalks() is already cached with cacheLife("minutes"): after one minute, the next
// request refreshes it. So the page needs no cache code of its own.
import Link from "next/link";
import { getTalks } from "@/lib/talks";
import { TopList } from "./top-list";

export default async function TopTalks() {
  const talks = await getTalks();
  // Sort a copy. The array from getTalks() stays as it came.
  const sorted = [...talks].sort((a, b) => b.votes - a.votes);

  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Top talks</h1>
      <TopList talks={sorted} />
      <Link href="/exercises/10" className="mt-4 inline-block underline">
        Back
      </Link>
    </main>
  );
}

// Break #5: the stale read. Vote, watch the database change, watch the page not change.
import { getTalk } from "@/lib/talks";
import { voteStale } from "../actions";

export default async function Broken() {
  const talk = await getTalk(2);
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #5: broken</h1>
      <p className="mb-3">
        {talk.title}: <strong>{talk.votes}</strong> votes (cached, tag <code>talk-2</code>)
      </p>
      <form action={voteStale}>
        <input type="hidden" name="id" value={talk.id} />
        <button className="rounded border px-3 py-1">Vote</button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Compare with the database: <a className="underline" href="http://localhost:3001/talks/2">localhost:3001/talks/2</a>
      </p>
    </main>
  );
}

// Break #5, fixed: the action expires the tag it wrote to.
import { getTalk } from "@/lib/talks";
import { voteFresh } from "../actions";

export default async function Fixed() {
  const talk = await getTalk(2);
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #5: fixed</h1>
      <p className="mb-3">
        {talk.title}: <strong>{talk.votes}</strong> votes (cached, tag <code>talk-2</code>)
      </p>
      <form action={voteFresh}>
        <input type="hidden" name="id" value={talk.id} />
        <button className="rounded border px-3 py-1">Vote</button>
      </form>
    </main>
  );
}

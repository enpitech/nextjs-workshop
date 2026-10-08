// Exercise 10. This file of the draft was right, and it stays as it was.
// It has no directive. top-list.tsx imports it, so it joins the client graph.
// The form sends `vote` as an ID, and the code of the action stays on the server.
import { vote } from "./actions";

export function VoteButton({ id }: { id: number }) {
  return (
    <form action={vote}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded border px-3 py-1">Vote</button>
    </form>
  );
}

// Exercise 11. No directive. A form with a Server Action runs without client JavaScript.
// The hidden field sends the talk id. The action checks it again, because it is a public endpoint.
import { addComment } from "./actions";

export function CommentForm({ talkId }: { talkId: number }) {
  return (
    <form action={addComment} className="flex gap-2">
      <input type="hidden" name="talkId" value={talkId} />
      <input
        name="text"
        required
        maxLength={280}
        aria-label="Comment"
        placeholder="Add a comment"
        className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
      />
      <button className="rounded border px-3 py-1 text-sm">Add comment</button>
    </form>
  );
}

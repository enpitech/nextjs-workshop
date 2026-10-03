// No directive. Imported by the talk page, so it renders on the server.
// The comments under a talk, or a short note when there are none.
import type { Comment } from "@/lib/types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="panel px-6 py-8 text-center text-sm text-muted">No comments yet.</p>;
  }
  return (
    <ul className="panel divide-y divide-line overflow-hidden">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3 px-5 py-4 text-sm leading-relaxed">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          {c.text}
        </li>
      ))}
    </ul>
  );
}

"use client";
// Exercise 4, solution. useActionState gives the pending flag and the returned message.
import { useActionState } from "react";
import type { UpvoteState } from "./actions";

export function VoteButton({
  id,
  action,
}: {
  id: number;
  action: (prev: UpvoteState, formData: FormData) => Promise<UpvoteState>;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <button className="rounded border px-3 py-1" disabled={pending}>
        {pending ? "Voting…" : "Vote"}
      </button>
      {state.message && <span className="text-sm text-muted">{state.message}</span>}
    </form>
  );
}

"use client";
// Exercise 8, Task 6. useActionState gives the pending flag and the message that the action returns.
// This Client Component imports the action from a "use server" file. The browser gets an ID, not code.
import { useActionState } from "react";
import { vote } from "./actions";

export function VoteButton({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState(vote, { message: "" });
  return (
    <form action={formAction} className="flex items-center justify-end gap-3">
      <input type="hidden" name="id" value={id} />
      {state.message && <span className="text-xs text-success">{state.message}</span>}
      <button className="btn-primary" disabled={pending}>
        {pending ? "Voting…" : "Vote"}
      </button>
    </form>
  );
}

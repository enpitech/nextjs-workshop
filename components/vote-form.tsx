"use client";
// 2.4b: the vote form with useActionState. Three things the plain form did not have:
// a pending flag, a returned message, and a submission that works before hydration.
import { useActionState } from "react";
import type { VoteState } from "@/app/actions";

export function VoteForm({
  id,
  action,
}: {
  id: number;
  action: (prev: VoteState, formData: FormData) => Promise<VoteState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  return (
    <form action={formAction} className="my-3">
      <input type="hidden" name="id" value={id} />
      <button className="rounded border px-3 py-1" disabled={pending}>
        {pending ? "Voting…" : "Vote"}
      </button>
      {state.message && <p className="mt-1 text-sm text-gray-500">{state.message}</p>}
    </form>
  );
}

"use client";
// 2.4b: the vote form with useActionState. Three things the plain form did not have:
// a pending flag, a returned message, and a submission that works before hydration.
import { useActionState } from "react";
import type { VoteState } from "@/app/talks/actions";

export function VoteForm({
  id,
  action,
}: {
  id: number;
  action: (prev: VoteState, formData: FormData) => Promise<VoteState>;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <button className="btn-primary" disabled={pending}>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
          <path d="M10 3.5 3.5 10.6h3.9V16.5h5.2v-5.9h3.9L10 3.5Z" />
        </svg>
        {pending ? "Voting…" : "Vote for this talk"}
      </button>
      {state.message && (
        <p
          role="status"
          className={`fade-in text-sm ${state.ok ? "text-accent-strong" : "text-muted"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

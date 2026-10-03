"use client";
// The form runs in the browser. It never imports lib/jev.ts, so the API key stays
// on the server. Jev's answer reaches this component as plain data in the action state.
import { useActionState } from "react";
import type { Speaker } from "@/lib/types";
import { SubmitAskFields } from "@/components/submit-ask-fields";
import { SubmitFirstFields } from "@/components/submit-first-fields";
import { submitTalk, type SubmitState } from "./actions";

export function SubmitForm({ speakers }: { speakers: Speaker[] }) {
  const [state, formAction, pending] = useActionState<SubmitState, FormData>(submitTalk, {
    step: "idle",
  });

  // Eighteen bars is noise, so the ask step shows only the three strongest guesses.
  const top =
    state.step === "ask" && state.triage
      ? Object.entries(state.triage.probabilities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      : [];

  return (
    <form action={formAction} className="space-y-5">
      {state.step === "ask" ? (
        <SubmitAskFields
          title={state.title}
          speakerId={state.speakerId}
          suggested={state.suggested}
          guesses={top}
        />
      ) : (
        <SubmitFirstFields speakers={speakers} />
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button className="btn-primary" disabled={pending}>
          {pending ? (
            <>
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Asking Jev…
            </>
          ) : state.step === "ask" ? (
            "Confirm and add"
          ) : (
            "Submit talk"
          )}
        </button>

        {state.step !== "idle" && (
          <p
            role="status"
            className={`fade-in text-sm ${state.step === "error" ? "text-danger" : "text-muted"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

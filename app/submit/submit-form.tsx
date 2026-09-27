"use client";
// The form runs in the browser. It never imports lib/jev.ts, so the API key stays
// on the server. Jev's answer reaches this component as plain data in the action state.
import { useActionState } from "react";
import { CATEGORIES, type Speaker } from "@/lib/types";
import { submitTalk, type SubmitState } from "./actions";

const pct = (n: number) => Math.round(n * 100);

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
        <>
          {/* React resets the form after an action, so the first pass is carried in hidden fields. */}
          <input type="hidden" name="title" value={state.title} />
          <input type="hidden" name="speakerId" value={state.speakerId} />
          <div className="rounded-xl border border-line bg-paper px-4 py-3 text-sm">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted">
              Title
            </span>
            <span className="mt-0.5 block font-medium">{state.title}</span>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Category</span>
            <select name="category" className="w-full" defaultValue={state.suggested}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {top.length > 0 && (
            <div className="rounded-xl border border-line bg-paper px-4 py-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Best guesses from Jev
              </p>
              <ul className="space-y-2 text-sm">
                {top.map(([name, p], i) => (
                  <li key={name} className="flex items-center gap-3">
                    <span className={`w-36 truncate ${i === 0 ? "font-medium" : "text-muted"}`}>
                      {name}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <span
                        className={`block h-2 rounded-full ${i === 0 ? "bg-accent" : "bg-faint"}`}
                        style={{ width: `${pct(p)}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-muted tabular-nums">{pct(p)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Title</span>
            <input name="title" className="w-full" placeholder="Caching is opt-in" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Speaker</span>
            <select name="speakerId" className="w-full" defaultValue="">
              <option value="" disabled>
                Pick a speaker
              </option>
              {speakers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </>
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

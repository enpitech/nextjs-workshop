"use client";
// The browser side of the agent. useEveAgent talks to /eve/v1/* on this origin.
// withEve in next.config.ts forwards those requests to the eve process.
import { useSearchParams } from "next/navigation";
import { useEveAgent } from "eve/react";

const examples = ["What are the top talks?", "Vote for talk 2"];

export function AgentChat() {
  // The session lives on the server. The URL keeps its id, so a reload, or a server
  // restart, picks the same conversation back up: /agent?session=wrun_...
  const sessionId = useSearchParams().get("session");
  const agent = useEveAgent({
    initialSession: sessionId ? { sessionId, streamIndex: 0 } : undefined,
    resume: sessionId !== null,
    onSessionChange: (session) => {
      if (session) window.history.replaceState(null, "", `?session=${session.sessionId}`);
    },
  });
  const busy = ["submitted", "streaming", "resuming"].includes(agent.status);

  const send = (message: string) => {
    if (message.trim() && !busy) void agent.send(message.trim());
  };

  return (
    <div className="space-y-5">
      <ol className="space-y-3">
        {agent.data.messages.map((message) => (
          <li
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto w-fit max-w-[85%] rounded-2xl bg-ink px-4 py-2 text-sm text-white"
                : "w-fit max-w-[85%] space-y-2 text-sm"
            }
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") return <p key={i}>{part.text}</p>;
              if (part.type !== "dynamic-tool") return null;

              // A tool call. When its approval is open, eve puts the request on the part.
              const request = part.toolMetadata?.eve?.inputRequest;
              return (
                <div key={i} className="rounded-xl border border-line bg-paper px-3 py-2">
                  <p className="font-mono text-xs text-muted">
                    {part.toolName}({JSON.stringify(part.input)}) · {part.state}
                  </p>
                  {part.state === "approval-requested" && request && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium">{request.prompt}</span>
                      {request.options?.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void agent.respond([
                              { requestId: request.requestId, optionId: option.id },
                            ])
                          }
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ol>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          send(String(new FormData(form).get("message") ?? ""));
          form.reset();
        }}
      >
        <input name="message" className="flex-1" placeholder={examples[0]} disabled={busy} />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-xs">
        {examples.map((example) => (
          <button key={example} type="button" disabled={busy} onClick={() => send(example)}>
            {example}
          </button>
        ))}
        <span className="self-center text-muted">status: {agent.status}</span>
      </div>
    </div>
  );
}

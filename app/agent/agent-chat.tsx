"use client";
// The browser side of the agent. useEveAgent talks to /eve/v1/* on this origin.
// withEve in next.config.ts forwards those requests to the eve process.
import { useSearchParams } from "next/navigation";
import { useEveAgent } from "eve/react";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";

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
          <ChatMessage
            key={message.id}
            message={message}
            busy={busy}
            onRespond={(requestId, optionId) => void agent.respond([{ requestId, optionId }])}
          />
        ))}
      </ol>

      <ChatInput onSend={send} busy={busy} placeholder={examples[0]} />

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

// One message in the chat list: text parts as paragraphs, tool calls as cards.
// Rendered inside the client chat.
import type { EveMessage } from "eve/react";
import { ToolCallCard } from "./tool-call-card";

export function ChatMessage({
  message,
  busy,
  onRespond,
}: {
  message: EveMessage;
  busy: boolean;
  onRespond: (requestId: string, optionId: string) => void;
}) {
  return (
    <li
      className={
        message.role === "user"
          ? "ml-auto w-fit max-w-[85%] rounded-2xl bg-ink px-4 py-2 text-sm text-white"
          : "w-fit max-w-[85%] space-y-2 text-sm"
      }
    >
      {message.parts.map((part, i) => {
        if (part.type === "text") return <p key={i}>{part.text}</p>;
        if (part.type !== "dynamic-tool") return null;
        return <ToolCallCard key={i} part={part} busy={busy} onRespond={onRespond} />;
      })}
    </li>
  );
}

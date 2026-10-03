// One tool call in the chat, with approval buttons while its approval is open.
// Rendered inside the client chat. onRespond answers the approval request.
import type { EveDynamicToolPart } from "eve/react";

export function ToolCallCard({
  part,
  busy,
  onRespond,
}: {
  part: EveDynamicToolPart;
  busy: boolean;
  onRespond: (requestId: string, optionId: string) => void;
}) {
  // When its approval is open, eve puts the request on the part.
  const request = part.toolMetadata?.eve?.inputRequest;
  return (
    <div className="rounded-xl border border-line bg-paper px-3 py-2">
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
              onClick={() => onRespond(request.requestId, option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

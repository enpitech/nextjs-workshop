// The message box at the bottom of the chat. It clears itself after sending.
// Rendered inside the client chat.
export function ChatInput({
  onSend,
  busy,
  placeholder,
}: {
  onSend: (message: string) => void;
  busy: boolean;
  placeholder: string;
}) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        onSend(String(new FormData(form).get("message") ?? ""));
        form.reset();
      }}
    >
      <input name="message" className="flex-1" placeholder={placeholder} disabled={busy} />
      <button type="submit" disabled={busy}>
        Send
      </button>
    </form>
  );
}

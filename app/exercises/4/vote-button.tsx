"use client";
// Exercise 4: a plain form. Part 2 adds a pending state and a message with useActionState.
export function VoteButton({
  id,
  action,
}: {
  id: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded border px-3 py-1">Vote</button>
    </form>
  );
}

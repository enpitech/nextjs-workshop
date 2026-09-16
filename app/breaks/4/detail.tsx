// Shared UI for Break #4. Pure rendering. No reads.
import type { Comment, Speaker, Talk } from "@/lib/types";

export function Detail({
  talk,
  speaker,
  comments,
  ms,
}: {
  talk: Talk;
  speaker: Speaker;
  comments: Comment[];
  ms: number;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{talk.title}</h2>
      <p className="text-sm text-gray-500">{speaker.name}</p>
      <ul className="my-2 list-disc pl-5">
        {comments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
      <p className="text-sm">Server time for the three reads: {ms} ms</p>
    </div>
  );
}

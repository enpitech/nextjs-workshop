"use client";
// The directive is on the whole detail view. Only the button needs it.
import { useState } from "react";
import { Badge, Card } from "@/components/ui";
import type { Comment, Speaker, Talk } from "@/lib/types";

export function TalkDetail({
  talk,
  speaker,
  comments,
}: {
  talk: Talk;
  speaker: Speaker;
  comments: Comment[];
}) {
  const [showComments, setShowComments] = useState(false);
  return (
    <Card>
      <h2 className="text-xl font-semibold">
        {talk.title} <Badge>{talk.track}</Badge>
      </h2>
      <p className="text-sm text-gray-500">
        {speaker.name} · {talk.votes} votes
      </p>
      <p className="my-3">{speaker.bio}</p>
      <button className="rounded border px-2" onClick={() => setShowComments(!showComments)}>
        {showComments ? "Hide" : "Show"} {comments.length} comments
      </button>
      {showComments && (
        <ul className="mt-2 list-disc pl-5">
          {comments.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

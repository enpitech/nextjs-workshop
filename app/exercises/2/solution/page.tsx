// Exercise 2, solution: the directive sits on the leaf, comments cross as
// rendered children, and the barrel is not imported.
import { getTalk } from "@/lib/db";
import { getComments, getSpeaker } from "@/lib/speakers";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CommentsToggle } from "./comments-toggle";

export default async function Solution2() {
  const talk = await getTalk(3);
  const speaker = await getSpeaker(talk.speakerId);
  const comments = await getComments(talk.id);
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 2: solution</h1>
      <Card>
        <h2 className="text-xl font-semibold">
          {talk.title} <Badge>{talk.track}</Badge>
        </h2>
        <p className="text-sm text-gray-500">
          {speaker.name} · {talk.votes} votes
        </p>
        <p className="my-3">{speaker.bio}</p>
        <CommentsToggle count={comments.length}>
          <ul className="mt-2 list-disc pl-5">
            {comments.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        </CommentsToggle>
      </Card>
    </main>
  );
}

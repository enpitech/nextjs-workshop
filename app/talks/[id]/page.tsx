import { notFound } from "next/navigation";
import { getComments, getSpeaker, getTalk } from "@/lib/db";

// params is a promise in Next 16. You must await it.
export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const talkId = Number(id);
  if (!Number.isInteger(talkId)) notFound();

  const talk = await getTalk(talkId).catch(() => null);
  if (!talk) notFound();

  const speaker = await getSpeaker(talk.speakerId);
  const comments = await getComments(talk.id);

  return (
    <article>
      <h1 className="text-2xl font-bold">{talk.title}</h1>
      <p className="text-sm text-gray-500">
        {speaker.name} · {talk.track} · {talk.votes} votes
      </p>
      <p className="my-4">{speaker.bio}</p>
      <h2 className="mt-6 font-semibold">Comments</h2>
      <ul className="list-disc pl-5">
        {comments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
    </article>
  );
}

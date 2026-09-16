import { notFound } from "next/navigation";
import { getTalk } from "@/lib/db";
import { getComments, getSpeaker } from "@/lib/speakers";
import { vote } from "@/app/actions";
import { Collapsible } from "@/components/collapsible";
import { SpeakerBio } from "@/components/speaker-bio";

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
      <form action={vote} className="my-3">
        <input type="hidden" name="id" value={talk.id} />
        <button className="rounded border px-3 py-1">Vote</button>
      </form>
      <Collapsible title={`About ${speaker.name}`}>
        <SpeakerBio id={speaker.id} />
      </Collapsible>
      <h2 className="mt-6 font-semibold">Comments</h2>
      <ul className="list-disc pl-5">
        {comments.map((c) => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
    </article>
  );
}

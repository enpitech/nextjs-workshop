import { notFound } from "next/navigation";
import { getTalk } from "@/lib/db";
import { getComments, getSpeaker } from "@/lib/speakers";
import { voteWithState } from "@/app/actions";
import { Collapsible } from "@/components/collapsible";
import { SpeakerBio } from "@/components/speaker-bio";
import { VoteForm } from "@/components/vote-form";

// params is a promise in Next 16. You must await it.
export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "boom") throw new Error("Boom: a render error on the server (1.2f)");
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
      {/* 1.5f built this as a plain <form action={vote}>. That shape is in app/breaks/5/broken/page.tsx.
          2.4b upgraded it: pending state, a returned message, useActionState. */}
      <VoteForm id={talk.id} action={voteWithState} />
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

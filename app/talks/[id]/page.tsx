import Link from "next/link";
import { notFound } from "next/navigation";
import { getTalk } from "@/lib/talks";
import { getComments } from "@/lib/comments";
import { getSpeaker } from "@/lib/speakers";
import { voteWithState } from "@/app/talks/actions";
import { Collapsible } from "@/components/collapsible";
import { SpeakerBio } from "@/components/speaker-bio";
import { VoteForm } from "@/components/vote-form";
import { TalkCard } from "@/components/talk-card";
import { CommentList } from "@/components/comment-list";
import { SectionHeading } from "@/components/section-heading";

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
    <article className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <span aria-hidden="true">←</span> All talks
      </Link>

      <TalkCard talk={talk} speakerName={speaker.name}>
        {/* 1.5f built this as a plain <form action={vote}>. That shape is in app/breaks/5/broken/page.tsx.
            2.4b upgraded it: pending state, a returned message, useActionState. */}
        <VoteForm id={talk.id} action={voteWithState} />
      </TalkCard>

      <Collapsible title={`About ${speaker.name}`}>
        <SpeakerBio id={speaker.id} />
      </Collapsible>

      <section>
        <SectionHeading title="Comments" count={comments.length} />
        <CommentList comments={comments} />
      </section>
    </article>
  );
}

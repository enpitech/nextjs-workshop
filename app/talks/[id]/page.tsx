import Link from "next/link";
import { notFound } from "next/navigation";
import { getTalk } from "@/lib/talks";
import { getComments } from "@/lib/comments";
import { getSpeaker } from "@/lib/speakers";
import { voteWithState } from "@/app/talks/actions";
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
    <article className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-strong"
      >
        <span aria-hidden="true">←</span> All talks
      </Link>

      <header className="panel p-7 sm:p-9">
        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-strong">
          {talk.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{talk.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          <span className="font-medium text-ink">{speaker.name}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{talk.votes} votes</span>
        </p>
        <div className="mt-6 border-t border-line pt-6">
          {/* 1.5f built this as a plain <form action={vote}>. That shape is in app/breaks/5/broken/page.tsx.
              2.4b upgraded it: pending state, a returned message, useActionState. */}
          <VoteForm id={talk.id} action={voteWithState} />
        </div>
      </header>

      <Collapsible title={`About ${speaker.name}`}>
        <SpeakerBio id={speaker.id} />
      </Collapsible>

      <section>
        <h2 className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Comments
          <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-semibold text-ink tabular-nums">
            {comments.length}
          </span>
          <span className="h-px flex-1 bg-line" />
        </h2>
        {comments.length === 0 ? (
          <p className="panel px-6 py-8 text-center text-sm text-muted">No comments yet.</p>
        ) : (
          <ul className="panel divide-y divide-line overflow-hidden">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3 px-5 py-4 text-sm leading-relaxed">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

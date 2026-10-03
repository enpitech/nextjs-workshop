// Exercise 0, solution. A dynamic segment: /exercises/0/solution/speakers/1, /2 and so on.
import { notFound } from "next/navigation";
import { getSpeaker } from "@/lib/speakers";
import { getTalks } from "@/lib/talks";
import { SpeakerCard } from "../speaker-card";

// params is a promise in Next 16. You must await it. The value is always a string.
export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const speakerId = Number(id);
  if (!Number.isInteger(speakerId)) notFound();

  // Without the catch, /speakers/99 throws and error.tsx renders. A missing speaker is a 404, not an error.
  const speaker = await getSpeaker(speakerId).catch(() => null);
  if (!speaker) notFound();

  const talks = (await getTalks()).filter((t) => t.speakerId === speaker.id);

  return <SpeakerCard speaker={speaker} talks={talks} />;
}

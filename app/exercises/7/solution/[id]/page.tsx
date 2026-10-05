// Exercise 7, solution. A missing speaker is a 404, not an error. A real error goes to error.tsx.
import { notFound } from "next/navigation";
import { getSpeaker } from "@/lib/speakers";

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "boom") throw new Error("Boom: a render error on the server");

  // Without the catch, /99 throws and error.tsx renders. A missing speaker is not an error.
  const speaker = await getSpeaker(Number(id)).catch(() => null);
  if (!speaker) notFound();

  return (
    <main className="panel p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{speaker.name}</h1>
      <p className="mt-2 text-sm text-muted">{speaker.bio}</p>
    </main>
  );
}

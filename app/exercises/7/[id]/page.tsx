// Exercise 7: /exercises/7/1 works. /boom and /99 do not. See README.md.
import { getSpeaker } from "@/lib/speakers";

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "boom") throw new Error("Boom: a render error on the server");

  // /99 throws here: getSpeaker() fails with "GET /speakers/99 failed with 404".
  const speaker = await getSpeaker(Number(id));

  return (
    <main className="panel p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{speaker.name}</h1>
      <p className="mt-2 text-sm text-muted">{speaker.bio}</p>
    </main>
  );
}

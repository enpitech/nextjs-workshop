// Server Component. It reads the database. It is passed as `children`
// into <Collapsible>, so it never joins the client graph.
import { getSpeaker } from "@/lib/speakers";

export async function SpeakerBio({ id }: { id: number }) {
  const speaker = await getSpeaker(id);
  return <p>{speaker.bio}</p>;
}

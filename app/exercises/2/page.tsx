// Exercise 2: this route works. Refactor the boundary. See README.md.
import { getTalk } from "@/lib/db";
import { getComments, getSpeaker } from "@/lib/speakers";
import { TalkDetail } from "./talk-detail";

export default async function Exercise2() {
  const talk = await getTalk(3);
  const speaker = await getSpeaker(talk.speakerId);
  const comments = await getComments(talk.id);
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 2</h1>
      <TalkDetail talk={talk} speaker={speaker} comments={comments} />
    </main>
  );
}

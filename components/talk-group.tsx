// One category: a heading and the panel of talk rows under it.
import type { Talk } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { TalkRow } from "./talk-row";

export function TalkGroup({ name, talks }: { name: string; talks: Talk[] }) {
  return (
    <section>
      <SectionHeading title={name} />
      <ul className="panel divide-y divide-line overflow-hidden">
        {talks.map((talk) => (
          <TalkRow key={talk.id} talk={talk} />
        ))}
      </ul>
    </section>
  );
}

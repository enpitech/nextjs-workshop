import {getTalks} from "@/lib/talks";
import {TalkList} from "@/components/talk-list";
import {PageHeader} from "@/components/page-header";

// Server Component. It runs on the server, awaits data, and ships no JS.
export default async function Home() {
  const talks = await getTalks();
  return (
    <main>
      <PageHeader eyebrow="Program" title="Talks">
        <p className="mt-2 max-w-prose text-muted">
          Browse the submitted talks, open one for the speaker and the comments,
          and vote for the ones you want to see.
        </p>
      </PageHeader>
      <TalkList talks={talks} />
    </main>
  );
}

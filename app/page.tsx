import { getTalks } from "@/lib/db";
import { TalkList } from "@/components/talk-list";

// Server Component. It runs on the server, awaits data, and ships no JS.
export default async function Home() {
  const talks = await getTalks();
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Talks</h1>
      <TalkList talks={talks} />
    </main>
  );
}

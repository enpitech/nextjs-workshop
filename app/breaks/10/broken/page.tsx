// Break #10, broken: there is no error.tsx in this folder or above it.
// Click "Open talk 99". The Client Component throws, nothing catches it, and the whole page goes white.
// Compare with fixed/: the page is the same, and fixed/ has an error.tsx.
import { getTalks } from "@/lib/talks";
import { TalkViewer } from "../talk-viewer";

export default async function Page() {
  const talks = await getTalks();
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">Break #10: broken</h1>
      <TalkViewer talks={talks} />
    </main>
  );
}

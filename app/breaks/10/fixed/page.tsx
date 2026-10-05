// Break #10, fixed: the page is the same as in broken/. The new file is error.tsx next to it.
// Click "Open talk 99". Only this segment shows the message. The nav and the layout stay.
import { getTalks } from "@/lib/talks";
import { TalkViewer } from "../talk-viewer";

export default async function Page() {
  const talks = await getTalks();
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">Break #10: fixed</h1>
      <TalkViewer talks={talks} />
    </main>
  );
}

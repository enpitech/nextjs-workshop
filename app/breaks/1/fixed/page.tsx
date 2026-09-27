// Break #1, fixed: the function is defined on the client side of the line.
// The Server Component passes only data. The Client Component owns the handler.
import { getTalks } from "@/lib/talks";
import { VotePanel } from "./vote-panel";

export default async function Fixed() {
  const talks = await getTalks();
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #1: fixed</h1>
      <VotePanel talks={talks} />
    </main>
  );
}

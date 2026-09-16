// Exercise 1, solution B: the handler writes to the server, so it is a Server Action.
// Solution A (handler in a Client Component) is /breaks/1/fixed.
import { getTalks } from "@/lib/db";
import { vote } from "@/app/actions";
import { VoteList } from "@/app/breaks/1/vote-list";

export default async function Solution1() {
  const talks = await getTalks();

  async function onVote(id: number) {
    "use server";
    const formData = new FormData();
    formData.set("id", String(id));
    await vote(formData);
  }

  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercise 1: solution</h1>
      <VoteList talks={talks} onVote={onVote} />
    </main>
  );
}

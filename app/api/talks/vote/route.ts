// POST /api/talks/vote  { "id": 1 }  adds a vote from outside the app.
// updateTag is not allowed here (Server Actions only).
// revalidateTag needs its second argument; the one-argument form is a TypeScript error.
import { revalidateTag } from "next/cache";
import { addVote } from "@/lib/talks";

export async function POST(request: Request) {
  const { id } = await request.json();
  const talk = await addVote(Number(id));
  revalidateTag("talks", "max");
  revalidateTag(`talk-${talk.id}`, "max");
  return Response.json(talk);
}

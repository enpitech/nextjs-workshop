// GET /api/talks/1. A dynamic segment in a Route Handler.
// The second argument holds params, and params is a promise, as on a page.
// RouteContext is a global type that next dev and next build generate from the folders.
import { getTalk } from "@/lib/talks";

export async function GET(_request: Request, ctx: RouteContext<"/api/talks/[id]">) {
  const { id } = await ctx.params;
  const talkId = Number(id);
  // notFound() works here too, but it sends a 404 with an empty body.
  // A JSON caller wants to know why, so the handler sets the status itself.
  if (!Number.isInteger(talkId)) {
    return Response.json({ error: `Not a talk id: ${id}` }, { status: 400 });
  }
  const talk = await getTalk(talkId).catch(() => null);
  if (!talk) return Response.json({ error: `No talk ${talkId}` }, { status: 404 });
  return Response.json(talk);
}

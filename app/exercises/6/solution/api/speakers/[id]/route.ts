// Exercise 6, solution. A Route Handler answers a program, so it sends a status code
// and a body that says what was wrong. It renders no not-found.tsx and no error.tsx.
import { getSpeaker } from "@/lib/speakers";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/exercises/6/solution/api/speakers/[id]">,
) {
  const { id } = await ctx.params;
  const speakerId = Number(id);
  if (!Number.isInteger(speakerId)) {
    return Response.json({ error: `Not a speaker id: ${id}` }, { status: 400 });
  }
  const speaker = await getSpeaker(speakerId).catch(() => null);
  if (!speaker) return Response.json({ error: `No speaker ${speakerId}` }, { status: 404 });
  return Response.json(speaker);
}

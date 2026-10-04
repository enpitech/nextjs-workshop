// Exercise 6: GET /exercises/6/api/speakers/1 works. /99 and /abc send a 500. See README.md.
import { getSpeaker } from "@/lib/speakers";

export async function GET(_request: Request, ctx: RouteContext<"/exercises/6/api/speakers/[id]">) {
  const { id } = await ctx.params;
  const speaker = await getSpeaker(Number(id));
  return Response.json(speaker);
}

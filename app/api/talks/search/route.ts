// GET /api/talks/search?q=server. Called by the search box on /search as you type.
// It reads the same cached getTalks() as GET /api/talks, but it also reads the URL.
// Reading the request (url, searchParams, headers, cookies, body) stops the prerender,
// so this row is ƒ in the build output and /api/talks stays ○.
// A static folder name wins over [id], so /api/talks/search never reaches ../[id]/route.ts.
import type { NextRequest } from "next/server";
import { getTalks } from "@/lib/talks";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const talks = await getTalks();
  return Response.json(talks.filter((t) => t.title.toLowerCase().includes(q)));
}

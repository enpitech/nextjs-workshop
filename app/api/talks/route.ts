// The sixth route file. For callers outside the React tree: a mobile app,
// a webhook, a third party. A Server Component does not call this. It
// calls lib/talks.ts directly.
import { getTalks } from "@/lib/talks";

// GET /api/talks. Under the flag this prerenders (○ in the build output):
// it reads only cached data. The directive lives on getTalks(), not on GET.
// A POST in the same file would make the whole file dynamic (ƒ), so the
// write lives in ./vote/route.ts.
export async function GET() {
  const talks = await getTalks();
  return Response.json(talks);
}

// Exercise 9, Task 7. POST .../board/api/revalidate?tag=speakers
// A webhook: the program committee changed data outside the app and tells us which tag.
// A Route Handler may call revalidateTag. updateTag works in Server Actions only.
// A POST handler runs on every request, so the build prints ƒ.
import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const TAGS = ["talks", "speakers"];

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  if (!tag || !TAGS.includes(tag)) {
    return Response.json({ error: `Unknown tag: ${tag}` }, { status: 400 });
  }
  // "max": the next reader gets the old value at once, and a fresh read runs in the background.
  revalidateTag(tag, "max");
  return Response.json({ revalidated: tag });
}

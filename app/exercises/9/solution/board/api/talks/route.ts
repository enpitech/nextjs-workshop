// Exercise 9, Task 6. GET .../board/api/talks for the mobile app.
// It reads only cached data and does not read the request, so the build prerenders it (○).
// "use cache" cannot go in the body of GET. It is on getTalks(), the same function the page calls.
import { getTalks } from "../../data";

export async function GET() {
  return Response.json(await getTalks());
}

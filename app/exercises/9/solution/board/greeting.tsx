// Exercise 9, Tasks 2 and 4. The one part of the board that depends on the request.
// cookies() is a runtime read, so the page renders this inside <Suspense>.
import { cookies } from "next/headers";
import { getSpeaker } from "./data";

export async function Greeting() {
  const id = (await cookies()).get("speaker")?.value;
  if (!id) return <p>Signed in as a guest.</p>;

  // Task 4: read the cookie here, outside the cache, and pass the value in.
  const me = await getSpeaker(Number(id));
  return <p>Signed in as {me.name}.</p>;
}

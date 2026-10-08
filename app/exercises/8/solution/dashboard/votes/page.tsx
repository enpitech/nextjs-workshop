// Exercise 8, stretch. The team renamed "Votes" to "Talks". Old bookmarks must still work.
// redirect() runs on the server and throws, so no line after it runs. The browser gets a 307.
import { redirect } from "next/navigation";

export default function Votes() {
  redirect("/exercises/8/solution/dashboard/talks");
}

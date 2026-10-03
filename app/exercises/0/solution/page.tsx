// Exercise 0, solution. The solution lives one folder down, so this route only sends you there.
import { redirect } from "next/navigation";

export default function Solution0() {
  redirect("/exercises/0/solution/speakers");
}

// Exercise 10, solution. The fixed page lives one folder down, so this route only sends you there.
import { redirect } from "next/navigation";

export default function Solution10() {
  redirect("/exercises/10/solution/top");
}

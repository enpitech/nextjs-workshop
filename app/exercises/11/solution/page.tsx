// Exercise 11, solution. The fixed page lives one folder down, so this route only sends you there.
import { redirect } from "next/navigation";

export default function Solution11() {
  redirect("/exercises/11/solution/speakers");
}

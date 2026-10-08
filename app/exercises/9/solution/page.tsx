// Exercise 9, solution. The solution lives one folder down, so this route only sends you there.
import { redirect } from "next/navigation";

export default function Solution9() {
  redirect("/exercises/9/solution/board");
}

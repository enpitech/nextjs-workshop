// Exercise 8, solution. The solution lives one folder down, so this route only sends you there.
import { redirect } from "next/navigation";

export default function Solution8() {
  redirect("/exercises/8/solution/dashboard");
}

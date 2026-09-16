// /talks has no page of its own. redirect() ends the render and sends the browser to /.
import { redirect } from "next/navigation";

export default function Talks() {
  redirect("/");
}

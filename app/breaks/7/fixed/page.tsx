// Break #7, fixed: the first client render matches the server HTML. The change comes after.
import { Demo } from "../demo";
import { WhereAmI } from "./where-am-i";

export default function Fixed() {
  return (
    <Demo title="Break #7: fixed">
      <WhereAmI />
    </Demo>
  );
}

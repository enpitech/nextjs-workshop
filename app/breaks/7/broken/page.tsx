// Break #7: the first client render differs from the server HTML.
// Predict which boxes React keeps and which it makes again in the browser.
import { Demo } from "../demo";
import { WhereAmI } from "./where-am-i";

export default function Broken() {
  return (
    <Demo title="Break #7: broken">
      <WhereAmI />
    </Demo>
  );
}

// Break #8, fixed: this page renders inside the provider, and it is still a Server Component.
// Compare layout.tsx in broken/ and fixed/. The pages are the same.
import { Talks } from "../talks";

export default function Page() {
  return <Talks title="Break #8: fixed" />;
}

// Break #9, fixed: the same card, with the guard on.
// If a Client Component imports this file, the build fails. The fixed page is a Server Component, so it works.
import "server-only";

const API_KEY = "dangerous-api-key";

export function SecretCard() {
  const where = typeof window === "undefined" ? "server" : "browser";
  console.log(`SecretCard ran in the ${where}. Key starts with ${API_KEY.slice(0, 4)}`);
  return <p className="panel p-5">SecretCard rendered. Read the browser console.</p>;
}

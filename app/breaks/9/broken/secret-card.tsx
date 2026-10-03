// Break #9, broken: written as a Server Component. No directive, and it holds a secret.
// The guard: uncomment the next line. The import from page.tsx becomes an error.
// import "server-only";

const API_KEY = "dangerous-api-key";

// Not async: a Client Component cannot render an async component.
export function SecretCard() {
  const where = typeof window === "undefined" ? "server" : "browser";
  console.log(`SecretCard ran in the ${where}. Key starts with ${API_KEY.slice(0, 4)}`);
  // Do not render `where`: the server text and the browser text differ, a hydration mismatch.
  return <p className="panel p-5">SecretCard rendered. Read the browser console.</p>;
}

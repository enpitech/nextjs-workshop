// The HTTP client for json-server on port 3001. Every data module imports read from here.
// "server-only" turns an import from a Client Component into a build error.
import "server-only";

export const API = "http://localhost:3001";

export async function read<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
  return res.json();
}

// The cache contract. The server page and the Client Component both import the key from here.
// No directive and no server-only import, so either graph can use it.
import { queryOptions } from "@tanstack/react-query";
import type { Talk } from "@/lib/types";

const key = ["spa", "talks"] as const;

export const talksCache = {
  key,
  options: () =>
    queryOptions({
      queryKey: key,
      // This one runs in the browser, so it fetches the Route Handler. The server page replaces it.
      queryFn: async (): Promise<Talk[]> => {
        const res = await fetch("/api/talks");
        if (!res.ok) throw new Error(`GET /api/talks failed with ${res.status}`);
        return res.json();
      },
      // The hydrated data counts as fresh for 30 seconds, so the first render does not refetch.
      staleTime: 30_000,
    }),
};

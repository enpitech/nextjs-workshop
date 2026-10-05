"use client";
// The QueryClientProvider. Context only works in the client graph, so this file needs the directive.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // On the server: a new client for every render, so requests never share a cache.
  // In the browser: one client for the whole session, so the cache survives navigation.
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}

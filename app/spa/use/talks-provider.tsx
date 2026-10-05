"use client";
// The provider holds a promise, not data. The server starts the read. The browser unwraps it later.
import { createContext, useContext } from "react";
import type { Talk } from "@/lib/types";

const TalksContext = createContext<Promise<Talk[]> | null>(null);

export function useTalks() {
  const talksPromise = useContext(TalksContext);
  if (!talksPromise) throw new Error("useTalks must be used within a TalksProvider");
  return talksPromise;
}

export function TalksProvider({
  children,
  talksPromise,
}: {
  children: React.ReactNode;
  talksPromise: Promise<Talk[]>;
}) {
  return <TalksContext value={talksPromise}>{children}</TalksContext>;
}

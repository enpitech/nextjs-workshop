// Exercise 8, Task 5. The page is a Server Component. It reads the data and hands it to the table.
// The table is the Client Component, so `talks` is the line between the two graphs.
import type { Metadata } from "next";
import { getTalks } from "@/lib/talks";
import { TalkTable } from "./talk-table";

export const metadata: Metadata = { title: "Talks" };

export default async function TalksPage() {
  const talks = await getTalks();
  return <TalkTable talks={talks} />;
}

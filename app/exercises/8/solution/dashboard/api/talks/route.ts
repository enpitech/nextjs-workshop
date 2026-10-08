// Exercise 8, Task 10. A Route Handler answers a program, such as a spreadsheet import.
// It sends a status code and a JSON body. It renders no not-found.tsx and no error.tsx.
// Reading the URL (searchParams) stops the prerender, so this route is dynamic.
import type { NextRequest } from "next/server";
import { getTalks } from "@/lib/talks";
import { CATEGORIES } from "@/lib/types";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  // TypeScript needs the cast: CATEGORIES is a list of literal strings, and `category` is any string.
  if (category !== null && !(CATEGORIES as readonly string[]).includes(category)) {
    return Response.json({ error: `Unknown category: ${category}` }, { status: 400 });
  }

  const talks = await getTalks();
  return Response.json(category ? talks.filter((t) => t.category === category) : talks);
}

// No other method is exported. A DELETE gets 405 Method Not Allowed from Next, with no code from you.

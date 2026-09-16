"use client";
// Break #6, fixed: the App Router import.
import { useRouter } from "next/navigation";

export default function Fixed() {
  const router = useRouter();
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Break #6: fixed</h1>
      <button className="rounded border px-3 py-1" onClick={() => router.push("/")}>
        Home
      </button>
    </main>
  );
}

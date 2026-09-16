"use client";
// The Pages Router import. In app/ there is no Pages router to mount, so the hook throws.
import { useRouter } from "next/router";

export function OldRouterButton() {
  const router = useRouter();
  return (
    <button className="rounded border px-3 py-1" onClick={() => router.push("/")}>
      Home
    </button>
  );
}

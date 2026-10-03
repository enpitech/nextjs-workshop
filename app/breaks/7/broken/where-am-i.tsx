"use client";

// The server has no window, so it renders "server". The browser renders "browser".
// The two HTML trees differ, and React reports a hydration mismatch.
export function WhereAmI() {
  const where = typeof window === "undefined" ? "server" : "browser";
  return <p>Rendered in the {where}</p>;
}

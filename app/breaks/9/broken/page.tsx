"use client";
// Break #9, broken: the page needed useState, so someone put "use client" at the top.
// Now everything this file imports is in the client graph: SecretCard and its API key ship to the browser.
// Predict, then open DevTools, press Ctrl+Shift+F, and search for the key.
import { useState } from "react";
import { SecretCard } from "./secret-card";

export default function Page() {
  const [open, setOpen] = useState(true);
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-bold">Break #9: broken</h1>
      <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"} the card</button>
      {open && <SecretCard />}
    </main>
  );
}

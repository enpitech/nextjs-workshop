"use client";
// Break #9, fixed: the state moved into this leaf. It renders `children` and does not import them,
// so SecretCard stays in the server graph.
import { useState } from "react";

export function Toggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"} the card</button>
      {open && children}
    </>
  );
}

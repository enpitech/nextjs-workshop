"use client";
// The escape hatch (1.5c): a Client Component can render server output it
// did not import. `children` arrives already rendered, as part of the payload.
import { useState } from "react";

export function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-4 rounded border">
      <button className="w-full px-3 py-2 text-left" onClick={() => setOpen(!open)}>
        {open ? "▾" : "▸"} {title}
      </button>
      {open && <div className="border-t px-3 py-2">{children}</div>}
    </div>
  );
}

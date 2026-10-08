"use client";
// Exercise 8, given, for Task 4. A panel that opens and closes. It has state, so it is a Client Component.
// It renders `children` but does not import them, so a Server Component can go inside it.
// `children` arrives already rendered, as part of the payload.
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
    <div className="panel overflow-hidden">
      <button
        className="w-full justify-between rounded-none border-0 bg-transparent px-5 py-3.5 text-left font-medium shadow-none hover:bg-accent-soft/60"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {title}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="fade-in border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      )}
    </div>
  );
}

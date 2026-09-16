"use client";
// The leaf. It owns one boolean. The comments arrive rendered, as children.
import { useState } from "react";

export function CommentsToggle({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button className="rounded border px-2" onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} {count} comments
      </button>
      {show && children}
    </div>
  );
}

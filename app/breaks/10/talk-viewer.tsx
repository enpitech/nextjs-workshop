"use client";
// Break #10: a Client Component that throws in the browser, after hydration.
// The page loads fine. The click is what breaks it: byId[99] is undefined, and the render reads .title.
import { useState } from "react";
import type { Talk } from "@/lib/types";

export function TalkViewer({ talks }: { talks: Talk[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const byId: Record<number, Talk> = Object.fromEntries(talks.map((t) => [t.id, t]));

  return (
    <section className="panel grid gap-3 p-5">
      <div className="flex flex-wrap gap-2">
        {talks.slice(0, 2).map((t) => (
          <button key={t.id} className="btn-primary" onClick={() => setOpenId(t.id)}>
            Open talk {t.id}
          </button>
        ))}
        {/* Talk 99 does not exist. */}
        <button className="btn-primary" onClick={() => setOpenId(99)}>
          Open talk 99
        </button>
      </div>
      {/* TypeScript is happy: a Record<number, Talk> says every key exists. The data says otherwise. */}
      {openId !== null && <p className="text-lg font-medium">{byId[openId].title}</p>}
    </section>
  );
}

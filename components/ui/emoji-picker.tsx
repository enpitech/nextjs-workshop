"use client";
import { useState } from "react";
import { EMOJI_TABLE } from "./emoji-table";

export function EmojiPicker() {
  const [q, setQ] = useState("");
  const hits = EMOJI_TABLE.filter((e) => e.name.includes(q.toUpperCase())).slice(0, 5);
  return (
    <div>
      <input className="border px-2" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul>{hits.map((h) => <li key={h.code}>{h.name}</li>)}</ul>
    </div>
  );
}

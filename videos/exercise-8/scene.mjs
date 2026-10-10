// Exercise 8: the organizer dashboard. One scene per narration beat.
// Facts and numbers come from app/exercises/8/README.md and db.seed.json.
import {
  C, UI, MONO, W, H, camera, quad, box, line3, label3, pill, render, rr, tex, rotate,
  clamp, lerp, lerp3, smooth, easeOut, easeInOut, back, span,
} from "../engine.mjs";
import { chrome, codeCard, terminal, termLength, cubeFace, fit } from "../widgets.mjs";

export const chip = "Next.js 16 · Exercise 8";
export const steps = {
  intro: "Day 1 capstone",
  router: "Setup",
  layout: "Tasks 1–2",
  data: "Tasks 3–5",
  vote: "Task 6",
  trouble: "Tasks 7–8",
  api: "Tasks 9–10",
  theme: "Task 11",
  outro: "Wrap-up",
};

// ---------- data (db.seed.json) ----------
const TALKS = [
  { id: 1, title: "Two graphs, one boundary", votes: 12, category: "architecture" },
  { id: 2, title: "Reading the RSC payload", votes: 8, category: "frontend" },
  { id: 3, title: "Caching is opt-in", votes: 15, category: "performance" },
  { id: 4, title: "The waterfall trap", votes: 5, category: "performance" },
  { id: 5, title: "Server Actions in production", votes: 9, category: "backend" },
  { id: 6, title: "Agents that know Next 16", votes: 3, category: "ai" },
];
const SPEAKERS = ["Noa Levi", "Dan Cohen", "Maya Peretz", "Omer Katz"];
const CAT = { architecture: "#4c8dff", frontend: "#2ec4b6", performance: "#ffa04a", backend: "#b48cff", ai: "#ff6fb5" };

const TASKS = [
  { n: 1, label: "Layout", color: C.server },
  { n: 2, label: "Active link", color: C.client },
  { n: 3, label: "Numbers", color: C.server },
  { n: 4, label: "Speakers", color: C.server },
  { n: 5, label: "Talks table", color: C.client },
  { n: 6, label: "Vote", color: C.action },
  { n: 7, label: "One talk", color: C.server },
  { n: 8, label: "Errors", color: C.red },
  { n: 9, label: "Tab title", color: C.server },
  { n: 10, label: "JSON", color: C.green },
  { n: 11, label: "Theme", color: C.client },
];

// ---------- dashboard textures ----------
// The page colors. Dark is the default look. Light is app/exercises/8/theme.css (Task 11).
const DARK = {
  paper: "#0f172d", page: "#141f3b", aside: "#0c1429", card: "#0e1730", rowA: "#111b35", rowB: "#0f1831",
  field: "#0a1123", btn: "#1b2747", text: "#e9eef8", muted: "#8d9abb", faint: "#56627f", line: "#26345a",
  accent: "#4c8dff", link: "#82aaff", rowTitle: "#cfe0ff", body: "#c9d3ea", activeText: "#ffffff",
};
const LIGHT = {
  paper: "#faf9f7", page: "#ffffff", aside: "#ffffff", card: "#faf9f7", rowA: "#f5f5f4", rowB: "#ffffff",
  field: "#ffffff", btn: "#f5f5f4", text: "#1c1917", muted: "#78716c", faint: "#a8a29e", line: "#e7e5e4",
  accent: "#4f46e5", link: "#4f46e5", rowTitle: "#4338ca", body: "#44403c", activeText: "#1c1917",
};
function mixHex(a, b, k) {
  const h = (x, i) => parseInt(x.slice(1 + i * 2, 3 + i * 2), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(lerp(h(a, i), h(b, i), k)).toString(16).padStart(2, "0")).join("");
}
let P = DARK; // the palette of the texture being drawn
let LK = 0; // 0 = dark, 1 = light
function setLight(k) {
  LK = clamp(k ?? 0);
  P = LK <= 0 ? DARK : Object.fromEntries(Object.keys(DARK).map((n) => [n, mixHex(DARK[n], LIGHT[n], LK)]));
}
const DW = 1280, DH = 800;
const SEC = { x: 304, y: 176, w: 952, h: 600 }; // the <section> around {children}
const PX = 16 / DW; // world units per texture pixel

function badge(g, x, y, text) {
  g.font = `600 17px ${UI}`;
  const w = g.measureText(text).width + 22;
  const col = LK > 0 ? mixHex(CAT[text], "#000000", 0.45 * LK) : CAT[text];
  rr(g, x, y - 14, w, 28, 14); g.fillStyle = CAT[text] + "30"; g.fill();
  g.fillStyle = col; g.textBaseline = "middle"; g.fillText(text, x + 11, y + 1);
  return w;
}

function button(g, x, y, w, text, { primary = true, disabled = false } = {}) {
  rr(g, x, y - 20, w, 40, 10);
  g.fillStyle = disabled ? "#2a3553" : primary ? P.accent : "#1b2747"; g.fill();
  g.font = `600 19px ${UI}`; g.fillStyle = disabled ? C.muted : "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, x + w / 2, y + 1); g.textAlign = "left";
}

// Draw the page that goes in the <section>, at (x0, y0) with size w x h.
function drawPage(g, x0, y0, w, h, o) {
  g.save();
  g.translate(x0, y0);
  rr(g, 0, 0, w, h, 16); g.fillStyle = P.page; g.fill();
  g.save(); g.clip();
  g.textBaseline = "middle";
  const H2 = (s, y = 46) => { g.font = `700 34px ${UI}`; g.fillStyle = P.text; g.fillText(s, 28, y); };
  if (o.page === "overview") {
    H2("Overview");
    const stats = [["Talks", "6"], ["Votes", String(o.votesTotal ?? 52)], ["Speakers", "4"], ["Top talk", "Caching is opt-in"]];
    const cw = (w - 28 * 2 - 18 * 3) / 4;
    stats.forEach(([k, v], i) => {
      const x = 28 + i * (cw + 18);
      rr(g, x, 90, cw, 124, 14); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.lineWidth = 2; g.stroke();
      g.font = `500 19px ${UI}`; g.fillStyle = P.muted; g.fillText(k, x + 18, 122);
      g.font = v.length > 3 ? `700 21px ${UI}` : `700 46px ${UI}`; g.fillStyle = P.text;
      g.fillText(fit(g, v, cw - 30), x + 18, 172);
    });
    rr(g, 28, 240, w - 56, o.speakersOpen ? 210 : 58, 12); g.fillStyle = P.card; g.fill(); g.strokeStyle = P.line; g.stroke();
    g.font = `600 22px ${UI}`; g.fillStyle = P.text; g.fillText((o.speakersOpen ? "▾ " : "▸ ") + "Speakers", 48, 270);
    if (o.speakersOpen) SPEAKERS.forEach((s, i) => { g.font = `400 20px ${UI}`; g.fillStyle = P.muted; g.fillText("• " + s, 66, 312 + i * 36); });
    g.font = `500 20px ${UI}`; g.fillStyle = P.link;
    const ly = o.speakersOpen ? 490 : 340;
    g.fillText("Download the talks as JSON", 28, ly); g.fillRect(28, ly + 14, g.measureText("Download the talks as JSON").width, 2);
  } else if (o.page === "talks") {
    H2("Talks");
    rr(g, w - 248, 26, 220, 42, 10); g.fillStyle = P.card; g.fill(); g.strokeStyle = o.filterHot ? C.client : P.line; g.lineWidth = 2; g.stroke();
    g.font = `500 20px ${UI}`; g.fillStyle = P.text; g.fillText((o.filter ?? "All"), w - 232, 47); g.fillText("▾", w - 52, 47);
    const rows = TALKS.filter((t) => !o.filter || o.filter === "All" || t.category === o.filter);
    rows.forEach((t, i) => {
      const y = 112 + i * 78;
      const a = o.rowIn ? clamp(o.rowIn * rows.length - i) : 1;
      g.globalAlpha = a;
      rr(g, 20, y - 34, w - 40, 70, 12); g.fillStyle = i % 2 ? P.rowA : P.rowB; g.fill();
      g.font = `600 22px ${UI}`; g.fillStyle = P.rowTitle; g.fillText(fit(g, t.title, 400), 40, y - 6);
      const votes = t.id === 1 && o.votes1 != null ? o.votes1 : t.votes;
      g.font = `400 18px ${UI}`; g.fillStyle = P.muted;
      if (t.id === 1 && o.message) { g.fillStyle = C.green; g.fillText(o.message, 40, y + 20); }
      else g.fillText(`/talks/${t.id}`, 40, y + 20);
      badge(g, 470, y, t.category);
      g.font = `600 20px ${UI}`; g.fillStyle = t.id === 1 && o.votesHot ? C.green : P.text;
      g.fillText(`${votes} votes`, 650, y);
      const pending = t.id === 1 && o.pending;
      button(g, w - 160, y, 120, pending ? "Voting…" : "Vote", { disabled: pending });
      if (t.id === 1 && o.press) { rr(g, w - 164, y - 24, 128, 48, 12); g.strokeStyle = `rgba(255,255,255,${o.press})`; g.lineWidth = 3; g.stroke(); }
      g.globalAlpha = 1;
    });
  } else if (o.page === "talk") {
    g.font = `700 34px ${UI}`; g.fillStyle = P.text; g.fillText("Two graphs, one boundary", 28, 54);
    badge(g, 28, 104, "architecture");
    g.font = `500 22px ${UI}`; g.fillStyle = P.muted; g.fillText("Noa Levi · 12 votes", 190, 104);
    g.font = `600 24px ${UI}`; g.fillStyle = P.text; g.fillText("Comments", 28, 170);
    ["The drawing finally made the boundary click.", "Please show the payload row again."].forEach((s, i) => {
      g.font = `400 21px ${UI}`; g.fillStyle = P.body; g.fillText("• " + s, 40, 216 + i * 40);
    });
    g.font = `500 20px ${UI}`; g.fillStyle = P.link; g.fillText("← Back to talks", 28, 330);
  } else if (o.page === "loading") {
    g.font = `500 26px ${UI}`; g.fillStyle = C.muted; g.fillText("Loading the talk…", 28, 50);
    [[28, 100, 520, 34], [28, 156, 260, 26], [28, 220, 700, 22], [28, 262, 640, 22], [28, 304, 560, 22]].forEach(([x, y, ww, hh], i) => {
      rr(g, x, y, ww, hh, 8);
      const k = 0.5 + 0.5 * Math.sin((o.t ?? 0) * 5 - i * 0.6);
      g.fillStyle = `rgba(120,150,220,${0.12 + 0.12 * k})`; g.fill();
    });
  } else if (o.page === "error") {
    rr(g, 28, 30, w - 56, 190, 14); g.fillStyle = "rgba(255,93,108,0.12)"; g.fill(); g.strokeStyle = C.red; g.lineWidth = 3; g.stroke();
    g.font = `700 26px ${UI}`; g.fillStyle = C.red; g.fillText("Something went wrong", 56, 76);
    g.font = `400 22px ${MONO}`; g.fillStyle = "#ffd0d5"; g.fillText("Boom: a render error on the server", 56, 120);
    button(g, 56, 176, 160, "Try again");
  } else if (o.page === "notfound") {
    rr(g, 28, 30, w - 56, 190, 14); g.fillStyle = "rgba(255,209,102,0.10)"; g.fill(); g.strokeStyle = C.yellow; g.lineWidth = 3; g.stroke();
    g.font = `700 26px ${UI}`; g.fillStyle = C.yellow; g.fillText("No talk with this id", 56, 76);
    g.font = `400 22px ${UI}`; g.fillStyle = "#f3e6c2"; g.fillText("It is not in the program. Pick one from the list.", 56, 120);
    g.font = `500 21px ${UI}`; g.fillStyle = "#82aaff"; g.fillText("← Back to Talks", 56, 176);
  } else if (o.page === "children") {
    g.setLineDash([12, 10]); g.strokeStyle = "rgba(141,154,187,0.6)"; g.lineWidth = 3; rr(g, 6, 6, w - 12, h - 12, 12); g.stroke(); g.setLineDash([]);
    g.font = `500 34px ${MONO}`; g.fillStyle = "rgba(141,154,187,0.8)"; g.textAlign = "center"; g.fillText("{children}", w / 2, h / 2); g.textAlign = "left";
  }
  g.restore();
  g.restore();
}

function dashboard(key, o) {
  const [c, g] = tex(key, DW, DH);
  setLight(o.light);
  const top = chrome(g, DW, DH, { url: o.url ?? "localhost:3000/exercises/8/dashboard", tab: o.tab ?? "Dashboard" });
  if (LK > 0) {
    // the data-theme div: paper behind everything under the browser bar
    g.save(); rr(g, 0, 0, DW, DH, 26); g.clip(); g.fillStyle = P.paper; g.fillRect(0, top, DW, DH - top); g.restore();
    g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, DW - 3, DH - 3, 25); g.stroke();
  }
  g.textBaseline = "middle";
  g.font = `700 30px ${UI}`; g.fillStyle = P.text; g.fillText("Organizer dashboard", 28, top + 42);
  // aside
  const ax = 24, ay = SEC.y, aw = 260, ah = SEC.h;
  rr(g, ax, ay, aw, ah, 16); g.fillStyle = P.aside; g.fill();
  if (LK > 0) { g.strokeStyle = P.line; g.lineWidth = 2; g.stroke(); }
  if (o.asideGlow) { g.save(); g.strokeStyle = C.green; g.globalAlpha = o.asideGlow; g.lineWidth = 6; g.shadowColor = C.green; g.shadowBlur = 20; rr(g, ax, ay, aw, ah, 16); g.stroke(); g.restore(); }
  [["Overview", "overview"], ["Talks", "talks"]].forEach(([s, id], i) => {
    const y = ay + 44 + i * 54;
    const act = o.active === id;
    if (act) { rr(g, ax + 12, y - 22, aw - 24, 44, 10); g.fillStyle = P.accent + "29"; g.fill(); g.fillStyle = P.accent; g.fillRect(ax + 12, y - 22, 5, 44); }
    g.font = `${act ? 700 : 400} 24px ${UI}`; g.fillStyle = act ? P.activeText : P.muted; g.fillText(s, ax + 34, y);
  });
  if (o.linksHot) { g.save(); g.globalAlpha = o.linksHot; g.strokeStyle = C.client; g.lineWidth = 4; g.shadowColor = C.client; g.shadowBlur = 16; rr(g, ax + 6, ay + 14, aw - 12, 118, 12); g.stroke(); g.restore(); }
  rr(g, ax + 16, ay + 150, aw - 32, 150, 10); g.fillStyle = P.field; g.fill(); g.strokeStyle = o.noteHot ? C.yellow : P.line; g.lineWidth = 2; g.stroke();
  g.font = `400 19px ${UI}`; g.textBaseline = "top";
  if (o.note) { g.fillStyle = P.text; wrap(g, o.note, ax + 30, ay + 164, aw - 60, 26); }
  else { g.fillStyle = P.faint; g.fillText("A note for the team", ax + 30, ay + 164); }
  g.textBaseline = "middle";
  // Task 11: the ThemeToggle button, under the note
  const by = ay + 340;
  rr(g, ax + 16, by - 22, aw - 32, 44, 10); g.fillStyle = P.btn; g.fill();
  g.strokeStyle = o.toggleHot ? C.client : P.line; g.lineWidth = o.toggleHot ? 4 : 2;
  if (o.toggleHot) { g.save(); g.shadowColor = C.client; g.shadowBlur = 16; g.stroke(); g.restore(); } else g.stroke();
  g.font = `600 20px ${UI}`; g.fillStyle = P.text; g.textAlign = "center";
  g.fillText(LK > 0.5 ? "Dark mode" : "Light mode", ax + aw / 2, by + 1); g.textAlign = "left";
  if (o.page !== "none") drawPage(g, SEC.x, SEC.y, SEC.w, SEC.h, o);
  return c;
}

function wrap(g, s, x, y, max, lh) {
  let line = "", yy = y;
  for (const w of s.split(" ")) {
    if (g.measureText(line + w).width > max && line) { g.fillText(line, x, yy); line = ""; yy += lh; }
    line += w + " ";
  }
  g.fillText(line, x, yy);
}

function pageTex(key, o) {
  const [c, g] = tex(key, SEC.w, SEC.h);
  setLight(o.light);
  drawPage(g, 0, 0, SEC.w, SEC.h, o);
  return c;
}

// small textures
function fileRow(key, { name, depth, kind, url, hot = 0, dim = 0 }) {
  const w = 620, h = 64;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 14);
  g.fillStyle = hot ? `rgba(20,60,45,${0.9})` : "#0f1730"; g.fill();
  g.strokeStyle = hot ? C.green : C.line; g.lineWidth = hot ? 4 : 2; g.stroke();
  g.textBaseline = "middle";
  const folder = name.endsWith("/");
  g.font = `600 24px ${UI}`;
  g.fillStyle = folder ? C.yellow : "#9fb3d9";
  g.fillText(folder ? "▸" : "•", 20, 33);
  g.font = `${folder ? 600 : 500} 26px ${MONO}`; g.fillStyle = folder ? "#ffe3a3" : C.text;
  g.fillText(name, 48, 33);
  const tag = kind === "client" ? ["use client", C.client] : kind === "server-action" ? ["use server", C.action] : null;
  if (tag) {
    g.font = `600 18px ${MONO}`;
    const tw = g.measureText(tag[0]).width + 22;
    rr(g, w - tw - 14, 16, tw, 32, 16); g.fillStyle = tag[1] + "33"; g.fill(); g.strokeStyle = tag[1]; g.lineWidth = 2; g.stroke();
    g.fillStyle = tag[1]; g.fillText(tag[0], w - tw - 3, 33);
  }
  if (dim) { g.fillStyle = `rgba(6,10,21,${dim})`; rr(g, 0, 0, w, h, 14); g.fill(); }
  return c;
}

function tabStrip(key, { title, url, hot = 0 }) {
  const w = 760, h = 150;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 18); g.fillStyle = "#0a1124"; g.fill();
  g.strokeStyle = hot ? C.server : C.line; g.lineWidth = 3; g.stroke();
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(30 + i * 24, 34, 7, 0, 7); g.fill(); });
  rr(g, 110, 12, 420, 46, 10); g.fillStyle = C.panel2; g.fill();
  g.fillStyle = C.server; g.beginPath(); g.arc(134, 35, 8, 0, 7); g.fill();
  g.font = `600 24px ${UI}`; g.fillStyle = C.text; g.textBaseline = "middle"; g.fillText(fit(g, title, 360), 154, 36);
  rr(g, 22, 80, w - 44, 46, 23); g.fillStyle = "#131c36"; g.fill();
  g.font = `400 21px ${MONO}`; g.fillStyle = C.muted; g.fillText(fit(g, url, w - 90), 46, 104);
  return c;
}

function bars(key, k, t) {
  // two parallel reads (0.8 s each, together) vs one after the other (1.6 s)
  const w = 980, h = 300;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 20); g.fillStyle = "#0b1226"; g.fill(); g.strokeStyle = C.line; g.lineWidth = 3; g.stroke();
  g.textBaseline = "middle";
  const x0 = 250, full = 640; // 1.6 s = full width
  const row = (y, name, from, len, color, a = 1) => {
    g.globalAlpha = a;
    g.font = `500 22px ${MONO}`; g.fillStyle = C.text; g.fillText(name, 30, y);
    rr(g, x0, y - 15, full, 30, 8); g.fillStyle = "#16203d"; g.fill();
    const p = clamp(k * 1.6 - from) / 1.6;
    const ww = Math.min(len / 1.6, p) * full;
    if (ww > 0) { rr(g, x0 + (from / 1.6) * full, y - 15, ww, 30, 8); g.fillStyle = color; g.fill(); }
    g.globalAlpha = 1;
  };
  g.font = `700 22px ${UI}`; g.fillStyle = C.green; g.fillText("Promise.all: together, about 0.8 s", 30, 34);
  row(78, "getTalks()", 0, 0.8, C.server);
  row(120, "getSpeakers()", 0, 0.8, C.server);
  g.font = `700 22px ${UI}`; g.fillStyle = C.red; g.globalAlpha = 0.85; g.fillText("Two awaits in a row: about 1.6 s", 30, 178); g.globalAlpha = 1;
  row(222, "getTalks()", 0, 0.8, "#55607e", 0.8);
  row(264, "getSpeakers()", 0.8, 0.8, "#55607e", 0.8);
  return c;
}

function boundaryWall(key) {
  const w = 512, h = 256;
  const [c, g] = tex(key, w, h);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(200,215,255,0.10)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  return c;
}

// ---------- shared server | browser stage ----------
function stage(items, a = 1) {
  items.push(quad({ pos: [0, 0.5, 6], w: 34, h: 15, rot: [0, Math.PI / 2, 0], img: boundaryWall("wall"), alpha: a, grid: 2, shade: false }));
  items.push(line3({ a: [0, -3, -10], b: [0, -3, 24], color: "#9fb6ff", width: 3, alpha: a * 0.9 }));
  items.push(line3({ a: [0, -3, -10], b: [0, 7.5, -10], color: "#9fb6ff", width: 2, alpha: a * 0.5, dash: [10, 10] }));
  items.push(label3({ at: [-7, 7.2, -2], text: "SERVER", color: C.server, border: C.server, size: 30, alpha: a }));
  items.push(label3({ at: [7, 7.2, -2], text: "BROWSER", color: C.client, size: 30, alpha: a }));
}

// a packet flying on an arc from a to b
function packet(items, a, b, k, color, text, id) {
  if (k <= 0 || k >= 1) return;
  const e = easeInOut(k);
  const p = lerp3(a, b, e);
  p[1] += Math.sin(Math.PI * e) * 2.2;
  const [img] = (() => {
    const [c, g] = tex("pk-" + id, 256, 256);
    g.fillStyle = color + "40"; g.fillRect(0, 0, 256, 256);
    g.font = `700 ${text.length > 3 ? 64 : 96}px ${MONO}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, 128, 132);
    return [c];
  })();
  items.push(box({ pos: p, size: [1.4, 1.4, 1.4], rot: [e * 1.2, e * 3, 0], color, front: [img], glow: color }));
  // trail
  for (let i = 1; i <= 6; i++) {
    const kk = clamp(e - i * 0.03);
    const q = lerp3(a, b, kk); q[1] += Math.sin(Math.PI * kk) * 2.2;
    const q2 = lerp3(a, b, clamp(kk + 0.03)); q2[1] += Math.sin(Math.PI * clamp(kk + 0.03)) * 2.2;
    items.push(line3({ a: q, b: q2, color, width: 6 - i * 0.8, alpha: 0.6 - i * 0.08 }));
  }
}

// ---------- scenes ----------
function intro(ctx, s) {
  const { lt, len } = s;
  const camX = lerp(-1.2, 1.6, easeInOut(lt / len));
  const cam = camera([camX, 2.2, -24], [1.5, 0.6, 0], 50);
  const enter = back(span(lt, 0.2, 2.4));
  const items = [];
  const panelPos = [lerp(15, 7.6, enter), 1.6 + Math.sin(lt * 1.3) * 0.15, lerp(30, 0, easeOut(span(lt, 0.2, 2.2)))];
  const rot = [0.04, lerp(-1.4, -0.32, enter) + Math.sin(lt * 0.6) * 0.04, 0];
  items.push(quad({ pos: panelPos, w: 16, h: 10, rot, img: dashboard("intro", { page: "overview", active: "overview", speakersOpen: lt > 6.5 }), glow: C.server, glowA: 0.25 }));
  TASKS.forEach((tk, i) => {
    const appear = back(span(lt, 2.6 + i * 0.16, 3.3 + i * 0.16));
    const ang = (i / TASKS.length) * Math.PI * 2 + lt * 0.35;
    const p = [7.6 + Math.cos(ang) * 10, -4.6 + Math.sin(ang * 2 + i) * 0.25, Math.sin(ang) * 6 + 2];
    const sz = 1.5 * appear;
    if (sz > 0.01) items.push(box({ pos: p, size: [sz, sz, sz], rot: [0.2, -ang + 0.6, 0], color: tk.color, front: cubeFace("ic" + i, { n: tk.n, color: tk.color }) }));
  });
  render(ctx, cam, items);
  // title block
  const a = smooth(span(lt, 0.5, 1.4)) * (1 - smooth(span(lt, len - 0.9, len)));
  const slide = (d) => (1 - easeOut(span(lt, 0.5 + d, 1.5 + d))) * -60;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textBaseline = "alphabetic";
  pill(ctx, 120 + slide(0), 300, "EXERCISE 8 · DAY 1 CAPSTONE", { align: "left", color: C.server, size: 24 });
  ctx.font = `800 92px ${UI}`; ctx.fillStyle = C.text;
  ctx.fillText("The organizer", 112 + slide(0.1), 430);
  ctx.fillText("dashboard", 112 + slide(0.2), 530);
  ctx.font = `400 34px ${UI}`; ctx.fillStyle = C.muted;
  ctx.fillText("11 tasks  ·  about 63 min", 118 + slide(0.3), 600);
  ctx.fillText("one idea from Day 1 in each task", 118 + slide(0.35), 650);
  ctx.restore();
}

const TREE = [
  { name: "dashboard/", depth: 0 },
  { name: "layout.tsx", depth: 1 },
  { name: "page.tsx", depth: 1, url: "/dashboard" },
  { name: "sidebar-link.tsx", depth: 1, kind: "client" },
  { name: "speaker-list.tsx", depth: 1 },
  { name: "talks/", depth: 1 },
  { name: "page.tsx", depth: 2, url: "/dashboard/talks" },
  { name: "talk-table.tsx", depth: 2, kind: "client" },
  { name: "actions.ts", depth: 2, kind: "server-action" },
  { name: "vote-button.tsx", depth: 2, kind: "client" },
  { name: "[id]/", depth: 2 },
  { name: "page.tsx", depth: 3, url: "/dashboard/talks/1" },
  { name: "loading.tsx", depth: 3 },
  { name: "error.tsx", depth: 3, kind: "client" },
  { name: "not-found.tsx", depth: 3 },
  { name: "api/talks/", depth: 1 },
  { name: "route.ts", depth: 2, url: "/dashboard/api/talks" },
];

function router(ctx, s) {
  const { lt, len } = s;
  const orbit = lerp(-0.18, 0.16, easeInOut(lt / len));
  const cam = camera([Math.sin(orbit) * 22 - 1, 3.2, -Math.cos(orbit) * 22], [1.2, 0.4, 0], 50);
  const items = [];
  const hotK = smooth(span(lt, 4.1, 4.8));
  TREE.forEach((f, i) => {
    const appear = easeOut(span(lt, 0.4 + i * 0.14, 1.0 + i * 0.14));
    if (appear <= 0) return;
    const isUrl = !!f.url;
    const pop = isUrl ? hotK : 0;
    const pos = [-4.5 + f.depth * 1.3 + pop * 0.6, 5.4 - i * 0.68 - (1 - appear) * 1.5, i * 0.06 - pop * 1.4];
    const img = fileRow("f" + i, { ...f, hot: pop > 0.5 ? 1 : 0, dim: isUrl ? 0 : hotK * 0.55 });
    items.push(quad({ pos, w: 7.75, h: 0.8, rot: [0, -0.12, 0], img, alpha: appear, grid: 3, glow: isUrl && pop > 0.1 ? C.green : null, glowA: 0.35 * pop }));
    if (isUrl && pop > 0.05) items.push(label3({ at: [pos[0] + 7.6, pos[1], pos[2]], text: "/exercises/8" + f.url, color: C.green, size: 22, alpha: pop, mono: true }));
  });
  // terminal: npm run reset
  const entries = [{ cmd: "npm run reset" }, { out: "db.json restored from db.seed.json", color: C.green }];
  const typed = span(lt, 0.3, 1.6) * termLength(entries);
  const term = terminal("t-reset", { entries, chars: typed, w: 760, size: 26, t: lt });
  const tin = easeOut(span(lt, 0.1, 0.9));
  items.push(quad({ pos: [-13.2, 1.6 - (1 - tin) * 2, 1], w: 8.6, h: 7.6 * term.height / term.width, rot: [0, -0.35, 0], img: term, alpha: tin, grid: 4 }));
  render(ctx, cam, items);
  // legend
  const la = smooth(span(lt, 2.4, 3.2));
  pill(ctx, W - 120, 150, "folder = URL segment", { align: "right", size: 24, alpha: la, color: C.yellow });
  pill(ctx, W - 120, 215, "page.tsx · route.ts = a URL", { align: "right", size: 24, alpha: hotK, color: C.green });
}

function layoutScene(ctx, s) {
  const { lt, len } = s;
  const partB = smooth(span(lt, 4.0, 5.2));
  const camPos = lerp3([1.5, 3.2, -23], [-8.6, 2.0, -15.5], partB);
  const camTgt = lerp3([0.5, 0.2, 0], [-6.9, 1.2, 0], partB);
  const cam = camera(camPos, camTgt, 50);
  const items = [];
  const explode = smooth(span(lt, 0.6, 1.6)) * (1 - smooth(span(lt, 4.0, 5.0)) * 0.9);
  const flip = easeInOut(span(lt, 2.5, 3.5));
  const onTalks = flip > 0.5 && lt < 5.6;
  const noteText = "Bring snacks for the speakers".slice(0, Math.floor(span(lt, 1.2, 2.4) * 29));
  const groupRot = [0.03, lerp(0.42, 0.12, easeInOut(lt / len)), 0];
  const gpos = [0, 0.4, 0];
  const linkActive = lt < 3.0 ? "overview" : lt < 5.9 ? "talks" : "overview";
  const url = linkActive === "talks" ? "localhost:3000/exercises/8/dashboard/talks" : "localhost:3000/exercises/8/dashboard";
  const lay = dashboard("lay", { page: "children", active: linkActive, url, tab: linkActive === "talks" ? "Talks" : "Dashboard", note: noteText, noteHot: lt > 3.6 && lt < 5.2, linksHot: smooth(span(lt, 5.0, 5.5)) });
  items.push(quad({ pos: gpos, w: 16, h: 10, rot: groupRot, img: lay, glow: C.server, glowA: 0.2 }));
  const pg = onTalks ? "talks" : "overview";
  const ang = flip * Math.PI;
  const extra = ang > Math.PI / 2 ? ang - Math.PI : ang;
  const off = [(SEC.x + SEC.w / 2 - DW / 2) * PX, (DH / 2 - (SEC.y + SEC.h / 2)) * PX, -explode * 2.8];
  const cpos = gpos.map((v, i) => v + rotate(off, groupRot)[i]);
  items.push(quad({ pos: cpos, w: SEC.w * PX, h: SEC.h * PX, rot: [groupRot[0], groupRot[1] + extra, 0], img: pageTex("pg", { page: pg }), glow: C.text, glowA: 0.12 * explode }));
  items.push(label3({ at: gpos.map((v, i) => v + rotate([-5.5, 5.7, 0], groupRot)[i]), text: "layout.tsx · stays mounted", color: C.server, size: 26, alpha: smooth(span(lt, 0.9, 1.5)) * (1 - partB) }));
  items.push(label3({ at: cpos.map((v, i) => v + rotate([2, 4.4, 0], groupRot)[i]), text: "page.tsx · swaps in {children}", color: C.text, size: 26, alpha: smooth(span(lt, 1.2, 1.8)) * (1 - partB) }));
  items.push(label3({ at: gpos.map((v, i) => v + rotate([-9.6, -0.6, -0.5], groupRot)[i]), text: "the note stays", color: C.yellow, size: 24, alpha: smooth(span(lt, 3.6, 4.0)) * (1 - smooth(span(lt, 5.0, 5.4))) }));
  // part B: the client link
  const cb = smooth(span(lt, 4.6, 5.3));
  const card = codeCard("c-link", {
    title: "sidebar-link.tsx", tag: '"use client"', tagColor: C.client, size: 24, w: 900,
    lines: ['"use client";', "const pathname = usePathname();", "const active = end", "  ? pathname === href", "  : pathname.startsWith(href);"],
    hl: lt > 5.8 ? 2 + span(lt, 6.2, 7.2) * 2 : 1, reveal: span(lt, 4.6, 5.6) * 6,
  });
  items.push(quad({ pos: [-12.3, 2.0 - (1 - cb), -4], w: 6.0, h: 6.0 * card.height / card.width, rot: [0, -0.15, 0], img: card, alpha: cb, grid: 4 }));
  render(ctx, cam, items);
  if (lt > 5.5 && lt < 6.3) {
    // a click on Overview
    const p = quad({ pos: gpos, w: 16, h: 10, rot: groupRot }).screenAt(cam, 70 / DW, (SEC.y + 44) / DH);
    if (p) cursor(ctx, p.x, p.y, span(lt, 5.75, 5.95));
  }
}

function cursor(ctx, x, y, press) {
  ctx.save();
  if (press > 0 && press < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - press})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + press * 34, 0, 7); ctx.stroke(); }
  ctx.translate(x, y);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 40); ctx.lineTo(22, 37); ctx.lineTo(15, 23); ctx.lineTo(27, 23); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function data(ctx, s) {
  const { lt, len } = s;
  const pan = smooth(span(lt, 6.2, 7.6));
  const cam = camera(lerp3([-7.5, 3.0, -17], [0.8, 2.6, -18.5], pan), lerp3([-6.5, 0.6, 0], [0.8, 0.4, 2], pan), 56);
  const items = [];
  const st = smooth(span(lt, 0, 0.8));
  stage(items, st);
  // server: the Overview reads two things at once
  const cIn = easeOut(span(lt, 0.4, 1.4));
  const code = codeCard("c-ov", {
    title: "dashboard/page.tsx", tag: "Server Component", tagColor: C.server, w: 980, size: 27,
    lines: ["export default async function Overview() {", "  const [talks, speakers] =", "    await Promise.all([getTalks(), getSpeakers()]);"],
    hl: lt < 3.6 ? 0 : 2, reveal: span(lt, 0.8, 2.4) * 4,
  });
  items.push(quad({ pos: [-8.6, 3.0 + (1 - cIn) * 2, 0], w: 9.6, h: 9.6 * code.height / code.width, rot: [0, 0.22, 0], img: code, alpha: cIn, grid: 5 }));
  const bIn = easeOut(span(lt, 3.8, 4.4)) * (1 - smooth(span(lt, 6.3, 6.8)));
  const b = bars("bars", span(lt, 4.2, 6.6), lt);
  items.push(quad({ pos: [-8.6, -2.2, -0.6], w: 9.6, h: 9.6 * b.height / b.width, rot: [0, 0.22, 0], img: b, alpha: bIn, grid: 4 }));
  // then the talks page hands plain data to the client table
  const t2 = easeOut(span(lt, 6.6, 7.4));
  const code2 = codeCard("c-tp", { title: "talks/page.tsx", tag: "Server Component", w: 980, size: 28, lines: ["const talks = await getTalks();", "return <TalkTable talks={talks} />;"], hl: 1 });
  items.push(quad({ pos: [-8.6, -2.0 - (1 - t2), -0.6], w: 9.6, h: 9.6 * code2.height / code2.width, rot: [0, 0.22, 0], img: code2, alpha: t2, grid: 4 }));
  for (let i = 0; i < 4; i++) packet(items, [-3.6, -2.0, -1.0], [6.5, 0.0, 0.5], span(lt, 7.2 + i * 0.28, 8.2 + i * 0.28), C.server, "{ }", "d" + i);
  const tIn = easeOut(span(lt, 7.0, 7.8));
  const filter = lt > 9.4 ? "performance" : "All";
  const tbl = pageTex("tbl", { page: "talks", filter, filterHot: lt > 9.0 && lt < 9.8, rowIn: span(lt, 7.8, 9.0) });
  items.push(quad({ pos: [9.2, 0.6, 2.5], w: SEC.w * PX, h: SEC.h * PX, rot: [0, -0.3, 0], img: tbl, alpha: tIn, glow: C.client, glowA: 0.25 }));
  items.push(label3({ at: [9.2, 5.2, 2.5], text: 'talk-table.tsx · "use client" · useState', color: C.client, size: 24, alpha: smooth(span(lt, 7.6, 8.2)) }));
  items.push(label3({ at: [1.6, -4.2, -1], text: "plain JSON crosses the line", color: C.text, size: 26, alpha: smooth(span(lt, 7.6, 8.0)) * (1 - smooth(span(lt, 9.6, 10.2))) }));
  render(ctx, cam, items);
}

function vote(ctx, s) {
  const { lt, len } = s;
  const cam = camera(lerp3([7.5, 3.6, -19], [-0.2, 2.6, -18.5], smooth(span(lt, 1.8, 3.4))), lerp3([6.5, 0.4, 1], [-0.2, 0.2, 1], smooth(span(lt, 1.8, 3.4))), 56);
  const items = [];
  stage(items, 1);
  const pending = lt > 1.45 && lt < 6.7;
  const done = lt >= 6.7;
  const tbl = pageTex("tbl2", {
    page: "talks", pending, press: lt > 1.3 && lt < 1.6 ? 1 - span(lt, 1.3, 1.6) : 0,
    votes1: done ? 13 : 12, votesHot: done, message: done ? "Thanks. 13 votes now." : null,
  });
  items.push(quad({ pos: [9.2, 0.6, 2.5], w: SEC.w * PX, h: SEC.h * PX, rot: [0, -0.3, 0], img: tbl, glow: C.client, glowA: 0.2 }));
  items.push(label3({ at: [9.2, 5.2, 2.5], text: 'vote-button.tsx · useActionState', color: C.client, size: 24, alpha: smooth(span(lt, 0.4, 1.0)) }));
  const cIn = easeOut(span(lt, 2.0, 3.0));
  const code = codeCard("c-act", {
    title: "talks/actions.ts", tag: '"use server"', tagColor: C.action, w: 1100, size: 28,
    lines: [
      '"use server";',
      "export async function vote(_prev, formData) {",
      '  const id = Number(formData.get("id"));',
      "  const talk = await addVote(id);",
      '  updateTag("talks");',
      "  updateTag(`talk-${id}`);",
      "  return { message: `Thanks. ${talk.votes} votes now.` };",
      "}",
    ],
    hl: lt < 4.2 ? 0 : lt < 5.4 ? 2 + span(lt, 4.2, 5.2) : lt < 6.4 ? 4 + span(lt, 5.6, 6.2) : 6,
  });
  items.push(quad({ pos: [-8.8, 1.6 + (1 - cIn) * 2, 0], w: 11, h: 11 * code.height / code.width, rot: [0, 0.22, 0], img: code, alpha: cIn, grid: 5 }));
  packet(items, [7.5, 2.4, 0.5], [-4.0, 1.5, -1.5], span(lt, 2.6, 4.3), C.action, "ID", "id");
  items.push(label3({ at: [0.6, -3.6, -1], text: "the browser gets an ID, not the code", color: C.action, size: 26, alpha: smooth(span(lt, 3.2, 3.7)) * (1 - smooth(span(lt, 6.2, 6.8))) }));
  // the cache: two tags flash and refresh
  const flash = span(lt, 5.5, 6.4);
  ["talks", "talk-1"].forEach((tag, i) => {
    const glowing = flash > 0 && flash < 1;
    const [c, g] = tex("tag" + i, 256, 256);
    g.fillStyle = (glowing ? C.yellow : C.server) + "40"; g.fillRect(0, 0, 256, 256);
    g.font = `700 50px ${MONO}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(tag, 128, 128);
    items.push(box({ pos: [-12.6 + i * 2.6, -3.7, -1.5], size: [1.9, 1.9, 1.9], rot: [0.25, 0.5 + easeInOut(flash) * Math.PI * 2, 0], color: glowing ? C.yellow : C.server, front: [c], alpha: easeOut(span(lt, 2.6, 3.2)), glow: glowing ? C.yellow : null }));
  });
  items.push(label3({ at: [-11.3, -1.9, -1.5], text: "cached reads", color: C.muted, size: 22, alpha: easeOut(span(lt, 2.8, 3.4)) }));
  packet(items, [-4.0, 1.5, -1.5], [7.5, 2.4, 0.5], span(lt, 6.1, 6.8), C.green, "13", "back");
  render(ctx, cam, items);
  if (lt > 0.6 && lt < 1.9) {
    const p = quad({ pos: [9.2, 0.6, 2.5], w: SEC.w * PX, h: SEC.h * PX, rot: [0, -0.3, 0] }).screenAt(cam, (SEC.w - 100) / SEC.w, 112 / SEC.h);
    if (p) cursor(ctx, p.x + (1 - easeOut(span(lt, 0.6, 1.2))) * 120, p.y + (1 - easeOut(span(lt, 0.6, 1.2))) * 80, span(lt, 1.3, 1.6));
  }
}

function trouble(ctx, s) {
  const { lt, len } = s;
  const focus = [[-17, 0.4, 3.5], [0, 0.4, 0], [17, 0.4, 3.5]];
  const k1 = smooth(span(lt, 3.5, 4.3)), k2 = smooth(span(lt, 5.2, 6.0)), k3 = smooth(span(lt, 7.2, 8.2));
  let tgt = lerp3(focus[0], focus[1], k1); tgt = lerp3(tgt, focus[2], k2); tgt = lerp3(tgt, [0, 0.4, 2.5], k3);
  const dist = lerp(19, 36, k3);
  const yaw = lerp(lerp(0.32, 0, k1), -0.32, k2) * (1 - k3);
  const cam = camera([tgt[0] - Math.sin(yaw) * dist, 2.4 + k3 * 2, tgt[2] - Math.cos(yaw) * dist], tgt, 50);
  const items = [];
  const glow = smooth(span(lt, 7.6, 8.4));
  const arrived = lt > 3.0;
  const wins = [
    { url: "localhost:3000/exercises/8/dashboard/talks/1", page: arrived ? "talk" : "loading", tab: arrived ? "Two graphs, one boundary" : "Dashboard", label: "loading.tsx · placeholder at once", color: C.server },
    { url: "localhost:3000/exercises/8/dashboard/talks/boom", page: "error", tab: "Dashboard", label: 'error.tsx · "use client" · a crash', color: C.red },
    { url: "localhost:3000/exercises/8/dashboard/talks/99", page: "notfound", tab: "No such talk", label: "not-found.tsx · a missing talk", color: C.yellow },
  ];
  wins.forEach((wd, i) => {
    const ry = [0.32, 0, -0.32][i];
    const enter = easeOut(span(lt, 0.2 + i * 0.25, 1.2 + i * 0.25));
    const pos = [focus[i][0], focus[i][1] - (1 - enter) * 3, focus[i][2]];
    const img = dashboard("w" + i, { ...wd, active: "talks", asideGlow: glow, t: lt, note: "Bring snacks for the speakers" });
    items.push(quad({ pos, w: 16, h: 10, rot: [0, ry, 0], img, alpha: enter, glow: wd.color, glowA: 0.22 }));
    items.push(label3({ at: [pos[0], pos[1] + 6.1, pos[2]], text: wd.label, color: wd.color, size: lerp(26, 30, k3), alpha: enter }));
  });
  render(ctx, cam, items);
  pill(ctx, W / 2, 230, "The talk arrives about 1.7 s later", { size: 26, color: C.muted, alpha: smooth(span(lt, 1.8, 2.2)) * (1 - smooth(span(lt, 3.0, 3.4))) });
  pill(ctx, W / 2, 200, "The layout and sidebar stay in every case", { size: 30, color: C.green, alpha: glow });
}

function api(ctx, s) {
  const { lt, len } = s;
  const cam = camera([lerp(-2.5, 1, easeInOut(lt / len)), 2.2, -18], [0, 0.4, 0], 54);
  const items = [];
  const tabs = [
    { title: "Dashboard", url: "…/exercises/8/dashboard", tag: "metadata", color: C.server },
    { title: "Talks", url: "…/exercises/8/dashboard/talks", tag: "metadata", color: C.server },
    { title: "Two graphs, one boundary", url: "…/exercises/8/dashboard/talks/1", tag: "generateMetadata", color: C.action },
  ];
  tabs.forEach((tb, i) => {
    const a = back(span(lt, 0.9 + i * 0.45, 1.6 + i * 0.45));
    const img = tabStrip("tab" + i, { title: tb.title, url: tb.url, hot: i === 2 });
    const pos = [-8.2, 4.4 - i * 3.4, i * 0.4];
    items.push(quad({ pos, w: 9.2, h: 9.2 * 150 / 760, rot: [0, 0.3, 0], img, alpha: clamp(a), grid: 4 }));
    items.push(label3({ at: [pos[0] - 1.6, pos[1] - 1.55, pos[2]], text: tb.tag, color: tb.color, size: 24, alpha: clamp(a), mono: true }));
  });
  const entries = [
    { cmd: "curl -i localhost:3000/exercises/8/dashboard/api/talks" },
    { out: '200  [{"id":1,"title":"Two graphs, one boundary",…}]', color: C.green },
    { cmd: "curl -i …/dashboard/api/talks?category=xyz" },
    { out: '400  {"error":"Unknown category: xyz"}', color: C.red },
  ];
  const typed = span(lt, 3.1, 6.2) * termLength(entries);
  const term = terminal("t-api", { title: "route.ts · export async function GET", entries, chars: typed, w: 1080, size: 27, t: lt });
  const tin = easeOut(span(lt, 2.8, 3.5));
  items.push(quad({ pos: [5.6, 0.2 - (1 - tin) * 2, 0], w: 12.4, h: 11.6 * term.height / term.width, rot: [0, -0.26, 0], img: term, alpha: tin, grid: 5, glow: C.green, glowA: 0.18 }));
  items.push(label3({ at: [5.6, 3.9, 0], text: "route.ts answers a program, not a person", color: C.green, size: 24, alpha: smooth(span(lt, 3.3, 3.8)) }));
  render(ctx, cam, items);
}

// the client provider box with the server pages inside it as children
function childrenBox(key, k) {
  const w = 1000, h = 330;
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "rgba(255,160,74,0.08)"; g.fill();
  g.strokeStyle = C.client; g.lineWidth = 4; g.stroke();
  g.textBaseline = "middle";
  g.font = `600 26px ${MONO}`; g.fillStyle = C.client; g.fillText('ThemeProvider · "use client"', 30, 38);
  g.font = `500 24px ${MONO}`; g.fillStyle = C.muted; g.fillText("{children}", w - 30 - g.measureText("{children}").width, 38);
  [["Overview", "dashboard/page.tsx"], ["Talks", "talks/page.tsx"], ["One talk", "[id]/page.tsx"]].forEach(([t, f], i) => {
    const a = back(span(k, i * 0.22, i * 0.22 + 0.5));
    const x = 30 + i * 322, y = 82 + (1 - clamp(a)) * -50;
    g.globalAlpha = clamp(a);
    rr(g, x, y, 294, 150, 16); g.fillStyle = C.server + "30"; g.fill(); g.strokeStyle = C.server; g.lineWidth = 3; g.stroke();
    g.font = `700 32px ${UI}`; g.fillStyle = C.text; g.fillText(t, x + 22, y + 48);
    g.font = `400 21px ${MONO}`; g.fillStyle = C.muted; g.fillText(f, x + 22, y + 90);
    g.font = `600 19px ${UI}`; g.fillStyle = C.server; g.fillText("Server Component", x + 22, y + 124);
    g.globalAlpha = 1;
  });
  g.globalAlpha = smooth(span(k, 0.6, 1));
  g.font = `500 24px ${UI}`; g.fillStyle = C.text; g.textAlign = "center";
  g.fillText("The pages arrive already rendered on the server. The provider does not import them.", w / 2, 280);
  g.textAlign = "left"; g.globalAlpha = 1;
  return c;
}

function theme(ctx, s) {
  const { lt, len } = s;
  const cam = camera([lerp(-1.4, 1.0, easeInOut(lt / len)), 2.0, -21], [0, 0.5, 0], 50);
  const items = [];
  // dark -> light on click, then the reload: dark for a moment, then light again
  let light = smooth(span(lt, 3.5, 4.2));
  if (lt > 7.2) light = lt < 7.35 ? 1 - span(lt, 7.2, 7.35) : lt < 8.5 ? 0 : span(lt, 8.5, 8.65);
  const hot = lt > 2.5 && lt < 3.7;
  const dash = dashboard("theme", { page: "overview", active: "overview", speakersOpen: true, light, toggleHot: hot, note: "Bring snacks for the speakers" });
  const dw = 13, dh = dw * DH / DW, dpos = [6.6, 0.3, 0.5], drot = [0.02, -0.25, 0];
  const dIn = easeOut(span(lt, 0.2, 1.1));
  items.push(quad({ pos: [dpos[0] + (1 - dIn) * 6, dpos[1], dpos[2]], w: dw, h: dh, rot: drot, img: dash, alpha: dIn, glow: lt < 3.8 ? C.server : C.client, glowA: 0.2 }));
  items.push(label3({ at: [dpos[0], dpos[1] + dh / 2 + 0.8, dpos[2]], text: "layout.tsx · stays a Server Component", color: C.server, size: 24, alpha: smooth(span(lt, 0.8, 1.4)) }));
  // label for the toggle button, below the sidebar
  const sc = dw / DW;
  const tb = [dpos[0], dpos[1], dpos[2]].map((v, i) => v + rotate([-dw / 2 - 2.35, (DH / 2 - 516) * sc, 0], drot)[i]);
  items.push(label3({ at: tb, text: 'ThemeToggle · "use client" →', color: C.client, size: 22, alpha: smooth(span(lt, 2.2, 2.8)) }));
  // code
  const code = codeCard("c-theme", {
    title: "theme-provider.tsx", tag: '"use client"', tagColor: C.client, w: 1100, size: 26,
    lines: [
      '"use client";',
      "const ThemeContext = createContext(…);",
      'const [theme, setTheme] = useState("dark");',
      "useEffect(() => {",
      '  const saved = localStorage.getItem("exercise-8-theme");',
      "  if (saved) setTheme(saved);",
      "}, []);",
      "<div data-theme={theme}>{children}</div>",
    ],
    hl: lt < 1.8 ? 0 : lt < 2.7 ? 1 : lt < 4.2 ? 2 : lt < 6.7 ? 7 : lt < 8.3 ? 4 : 4 + span(lt, 8.3, 9.0),
    reveal: span(lt, 0.4, 2.6) * 8,
  });
  const cIn = easeOut(span(lt, 0.2, 1.1));
  items.push(quad({ pos: [-10.2, 3.2 + (1 - cIn) * 2, 0], w: 10.8, h: 10.8 * code.height / code.width, rot: [0, 0.22, 0], img: code, alpha: cIn, grid: 5 }));
  // the server pages inside the client box
  const kb = span(lt, 4.3, 6.2);
  const dg = childrenBox("c-children", kb);
  const gIn = easeOut(span(lt, 4.2, 5.0));
  items.push(quad({ pos: [-10.2, -2.9 - (1 - gIn), 0], w: 10.4, h: 10.4 * dg.height / dg.width, rot: [0, 0.22, 0], img: dg, alpha: gIn, grid: 4 }));
  // reload moment
  items.push(label3({ at: [dpos[0], dpos[1] - dh / 2 - 0.8, dpos[2]], text: "Reload: the first frame is dark", color: C.yellow, size: 26, alpha: smooth(span(lt, 7.2, 7.5)) * (1 - smooth(span(lt, 8.4, 8.6))) }));
  items.push(label3({ at: [dpos[0], dpos[1] - dh / 2 - 0.8, dpos[2]], text: "Then the effect loads light", color: C.green, size: 26, alpha: smooth(span(lt, 8.6, 8.9)) }));
  render(ctx, cam, items);
  if (lt > 2.7 && lt < 3.7) {
    const p = quad({ pos: dpos, w: dw, h: dh, rot: drot }).screenAt(cam, 154 / DW, 516 / DH);
    if (p) { const e = 1 - easeOut(span(lt, 2.7, 3.3)); cursor(ctx, p.x + e * 140, p.y + e * 90, span(lt, 3.35, 3.6)); }
  }
}

function outro(ctx, s) {
  const { lt, len } = s;
  const cam = camera([Math.sin(lt * 0.12) * 4, 2.2, -21], [0, 0.6, 0], 50);
  const items = [];
  const skip = new Set([4, 6, 9, 10, 11]);
  const sk = smooth(span(lt, 0.9, 1.6)) * (1 - smooth(span(lt, 3.8, 4.6)));
  const endK = smooth(span(lt, 7.0, 8.0));
  TASKS.forEach((tk, i) => {
    const a = back(span(lt, 0.0 + i * 0.07, 0.8 + i * 0.07));
    const col = i % 6, row = Math.floor(i / 6);
    const isSkip = skip.has(tk.n);
    const home = [(col - 2.5) * 3.6, 3.2 - row * 3.6 + (isSkip ? sk * 0.7 : 0), isSkip ? sk * 3.2 : 0];
    const scattered = [(col - 2.5) * 9, 12 - row * 20, 20];
    let pos = lerp3(scattered, home, clamp(a));
    pos = lerp3(pos, [pos[0] * 1.2, pos[1] + 2.6, pos[2] + 10], endK);
    const doneK = clamp(span(lt, 4.0 + i * 0.12, 4.3 + i * 0.12));
    const sz = 2.6 * clamp(a);
    items.push(box({
      pos, size: [sz, sz, sz], rot: [0.15 + Math.sin(lt * 0.8 + i) * 0.08, Math.sin(lt * 0.6 + i * 0.7) * 0.35, 0],
      color: tk.color, alpha: (isSkip ? 1 - sk * 0.6 : 1) * (1 - endK * 0.5),
      front: cubeFace("oc" + i, { n: tk.n, label: tk.label, color: tk.color, done: doneK }),
    }));
  });
  render(ctx, cam, items);
  pill(ctx, W / 2, 175, "Short on time? Tasks 4, 6, 9, 10 and 11 are optional", { size: 28, color: C.yellow, alpha: sk });
  const fa = smooth(span(lt, 3.7, 4.3)) * (1 - smooth(span(lt, 6.5, 7.0)));
  pill(ctx, W / 2, 175, "Done? Compare with solution/dashboard/", { size: 28, color: C.green, alpha: fa });
  pill(ctx, W / 2, 245, "localhost:3000/exercises/8/solution", { size: 24, color: C.text, alpha: fa, mono: true });
  // end card
  if (endK > 0) {
    ctx.save();
    ctx.globalAlpha = endK;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.font = `800 96px ${UI}`; ctx.fillStyle = C.text; ctx.fillText("Exercise 8", W / 2, 640);
    ctx.font = `400 38px ${UI}`; ctx.fillStyle = C.muted; ctx.fillText("Open localhost:3000/exercises/8 and start with Task 1", W / 2, 706);
    ctx.restore();
  }
}

export const scenes = { intro, router, layout: layoutScene, data, vote, trouble, api, theme, outro };

// 2D widgets drawn into textures: browser chrome, code cards, terminals, file rows.
import { C, UI, MONO, rr, tex, clamp } from "./engine.mjs";

export function chrome(g, w, h, { url, tab, accent = C.server }) {
  rr(g, 0, 0, w, h, 26);
  g.fillStyle = C.panel; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0a1124"; g.fillRect(0, 0, w, 96);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(34 + i * 26, 30, 8, 0, 7); g.fill(); });
  // tab
  rr(g, 120, 12, 340, 40, 10); g.fillStyle = C.panel; g.fill();
  g.fillStyle = accent; g.beginPath(); g.arc(142, 32, 7, 0, 7); g.fill();
  g.font = `500 20px ${UI}`; g.fillStyle = C.text; g.textBaseline = "middle";
  g.fillText(fit(g, tab, 280), 160, 33);
  // url bar
  rr(g, 24, 58, w - 48, 30, 15); g.fillStyle = "#131c36"; g.fill();
  g.font = `400 18px ${MONO}`; g.fillStyle = C.muted;
  g.fillText(fit(g, url, w - 100), 44, 74);
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 25); g.stroke();
  return 96;
}

export function fit(g, s, max) {
  if (g.measureText(s).width <= max) return s;
  while (s.length > 1 && g.measureText(s + "…").width > max) s = s.slice(0, -1);
  return s + "…";
}

const KW = /^(export|default|async|function|const|await|return|import|from|if|throw|new|type|let)$/;
export function codeLine(g, line, x, y, size = 22) {
  g.font = `400 ${size}px ${MONO}`;
  const re = /("[^"]*"?|`[^`]*`?|'[^']*'?|\/\/.*$|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|\s+|.)/g;
  let m, cx = x;
  while ((m = re.exec(line))) {
    const s = m[0];
    let col = C.text;
    if (/^["'`]/.test(s)) col = "#9ee6a8";
    else if (s.startsWith("//")) col = "#6b789a";
    else if (KW.test(s)) col = "#c792ea";
    else if (/^\d/.test(s)) col = "#f78c6c";
    else if (/^[A-Za-z_$]/.test(s) && line[re.lastIndex] === "(") col = "#82aaff";
    else if (/^[A-Z]/.test(s)) col = "#ffcb6b";
    g.fillStyle = col;
    g.fillText(s, cx, y);
    cx += g.measureText(s).width;
  }
}

// A code card. hl: index of the highlighted line (fractional allowed for fade), reveal: lines shown.
export function codeCard(key, { title, tag, tagColor = C.server, lines, w = 980, size = 24, hl = -1, reveal = 999, accent = tagColor }) {
  const lh = size * 1.55;
  const h = Math.round(96 + lines.length * lh + 30);
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#0b1226"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0f1830"; g.fillRect(0, 0, w, 70);
  g.fillStyle = accent; g.fillRect(0, 0, 8, h);
  g.font = `600 26px ${MONO}`; g.fillStyle = C.text; g.textBaseline = "middle";
  g.fillText(title, 34, 36);
  if (tag) {
    g.font = `600 20px ${MONO}`;
    const tw = g.measureText(tag).width + 28;
    rr(g, w - tw - 24, 18, tw, 36, 18); g.fillStyle = tagColor + "33"; g.fill();
    g.strokeStyle = tagColor; g.lineWidth = 2; g.stroke();
    g.fillStyle = tagColor; g.fillText(tag, w - tw - 10, 37);
  }
  lines.forEach((ln, i) => {
    const y = 96 + i * lh + lh / 2;
    const vis = clamp(reveal - i);
    if (vis <= 0) return;
    const k = clamp(1 - Math.abs(hl - i));
    if (k > 0) { g.fillStyle = `rgba(255,209,102,${0.16 * k})`; g.fillRect(8, y - lh / 2, w, lh); g.fillStyle = `rgba(255,209,102,${0.9 * k})`; g.fillRect(8, y - lh / 2, 5, lh); }
    g.globalAlpha = vis;
    codeLine(g, ln, 34, y, size);
    g.globalAlpha = 1;
  });
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 21); g.stroke();
  return c;
}

// A terminal. Each entry: { cmd } or { out, color }. chars: how many characters are typed so far.
export function terminal(key, { title = "Terminal", entries, chars, w = 980, size = 24, cursor = true, t = 0 }) {
  const lh = size * 1.6;
  const h = Math.round(84 + entries.length * lh + 26);
  const [c, g] = tex(key, w, h);
  rr(g, 0, 0, w, h, 22); g.fillStyle = "#070c1a"; g.fill();
  g.save(); g.clip();
  g.fillStyle = "#0e1529"; g.fillRect(0, 0, w, 58);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(30 + i * 24, 29, 7, 0, 7); g.fill(); });
  g.font = `500 20px ${UI}`; g.fillStyle = C.muted; g.textBaseline = "middle"; g.fillText(title, 112, 30);
  let left = chars;
  let lastX = 30, lastY = 84 + lh / 2;
  entries.forEach((e, i) => {
    if (left <= 0) return;
    const y = 84 + i * lh + lh / 2;
    const full = e.cmd != null ? "$ " + e.cmd : e.out;
    const shown = e.cmd != null ? full.slice(0, Math.floor(left)) : full;
    left -= e.cmd != null ? full.length : 12; // output lines appear in one go, after a short pause
    if (e.cmd == null && left < 0) return;
    g.font = `400 ${size}px ${MONO}`;
    if (e.cmd != null) {
      g.fillStyle = C.green; g.fillText(shown.slice(0, 2), 30, y);
      codeLine(g, shown.slice(2), 30 + g.measureText("$ ").width, y, size);
      g.font = `400 ${size}px ${MONO}`;
      lastX = 30 + g.measureText(shown).width; lastY = y;
    } else {
      g.fillStyle = e.color ?? C.muted; g.fillText(fit(g, shown, w - 60), 30, y);
      lastX = 30; lastY = y + lh;
    }
  });
  if (cursor && Math.floor(t * 2.2) % 2 === 0) { g.fillStyle = C.text; g.fillRect(lastX + 2, lastY - size * 0.55, size * 0.55, size * 1.1); }
  g.restore();
  g.strokeStyle = C.line; g.lineWidth = 3; rr(g, 1.5, 1.5, w - 3, h - 3, 21); g.stroke();
  return c;
}

export function termLength(entries) {
  return entries.reduce((s, e) => s + (e.cmd != null ? e.cmd.length + 2 : 12), 0);
}

// The number face for a task cube.
export function cubeFace(key, { n, label, color, done = 0 }) {
  const [c, g] = tex(key, 256, 256);
  g.fillStyle = color + "22"; g.fillRect(0, 0, 256, 256);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `700 112px ${UI}`; g.fillStyle = "#ffffff"; g.fillText(String(n), 128, label ? 108 : 128);
  if (label) { g.font = `600 30px ${UI}`; g.fillStyle = "rgba(255,255,255,0.85)"; g.fillText(label, 128, 196); }
  if (done > 0) {
    g.globalAlpha = done;
    g.fillStyle = C.green; g.beginPath(); g.arc(214, 42, 26, 0, 7); g.fill();
    g.strokeStyle = "#062b1c"; g.lineWidth = 7; g.lineCap = "round";
    g.beginPath(); g.moveTo(201, 43); g.lineTo(211, 53); g.lineTo(228, 33); g.stroke();
  }
  return [c];
}

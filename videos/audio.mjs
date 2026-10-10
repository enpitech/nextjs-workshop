// Builds the soundtrack: one TTS clip per narration beat, a synthesized lofi loop,
// and a mix with the music ducked under the voice. Writes out/<name>/audio.wav and timeline.json.
// Usage: node audio.mjs exercise-8
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const here = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] ?? "exercise-8";
const cfg = JSON.parse(fs.readFileSync(path.join(here, name, "narration.json"), "utf8"));
const out = path.join(here, "out", name);
fs.mkdirSync(out, { recursive: true });

const SR = 48000;

// ---------- voice ----------
function readPcm(file) {
  const buf = execFileSync(ffmpeg, ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], {
    maxBuffer: 1 << 28,
  });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4).slice();
}

// "engine": "kokoro" in narration.json uses the local voice (kokoro_tts.py) instead of edge-tts.
const kokoro = cfg.engine === "kokoro";
if (kokoro) {
  execFileSync("python", ["-I", path.join(here, "kokoro_tts.py"), path.join(here, name, "narration.json"), out, ...(process.env.FORCE_TTS ? ["force"] : [])], { stdio: "inherit" });
}

const clips = [];
for (const beat of cfg.beats) {
  const mp3 = path.join(out, kokoro ? `${beat.id}.wav` : `${beat.id}.mp3`);
  const vtt = path.join(out, `${beat.id}.vtt`);
  if (!kokoro && (!fs.existsSync(mp3) || process.env.FORCE_TTS)) {
    execFileSync("python", ["-m", "edge_tts", "--voice", cfg.voice, `--rate=${cfg.rate}`, "--text", beat.text, "--write-media", mp3, "--write-subtitles", vtt], {
      env: { ...process.env, PYTHONPATH: path.join(here, "pylib") },
      stdio: "inherit",
    });
  }
  let pcm = readPcm(mp3);
  // trim leading and trailing silence so the gaps are ours
  const thr = 0.004;
  let a = 0, b = pcm.length - 1;
  while (a < b && Math.abs(pcm[a]) < thr) a++;
  while (b > a && Math.abs(pcm[b]) < thr) b--;
  const cut = Math.max(0, a - 480);
  pcm = pcm.slice(cut, Math.min(pcm.length, b + 2400));
  // sentence times (seconds from the start of the trimmed clip), so a scene can follow the speech
  const sentences = [];
  if (kokoro) {
    for (const st of JSON.parse(fs.readFileSync(path.join(out, `${beat.id}.sent.json`), "utf8"))) {
      sentences.push({ text: st.text, start: +Math.max(0, st.start - cut / SR).toFixed(3), end: +(st.end - cut / SR).toFixed(3) });
    }
  } else if (fs.existsSync(vtt)) {
    const ts = (x) => { const [h, m, r] = x.split(":"); return +h * 3600 + +m * 60 + +r.replace(",", "."); };
    for (const blk of fs.readFileSync(vtt, "utf8").split(/\r?\n\r?\n/)) {
      const m = blk.match(/(\d+:\d+:\d+,\d+) --> (\d+:\d+:\d+,\d+)\r?\n([\s\S]+)/);
      if (m) sentences.push({ text: m[3].trim(), start: +Math.max(0, ts(m[1]) - cut / SR).toFixed(3), end: +(ts(m[2]) - cut / SR).toFixed(3) });
    }
  }
  clips.push({ ...beat, pcm, sentences });
}

let t = cfg.lead;
const timeline = { beats: [] };
for (const c of clips) {
  const dur = c.pcm.length / SR;
  timeline.beats.push({ id: c.id, caption: c.caption ?? c.text, start: +t.toFixed(3), end: +(t + dur).toFixed(3), ...(c.sentences.length ? { sentences: c.sentences } : {}) });
  c.start = t;
  t += dur + cfg.gap;
}
const total = t - cfg.gap + cfg.tail;
timeline.duration = +total.toFixed(3);
console.log("duration", timeline.duration.toFixed(2), "s");
if (total > 80 && !cfg.long) console.warn("WARNING: longer than 80 s");
fs.writeFileSync(path.join(out, "timeline.json"), JSON.stringify(timeline, null, 2));

const N = Math.ceil(total * SR);
const voice = new Float32Array(N);
for (const c of clips) {
  const o = Math.round(c.start * SR);
  for (let i = 0; i < c.pcm.length && o + i < N; i++) voice[o + i] += c.pcm[i];
}

// ---------- lofi music ----------
// Deterministic PRNG so every render sounds the same.
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const L = new Float32Array(N), R = new Float32Array(N);
const BPM = 76;
const beatS = 60 / BPM;
const barS = beatS * 4;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
// ii7 - V7 - Imaj7 - vi7 in F: Gm7, C9, Fmaj7, Dm9 (voicings in MIDI)
const chords = [
  { root: 43, notes: [58, 62, 65, 69] },
  { root: 48, notes: [58, 62, 64, 67] },
  { root: 41, notes: [57, 60, 64, 67] },
  { root: 38, notes: [57, 60, 64, 65] },
];

function addNote(freq, start, dur, amp, pan, kind) {
  const s0 = Math.floor(start * SR);
  const len = Math.floor((dur + 1.2) * SR);
  const det = 1 + (rnd() - 0.5) * 0.004;
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= N) continue;
    const tt = i / SR;
    let env;
    if (kind === "keys") {
      const att = Math.min(1, tt / 0.012);
      env = att * Math.exp(-tt * 1.6) * (tt < dur ? 1 : Math.exp(-(tt - dur) * 6));
    } else {
      const att = Math.min(1, tt / 0.03);
      env = att * Math.exp(-tt * 0.9) * (tt < dur ? 1 : Math.exp(-(tt - dur) * 8));
    }
    // electric-piano-ish: sine + soft 2nd partial + slow tremolo + tape wow
    const wow = 1 + 0.0025 * Math.sin(2 * Math.PI * 0.6 * (start + tt));
    const ph = 2 * Math.PI * freq * det * wow * tt;
    let v = kind === "keys"
      ? Math.sin(ph + 0.6 * Math.sin(2 * ph) * Math.exp(-tt * 4)) + 0.18 * Math.sin(2 * ph)
      : Math.sin(ph) + 0.25 * Math.sin(2 * ph) * Math.exp(-tt * 3);
    v *= env * amp * (kind === "keys" ? 1 + 0.12 * Math.sin(2 * Math.PI * 4.2 * tt) : 1);
    L[idx] += v * (1 - pan) ;
    R[idx] += v * (1 + pan);
  }
}

function addKick(start) {
  const s0 = Math.floor(start * SR);
  let ph = 0;
  for (let i = 0; i < SR * 0.45; i++) {
    const idx = s0 + i; if (idx >= N) break;
    const tt = i / SR;
    const f = 48 + 90 * Math.exp(-tt * 28);
    ph += (2 * Math.PI * f) / SR;
    const v = Math.sin(ph) * Math.exp(-tt * 7) * 0.55;
    L[idx] += v; R[idx] += v;
  }
}
function addNoiseHit(start, dur, amp, tone, pan) {
  const s0 = Math.floor(start * SR);
  let lp = 0, hp = 0, prev = 0;
  for (let i = 0; i < SR * dur; i++) {
    const idx = s0 + i; if (idx >= N) break;
    const tt = i / SR;
    const n = rnd() * 2 - 1;
    lp += tone * (n - lp);
    hp = lp - prev; prev = lp;
    const v = (tone > 0.5 ? hp : lp) * Math.exp(-tt * (tone > 0.5 ? 60 : 18)) * amp;
    L[idx] += v * (1 - pan); R[idx] += v * (1 + pan);
  }
}

const swing = beatS * 0.09;
for (let bar = 0; bar * barS < total; bar++) {
  const b0 = bar * barS;
  const ch = chords[bar % 4];
  // chord: slightly strummed, held for the bar
  ch.notes.forEach((m, k) => addNote(midi(m), b0 + k * 0.022 + 0.01, barS * 0.92, 0.055, (k - 1.5) * 0.25, "keys"));
  // little melody on beat 3 "and" on some bars
  if (bar % 2 === 1) addNote(midi(ch.notes[3] + 12), b0 + beatS * 2.5 + swing, beatS, 0.03, 0.3, "keys");
  // bass
  addNote(midi(ch.root), b0, beatS * 1.6, 0.16, 0, "bass");
  addNote(midi(ch.root + 7), b0 + beatS * 2.5 + swing, beatS * 0.9, 0.12, 0, "bass");
  // drums: kick 1 and 3-and, snare 2 and 4, swung hats
  addKick(b0);
  addKick(b0 + beatS * 2.5 + swing);
  addNoiseHit(b0 + beatS, 0.25, 0.22, 0.25, 0.05);
  addNoiseHit(b0 + beatS * 3, 0.25, 0.22, 0.25, 0.05);
  for (let h = 0; h < 8; h++) addNoiseHit(b0 + h * beatS / 2 + (h % 2 ? swing : 0), 0.06, h % 2 ? 0.05 : 0.08, 0.9, -0.3);
}

// vinyl: hiss + sparse crackle
for (let i = 0; i < N; i++) {
  const hiss = (rnd() * 2 - 1) * 0.004;
  const pop = rnd() < 0.00012 ? (rnd() * 2 - 1) * 0.12 : 0;
  L[i] += hiss + pop; R[i] += hiss + pop * 0.7;
}

// warm it: one-pole low-pass (~2.4 kHz) on the music
const a = 1 - Math.exp((-2 * Math.PI * 2400) / SR);
let zl = 0, zr = 0;
for (let i = 0; i < N; i++) { zl += a * (L[i] - zl); zr += a * (R[i] - zr); L[i] = zl; R[i] = zr; }

// ---------- mix ----------
// envelope follower on the voice for ducking
const env = new Float32Array(N);
let e = 0;
const atk = Math.exp(-1 / (0.02 * SR)), rel = Math.exp(-1 / (0.5 * SR));
for (let i = 0; i < N; i++) {
  const x = Math.abs(voice[i]);
  e = x > e ? atk * e + (1 - atk) * x : rel * e + (1 - rel) * x;
  env[i] = e;
}
let peakM = 0;
for (let i = 0; i < N; i++) peakM = Math.max(peakM, Math.abs(L[i]), Math.abs(R[i]));
const musicGain = 0.22 / peakM; // low background level
const fadeIn = 1.5 * SR, fadeOut = 2.2 * SR;
const outL = new Float32Array(N), outR = new Float32Array(N);
let peakV = 0;
for (let i = 0; i < N; i++) peakV = Math.max(peakV, Math.abs(voice[i]));
const voiceGain = 0.85 / peakV;
for (let i = 0; i < N; i++) {
  const duck = 1 - 0.45 * Math.min(1, env[i] * 8);
  const fade = Math.min(1, i / fadeIn, (N - i) / fadeOut);
  const m = musicGain * duck * fade;
  const v = voice[i] * voiceGain;
  outL[i] = Math.tanh(v + L[i] * m);
  outR[i] = Math.tanh(v + R[i] * m);
}

// write 16-bit stereo WAV
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i])) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i])) * 32767), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write("WAVE", 8);
hdr.write("fmt ", 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write("data", 36); hdr.writeUInt32LE(data.length, 40);
fs.writeFileSync(path.join(out, "audio.wav"), Buffer.concat([hdr, data]));
console.log("wrote", path.join(out, "audio.wav"));

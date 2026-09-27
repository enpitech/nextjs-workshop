// Machine paths carry a user name and a home folder. Replace them with short tokens before a file goes public.
// Every pattern comes from the machine that runs the script, so this file holds no path of its own.
// Usage as a script: node scripts/scrub-paths.mjs <file> [...files]   (rewrites each file in place)
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// A path separator as it appears in raw text, in JSON, or in JSON inside JSON: / \ \\ \\\\
const SEP = String.raw`(?:\\{1,4}|/)`;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Turn a real Windows path into a pattern that matches it in any of those forms,
// with the drive as Windows writes it (C:) or as Git Bash writes it (/c).
const pathPattern = (p) => {
  const segments = p.split(/[\\/]+/);
  const letter = segments.shift()[0];
  return `(?:${letter}:|/${letter.toLowerCase()})${SEP}${segments.map(esc).join(SEP)}`;
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Claude Code names the scratch folder after the repo root, one dash per non-alphanumeric character.
const scratchRoot = resolve(tmpdir(), "claude", repoRoot.replace(/[^a-zA-Z0-9]/g, "-"));

const scratchRe = new RegExp(`${pathPattern(scratchRoot)}(?:${SEP}[0-9a-f-]*)?(?:${SEP}scratchpad)?`, "g");
const repoRe = new RegExp(pathPattern(repoRoot), "g");
// Last resort for the bare user name, for example in `ls -l` output.
const userRe = new RegExp(`\\b${esc(userInfo().username)}\\b`, "g");

export const scrub = (text) => text.replace(scratchRe, "<scratch>").replace(repoRe, "<repo>").replace(userRe, "<user>");

if (process.argv[1] && process.argv[1].endsWith("scrub-paths.mjs")) {
  for (const file of process.argv.slice(2)) {
    const before = readFileSync(file, "utf8");
    const after = scrub(before);
    if (after !== before) writeFileSync(file, after);
    console.log(`${file}: ${(before.match(userRe) || []).length} -> ${(after.match(userRe) || []).length} occurrences of the user name`);
  }
}

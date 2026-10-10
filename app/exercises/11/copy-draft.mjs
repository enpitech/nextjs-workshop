// Exercise 11, Setup. Copies the planted draft into your work folder, without the .txt ending.
// The draft is stored as .txt files so that the repo still builds. Run: node app/exercises/11/copy-draft.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

for (const folder of ["speakers"]) {
  const to = join(here, folder);
  if (existsSync(to)) {
    console.log(`app/exercises/11/${folder}/ already exists. Delete it to start again.`);
    continue;
  }
  mkdirSync(to);
  for (const name of readdirSync(join(here, "draft", folder))) {
    copyFileSync(join(here, "draft", folder, name), join(to, name.replace(/\.txt$/, "")));
    console.log(`app/exercises/11/${folder}/${name.replace(/\.txt$/, "")}`);
  }
}

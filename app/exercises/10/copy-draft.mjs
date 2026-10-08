// Exercise 10, Setup. Copies the planted draft into your work folders, without the .txt ending.
// The draft is stored as .txt files so that the repo still builds. Run: node app/exercises/10/copy-draft.mjs
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

for (const folder of ["top", "eve"]) {
  const to = join(here, folder);
  if (existsSync(to)) {
    console.log(`app/exercises/10/${folder}/ already exists. Delete it to start again.`);
    continue;
  }
  mkdirSync(to);
  for (const name of readdirSync(join(here, "draft", folder))) {
    copyFileSync(join(here, "draft", folder, name), join(to, name.replace(/\.txt$/, "")));
    console.log(`app/exercises/10/${folder}/${name.replace(/\.txt$/, "")}`);
  }
}

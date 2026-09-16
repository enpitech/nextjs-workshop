// Restore db.json from the seed file. Run with: npm run reset
import { copyFileSync } from "node:fs";

copyFileSync("db.seed.json", "db.json");
console.log("db.json restored from db.seed.json");

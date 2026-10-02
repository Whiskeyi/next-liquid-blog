import fs from "node:fs";
import path from "node:path";
import { validateTranslationPair, writeTranslationSnapshot } from "./post-translations.mjs";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const sync = args.includes("--sync");
const slugIndex = args.indexOf("--slug");
const slug = slugIndex >= 0 ? args[slugIndex + 1] : undefined;

if (sync && (!slug || !/^[a-zA-Z0-9-]+$/.test(slug))) {
  console.error("After reviewing both languages, run: pnpm sync:translations --slug <article-slug>");
  process.exit(1);
}

const directories = sync
  ? [path.join(postsDirectory, slug)]
  : fs.readdirSync(postsDirectory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(postsDirectory, entry.name));

let failed = false;
let pairs = 0;
for (const directory of directories) {
  if (!fs.existsSync(path.join(directory, "index.md"))) {
    if (sync) { console.error(`Article not found: ${slug}`); failed = true; }
    continue;
  }
  if (!fs.existsSync(path.join(directory, "index.en.md"))) {
    console.error(`English version missing: ${path.basename(directory)}. Create index.en.md alongside index.md.`);
    failed = true;
    continue;
  }
  pairs += 1;
  const errors = validateTranslationPair(directory, { checkSnapshot: !sync });
  if (errors.length) {
    failed = true;
    console.error(`${path.basename(directory)}:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  } else if (sync) {
    writeTranslationSnapshot(directory);
    console.log(`Recorded bilingual review: ${slug}`);
  }
}
if (failed) process.exit(1);
if (!sync) console.log(`Translation checks passed for ${pairs} bilingual articles.`);

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";

export const translationFiles = ["index.md", "index.en.md"];
const sharedFields = ["date", "tags", "categories", "header-img"];

function digest(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function writeTranslationSnapshot(directory) {
  const files = Object.fromEntries(translationFiles.map((name) => [name, digest(path.join(directory, name))]));
  fs.writeFileSync(path.join(directory, "translations.json"), `${JSON.stringify({ version: 1, files }, null, 2)}\n`);
}

function normalize(value) {
  return JSON.stringify(value instanceof Date ? value.toISOString() : value);
}

function headingLevels(content) {
  const levels = [];
  let fence = null;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const match = /^(\x60{3,}|~{3,})/.exec(trimmed);
    if (match) {
      if (!fence) fence = match[1][0];
      else if (fence === match[1][0]) fence = null;
      continue;
    }
    if (fence) continue;
    const heading = /^(#{1,6})\s+/.exec(trimmed);
    if (heading) levels.push(heading[1].length);
  }
  return levels;
}

export function validateTranslationPair(directory, { checkSnapshot = true } = {}) {
  const englishPath = path.join(directory, "index.en.md");
  if (!fs.existsSync(englishPath)) return ["English version missing. Create and review index.en.md alongside index.md."];
  const errors = [];
  const original = matter(fs.readFileSync(path.join(directory, "index.md"), "utf8"));
  const english = matter(fs.readFileSync(englishPath, "utf8"));
  const status = english.data["translation-status"];
  if (status !== "draft" && status !== "published") errors.push("English translation-status must be draft or published.");

  for (const field of sharedFields) {
    if (english.data[field] !== undefined && normalize(english.data[field]) !== normalize(original.data[field])) {
      errors.push(`Shared field ${field} differs between languages.`);
    }
  }

  if (status === "published") {
    if (!english.data.title || !english.content.trim()) errors.push("Published English articles require a title and body.");
    if (normalize(headingLevels(original.content)) !== normalize(headingLevels(english.content))) {
      errors.push("Heading levels/order differ; keep the two versions aligned.");
    }
  }

  if (checkSnapshot) {
    try {
      const snapshot = JSON.parse(fs.readFileSync(path.join(directory, "translations.json"), "utf8"));
      if (snapshot.version !== 1) errors.push("Unsupported translation snapshot version.");
      for (const name of translationFiles) {
        if (snapshot.files?.[name] !== digest(path.join(directory, name))) {
          errors.push(`${name} changed. Review/update both versions, then run sync:translations --slug ${path.basename(directory)}.`);
        }
      }
    } catch {
      errors.push("Missing or invalid translations.json. Review both versions and run sync:translations.");
    }
  }
  return errors;
}

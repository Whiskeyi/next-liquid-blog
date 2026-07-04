import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDirectory = path.join(root, "content", "posts");
const outputDirectory = path.join(root, "public", "post-assets");

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) fs.copyFileSync(sourcePath, targetPath);
  }
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

if (!fs.existsSync(postsDirectory)) process.exit(0);

for (const entry of fs.readdirSync(postsDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const sourceDirectory = path.join(postsDirectory, entry.name, "imgs");
  if (!fs.existsSync(sourceDirectory)) continue;

  copyDirectory(sourceDirectory, path.join(outputDirectory, entry.name, "imgs"));
}

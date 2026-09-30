import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  getImageVariantRelativePath,
  IMAGE_VARIANT_QUALITY,
  IMAGE_VARIANT_WIDTHS,
  isOptimizableImagePath
} from "../lib/image-variant-contract.mjs";

const root = process.cwd();
const postsDirectory = path.join(root, "content", "posts");
const publicDirectory = path.join(root, "public");
const postAssetsDirectory = path.join(publicDirectory, "post-assets");
const variantDirectory = path.join(publicDirectory, "image-variants");
const manifestPath = path.join(variantDirectory, ".manifest.json");
const optimizationConcurrency = 4;

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function collectFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const sourcePath of collectFiles(source)) {
    const targetPath = path.join(target, path.relative(source, sourcePath));
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function syncPostAssets() {
  fs.rmSync(postAssetsDirectory, { recursive: true, force: true });
  fs.mkdirSync(postAssetsDirectory, { recursive: true });
  if (!fs.existsSync(postsDirectory)) return;

  for (const entry of fs.readdirSync(postsDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const sourceDirectory = path.join(postsDirectory, entry.name, "imgs");
    if (!fs.existsSync(sourceDirectory)) continue;
    copyDirectory(sourceDirectory, path.join(postAssetsDirectory, entry.name, "imgs"));
  }
}

function collectImageSources() {
  const publicImages = collectFiles(path.join(publicDirectory, "img")).map((sourcePath) => ({
    sourcePath,
    publicRelativePath: toPosixPath(path.relative(publicDirectory, sourcePath))
  }));

  const postImages = fs.existsSync(postsDirectory)
    ? fs.readdirSync(postsDirectory, { withFileTypes: true }).flatMap((entry) => {
        if (!entry.isDirectory()) return [];
        const imageDirectory = path.join(postsDirectory, entry.name, "imgs");

        return collectFiles(imageDirectory).map((sourcePath) => ({
          sourcePath,
          publicRelativePath: toPosixPath(
            path.join("post-assets", entry.name, "imgs", path.relative(imageDirectory, sourcePath))
          )
        }));
      })
    : [];

  return [...publicImages, ...postImages].filter(({ sourcePath }) => isOptimizableImagePath(sourcePath));
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return { records: {} };
  }
}

function outputsExist(outputs = []) {
  return outputs.every((relativePath) => fs.existsSync(path.join(publicDirectory, relativePath)));
}

function removeOutputs(outputs = []) {
  for (const relativePath of outputs) {
    fs.rmSync(path.join(publicDirectory, relativePath), { force: true });
  }
}

async function optimizeSource(source, previousRecord) {
  const stats = fs.statSync(source.sourcePath);
  if (
    previousRecord?.mtimeMs === stats.mtimeMs &&
    previousRecord?.size === stats.size &&
    outputsExist(previousRecord.outputs)
  ) {
    return previousRecord;
  }

  const metadata = await sharp(source.sourcePath).metadata();
  const sourceWidth = metadata.width ?? 0;
  const widths = IMAGE_VARIANT_WIDTHS.filter((width) => width <= sourceWidth);
  const outputs = widths.map((width) => getImageVariantRelativePath(source.publicRelativePath, width));

  removeOutputs(previousRecord?.outputs);

  await Promise.all(
    outputs.map(async (relativePath, index) => {
      const outputPath = path.join(publicDirectory, relativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      await sharp(source.sourcePath)
        .rotate()
        .resize({ width: widths[index], withoutEnlargement: true })
        .webp({ quality: IMAGE_VARIANT_QUALITY, effort: 4 })
        .toFile(outputPath);
    })
  );

  return { mtimeMs: stats.mtimeMs, size: stats.size, outputs };
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(optimizationConcurrency, items.length) }, runWorker));
  return results;
}

async function syncImageVariants() {
  fs.mkdirSync(variantDirectory, { recursive: true });
  const previousManifest = readManifest();
  const sources = collectImageSources();
  const records = {};
  const optimizedRecords = await mapWithConcurrency(sources, (source) =>
    optimizeSource(source, previousManifest.records?.[source.publicRelativePath])
  );

  sources.forEach((source, index) => {
    records[source.publicRelativePath] = optimizedRecords[index];
  });

  for (const [sourcePath, record] of Object.entries(previousManifest.records ?? {})) {
    if (!records[sourcePath]) removeOutputs(record.outputs);
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify({ records }, null, 2)}\n`);
}

syncPostAssets();
await syncImageVariants();

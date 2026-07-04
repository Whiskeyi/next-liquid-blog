import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const root = process.cwd();
const postsDirectory = path.join(root, "content", "posts");

function parseArgs(argv) {
  const options = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.trim();

    if (key === "help" || key === "dry-run") {
      options[key] = true;
      continue;
    }

    options[key] = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined) index += 1;
  }

  if (!options.title && positional.length > 0) options.title = positional.join(" ");

  return options;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getLocalDateParts() {
  const date = new Date();

  return {
    year: date.getFullYear(),
    month: pad(date.getMonth() + 1),
    day: pad(date.getDate()),
    hour: pad(date.getHours()),
    minute: pad(date.getMinutes()),
    second: pad(date.getSeconds())
  };
}

function formatPostDate() {
  const parts = getLocalDateParts();
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function formatSlugDate() {
  const parts = getLocalDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function slugify(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "post";
}

function normalizeSlug(value, title) {
  const rawSlug = value?.trim() || `${formatSlugDate()}-${slugify(title)}`;
  const slug = rawSlug
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (!slug) throw new Error("Slug cannot be empty. Use --slug my-post-slug.");
  return slug;
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderYamlList(name, items) {
  if (items.length === 0) return `${name}: []`;
  return [`${name}:`, ...items.map((item) => `  - ${item}`)].join("\n");
}

function renderTemplate({ title, subtitle, date, tags, categories, cover }) {
  return `---
title: ${title}
header-img: ${cover}
catalog: true
date: ${date}
subtitle: ${subtitle}
${renderYamlList("tags", tags)}
${renderYamlList("categories", categories)}
---

# ${title}

在这里开始写正文。

## 小节标题

把文章里的图片放进当前文章目录的 \`imgs\` 文件夹，然后用下面这种相对路径引用：

![图片描述](imgs/example.png)
`;
}

async function promptForMissingOptions(options) {
  if (options.title && options.slug) return options;

  const rl = readline.createInterface({ input, output });
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const title = options.title || (await question("文章标题: "));
    const defaultSlug = normalizeSlug(options.slug, title);
    const slugAnswer = options.slug || (await question(`文章 slug (${defaultSlug}): `));

    return {
      ...options,
      title,
      slug: slugAnswer || defaultSlug
    };
  } finally {
    rl.close();
  }
}

function printHelp() {
  console.log(`Create a new blog post template.

Usage:
  npm run new:post
  npm run new:post -- --title "我的文章" --slug 2026-07-05-my-post
  pnpm new:post
  pnpm new:post -- --title "我的文章" --slug 2026-07-05-my-post

Options:
  --title       Article title. Positional text is also accepted.
  --slug        Folder name under content/posts.
  --subtitle    Article subtitle. Defaults to an empty string.
  --tags        Comma-separated tags, for example: React,Next.js
  --categories  Comma-separated categories.
  --cover       Cover path in the post folder. Defaults to imgs/head.jpg.
  --dry-run     Print the target path without writing files.
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const promptedOptions = await promptForMissingOptions(options);
  const title = promptedOptions.title?.trim();
  if (!title) throw new Error("Title is required. Use --title \"My Post\".");

  const slug = normalizeSlug(promptedOptions.slug, title);
  const postDirectory = path.join(postsDirectory, slug);
  const imagesDirectory = path.join(postDirectory, "imgs");
  const indexPath = path.join(postDirectory, "index.md");

  if (fs.existsSync(postDirectory)) {
    throw new Error(`Post already exists: content/posts/${slug}`);
  }

  const template = renderTemplate({
    title,
    subtitle: promptedOptions.subtitle?.trim() || "",
    date: promptedOptions.date?.trim() || formatPostDate(),
    tags: toList(promptedOptions.tags),
    categories: toList(promptedOptions.categories),
    cover: promptedOptions.cover?.trim() || "imgs/head.jpg"
  });

  if (promptedOptions["dry-run"]) {
    console.log(`Would create: ${path.relative(root, indexPath)}`);
    return;
  }

  fs.mkdirSync(imagesDirectory, { recursive: true });
  fs.writeFileSync(indexPath, template, "utf8");

  console.log(`Created ${path.relative(root, indexPath)}`);
  console.log(`Add images to ${path.relative(root, imagesDirectory)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

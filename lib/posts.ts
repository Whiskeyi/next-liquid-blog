import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { siteConfig, withBasePath } from "@/lib/site";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export type Heading = {
  id: string;
  text: string;
  depth: number;
};

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  tags: string[];
  categories: string[];
  cover: string;
  excerpt: string;
  readingMinutes: number;
  wordCount: number;
};

export type Post = PostMeta & {
  content: string;
  headings: Heading[];
};

type RawFrontmatter = {
  title?: string;
  subtitle?: string;
  date?: string | Date;
  tags?: string[] | string;
  categories?: string[] | string;
  "header-img"?: string;
  description?: string;
};

function toArray(value: string[] | string | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function stripDatePrefix(fileName: string) {
  return fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function titleFromSlug(slug: string) {
  return stripDatePrefix(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseDate(value: string | Date | undefined) {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;

  const normalized = String(value).replace(/^(\d{4})-(\d{1})-(\d{1,2})/, "$1-0$2-$3");
  return new Date(normalized.replace(" ", "T"));
}

function formatDate(date: Date) {
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`~|[\]-]/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(markdown: string, explicit?: string) {
  if (explicit) return explicit;
  const text = stripMarkdown(markdown);
  return text.length > 150 ? `${text.slice(0, 150)}...` : text;
}

function countWords(markdown: string) {
  const text = stripMarkdown(markdown);
  const cjk = text.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const latin = text.replace(/[\u4e00-\u9fa5]/g, " ").match(/[a-zA-Z0-9]+/g)?.length ?? 0;
  return cjk + latin;
}

function extractHeadings(markdown: string): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const text = match[2].replace(/[#`*_]/g, "").trim();
    const base = slugify(text) || `heading-${headings.length + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    headings.push({
      id: count ? `${base}-${count}` : base,
      text,
      depth: match[1].length
    });
  }

  return headings;
}

export function normalizeAssetPath(src: string | undefined) {
  if (!src) return "";
  if (src.startsWith("//img/")) return withBasePath(src.slice(1));
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;

  const withoutDot = src.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  const normalized = withoutDot.startsWith("img/") ? `/${withoutDot}` : `/${withoutDot}`;
  return withBasePath(normalized);
}

function readPost(fileName: string): Post {
  const fullPath = path.join(postsDirectory, fileName);
  const file = fs.readFileSync(fullPath, "utf8");
  const { content, data } = matter(file);
  const frontmatter = data as RawFrontmatter;
  const slug = fileName.replace(/\.md$/, "");
  const date = parseDate(frontmatter.date);
  const wordCount = countWords(content);

  return {
    slug,
    title: frontmatter.title ?? titleFromSlug(slug),
    subtitle: frontmatter.subtitle ?? "",
    date: date.toISOString(),
    displayDate: formatDate(date),
    tags: toArray(frontmatter.tags),
    categories: toArray(frontmatter.categories),
    cover: normalizeAssetPath(frontmatter["header-img"] ?? "img/default.jpg"),
    excerpt: makeExcerpt(content, frontmatter.description),
    readingMinutes: Math.max(1, Math.ceil(wordCount / 500)),
    wordCount,
    content,
    headings: extractHeadings(content)
  };
}

export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(readPost)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    .map(({ content: _content, headings: _headings, ...meta }) => meta);
}

export function getPostBySlug(slug: string) {
  const fileName = `${slug}.md`;
  const fullPath = path.join(postsDirectory, fileName);

  if (!fs.existsSync(fullPath)) return null;
  return readPost(fileName);
}

export function getAllTags() {
  const map = new Map<string, number>();
  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1));
    post.categories.forEach((category) => map.set(category, (map.get(category) ?? 0) + 1));
  });

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPostsByTag(tag: string) {
  const decoded = decodeURIComponent(tag);
  return getAllPosts().filter(
    (post) => post.tags.includes(decoded) || post.categories.includes(decoded)
  );
}

export function getArchiveGroups() {
  return getAllPosts().reduce<Record<string, PostMeta[]>>((groups, post) => {
    const year = new Date(post.date).getFullYear().toString();
    groups[year] = groups[year] ? [...groups[year], post] : [post];
    return groups;
  }, {});
}

export function getAbsolutePostUrl(slug: string) {
  return `${siteConfig.url}/blog/${slug}/`;
}

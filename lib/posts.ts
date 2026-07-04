import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createHeadingIdRegistry } from "@/lib/heading-ids";
import { siteConfig, withBasePath } from "@/lib/site";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const generatedPostAssetsDirectory = "post-assets";
const shouldCachePosts = process.env.NODE_ENV !== "development";

export type Heading = {
  id: string;
  text: string;
  depth: number;
};

export type CoverOrientation = "landscape" | "portrait" | "square" | "none";

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  displayDate: string;
  tags: string[];
  categories: string[];
  cover: string;
  coverOrientation: CoverOrientation;
  coverAspectRatio: string;
  hasCover: boolean;
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

type PostSource = {
  slug: string;
  filePath: string;
  directory: string;
  cacheKey: string;
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
  const idRegistry = createHeadingIdRegistry();
  const headings: Heading[] = [];

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const text = match[2].replace(/[#`*_]/g, "").trim();

    headings.push({
      id: idRegistry.getId(text),
      text,
      depth: match[1].length
    });
  }

  return headings;
}

function isRemoteAsset(src: string) {
  return /^(https?:)?\/\//.test(src) || src.startsWith("data:");
}

export function normalizeAssetPath(src: string | undefined, slug?: string) {
  if (!src) return "";
  if (src.startsWith("//img/")) return withBasePath(src.slice(1));
  if (isRemoteAsset(src)) return src;

  const withoutDot = src.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  const withoutSlash = withoutDot.startsWith("/") ? withoutDot.slice(1) : withoutDot;
  const normalized =
    slug && withoutSlash.startsWith("imgs/")
      ? `/${generatedPostAssetsDirectory}/${slug}/${withoutSlash}`
      : `/${withoutSlash}`;

  return withBasePath(encodeURI(normalized));
}

function resolveAssetPath(src: string | undefined, source?: PostSource) {
  if (!src || isRemoteAsset(src)) return null;

  const withoutDot = src.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  const withoutSlash = withoutDot.startsWith("/") ? withoutDot.slice(1) : withoutDot;
  if (source && withoutSlash.startsWith("imgs/")) return path.join(source.directory, withoutSlash);

  const publicRelativePath = withoutSlash.startsWith("public/") ? withoutSlash.slice(7) : withoutSlash;

  return path.join(process.cwd(), "public", publicRelativePath);
}

function getImageDimensions(src: string | undefined, source?: PostSource) {
  const assetPath = resolveAssetPath(src, source);
  if (!assetPath || !fs.existsSync(assetPath)) return null;

  const buffer = fs.readFileSync(assetPath);
  if (buffer.length < 24) return null;

  if (buffer.toString("ascii", 1, 4) === "PNG") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  if (buffer.toString("ascii", 0, 3) === "GIF") {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8)
    };
  }

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isStartOfFrame) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5)
      };
    }

    offset += 2 + length;
  }

  return null;
}

function getCoverImageMeta(
  src: string | undefined,
  source: PostSource
): { orientation: CoverOrientation; aspectRatio: string } {
  if (!src) {
    return {
      orientation: "none" as CoverOrientation,
      aspectRatio: "16 / 10"
    };
  }

  const dimensions = getImageDimensions(src, source);
  if (!dimensions) {
    return {
      orientation: "landscape" as CoverOrientation,
      aspectRatio: "16 / 10"
    };
  }

  const orientation =
    dimensions.width === dimensions.height ? "square" : dimensions.width > dimensions.height ? "landscape" : "portrait";

  return {
    orientation,
    aspectRatio: `${dimensions.width} / ${dimensions.height}`
  };
}

function readPost(source: PostSource): Post {
  const file = fs.readFileSync(source.filePath, "utf8");
  const { content, data } = matter(file);
  const frontmatter = data as RawFrontmatter;
  const slug = source.slug;
  const date = parseDate(frontmatter.date);
  const wordCount = countWords(content);
  const coverSource = frontmatter["header-img"];
  const coverImage = getCoverImageMeta(coverSource, source);

  return {
    slug,
    title: frontmatter.title ?? titleFromSlug(slug),
    subtitle: frontmatter.subtitle ?? "",
    date: date.toISOString(),
    displayDate: formatDate(date),
    tags: toArray(frontmatter.tags),
    categories: toArray(frontmatter.categories),
    cover: normalizeAssetPath(coverSource, slug),
    coverOrientation: coverImage.orientation,
    coverAspectRatio: coverImage.aspectRatio,
    hasCover: Boolean(coverSource),
    excerpt: makeExcerpt(content, frontmatter.description),
    readingMinutes: Math.max(1, Math.ceil(wordCount / 500)),
    wordCount,
    content,
    headings: extractHeadings(content)
  };
}

let allPostsCache: Post[] | null = null;
const postCache = new Map<string, Post>();

function sourceFromMarkdownFile(fileName: string): PostSource {
  const filePath = path.join(postsDirectory, fileName);
  return {
    slug: fileName.replace(/\.md$/, ""),
    filePath,
    directory: path.dirname(filePath),
    cacheKey: filePath
  };
}

function sourceFromPostDirectory(slug: string): PostSource | null {
  const directory = path.join(postsDirectory, slug);
  const filePath = path.join(directory, "index.md");

  if (!fs.existsSync(filePath)) return null;

  return {
    slug,
    filePath,
    directory,
    cacheKey: filePath
  };
}

function getPostSources() {
  const sources = new Map<string, PostSource>();
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });

  entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .forEach((entry) => {
      const source = sourceFromMarkdownFile(entry.name);
      sources.set(source.slug, source);
    });

  entries
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const source = sourceFromPostDirectory(entry.name);
      if (source) sources.set(source.slug, source);
    });

  return [...sources.values()];
}

function getPostSourceBySlug(slug: string) {
  const markdownFileName = `${slug}.md`;

  return sourceFromPostDirectory(slug) ??
    (fs.existsSync(path.join(postsDirectory, markdownFileName)) ? sourceFromMarkdownFile(markdownFileName) : null);
}

function getCachedPost(source: PostSource) {
  if (!shouldCachePosts) return readPost(source);

  const cached = postCache.get(source.cacheKey);
  if (cached) return cached;

  const post = readPost(source);
  postCache.set(source.cacheKey, post);
  return post;
}

function getAllPostRecords() {
  if (!shouldCachePosts) {
    return getPostSources()
      .map(readPost)
      .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  }

  if (!allPostsCache) {
    allPostsCache = getPostSources()
      .map(getCachedPost)
      .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  }

  return allPostsCache;
}

export function getAllPosts(): PostMeta[] {
  return getAllPostRecords().map(({ content: _content, headings: _headings, ...meta }) => meta);
}

export function getPostBySlug(slug: string) {
  const source = getPostSourceBySlug(slug);

  if (!source) return null;
  return getCachedPost(source);
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

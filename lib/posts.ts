import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createHeadingIdRegistry } from "@/lib/heading-ids";
import { siteConfig, withBasePath } from "@/lib/site";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");
const GENERATED_POST_ASSETS_DIRECTORY = "post-assets";
const POST_INDEX_FILE = "index.md";
const MARKDOWN_EXTENSION = ".md";
const PUBLIC_DIRECTORY = "public";
const PUBLIC_PATH_PREFIX = `${PUBLIC_DIRECTORY}/`;
const LOCAL_POST_IMAGE_DIRECTORY = "imgs/";
const DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}-/;
const SINGLE_DIGIT_MONTH_PATTERN = /^(\d{4})-(\d{1})-(\d{1,2})/;
const DEFAULT_DATE = new Date(0);
const DATE_LOCALE = "zh-CN";
const EXCERPT_MAX_LENGTH = 150;
const READING_UNITS_PER_MINUTE = 350;
const CODE_UNITS_PER_READING_MINUTE = 500;
const SECONDS_PER_IMAGE = 12;
const SECONDS_PER_MINUTE = 60;
const MIN_READING_MINUTES = 1;
const DEFAULT_COVER_ASPECT_RATIO = "16 / 10";
const MARKDOWN_HEADING_PATTERN = /^(#{1,5})\s+(.+)$/;
const LEADING_HTML_COMMENT_PATTERN = /^<!--[\s\S]*-->$/;
const TOC_MARKER_PATTERN = /^(?:\[toc]|\[\[toc]])$/i;
const FENCED_CODE_BLOCK_PATTERN = /^(`{3,}|~{3,})/;
const MARKDOWN_CODE_BLOCK_PATTERN = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\([^)]*\)/g;
const CJK_CHARACTER_PATTERN = /[\u4e00-\u9fa5]/g;
const LATIN_WORD_PATTERN = /[a-zA-Z0-9]+/g;
const PARENTHETICAL_TEXT_PATTERN = /（[^）]*）|\([^)]*\)/g;
const MARKDOWN_TITLE_MARKUP_PATTERN = /[#`*_~]/g;
const TITLE_COMPARISON_SEPARATOR_PATTERN = /[^\p{L}\p{N}]+/gu;
const IMAGE_HEADER_MIN_BYTES = 24;
const PNG_SIGNATURE_OFFSET = 1;
const PNG_SIGNATURE_LENGTH = 4;
const GIF_SIGNATURE_OFFSET = 0;
const GIF_SIGNATURE_LENGTH = 3;
const PNG_DIMENSION_OFFSET = { width: 16, height: 20 } as const;
const GIF_DIMENSION_OFFSET = { width: 6, height: 8 } as const;
const JPEG_SIGNATURE = { firstByte: 0xff, secondByte: 0xd8, startOffset: 2 } as const;
const JPEG_MARKER_PREFIX = 0xff;
const JPEG_SEGMENT_LENGTH_OFFSET = 2;
const JPEG_SEGMENT_HEADER_BYTES = 2;
const JPEG_DIMENSION_OFFSET = { width: 7, height: 5 } as const;
const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0,
  0xc1,
  0xc2,
  0xc3,
  0xc5,
  0xc6,
  0xc7,
  0xc9,
  0xca,
  0xcb,
  0xcd,
  0xce,
  0xcf
]);
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

type StringListInput = RawFrontmatter["tags"];

type PostSource = {
  slug: string;
  filePath: string;
  directory: string;
  cacheKey: string;
};

type CachedPost = {
  modifiedTime: number;
  post: Post;
};

type AllPostsCache = {
  signature: string;
  posts: Post[];
};

type ImageDimensions = {
  width: number;
  height: number;
};

type CoverImageMeta = {
  orientation: CoverOrientation;
  aspectRatio: string;
};

const EMPTY_COVER_META: CoverImageMeta = {
  orientation: "none",
  aspectRatio: DEFAULT_COVER_ASPECT_RATIO
};

const FALLBACK_COVER_META: CoverImageMeta = {
  orientation: "landscape",
  aspectRatio: DEFAULT_COVER_ASPECT_RATIO
};

function toArray(value: StringListInput): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function stripDatePrefix(fileName: string): string {
  return fileName.replace(DATE_PREFIX_PATTERN, "");
}

function titleFromSlug(slug: string): string {
  return stripDatePrefix(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseDate(value: RawFrontmatter["date"]): Date {
  if (!value) return DEFAULT_DATE;
  if (value instanceof Date) return value;

  const normalized = String(value).replace(SINGLE_DIGIT_MONTH_PATTERN, "$1-0$2-$3");
  return new Date(normalized.replace(" ", "T"));
}

function formatDate(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(DATE_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(MARKDOWN_CODE_BLOCK_PATTERN, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(MARKDOWN_IMAGE_PATTERN, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`~|[\]-]/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(markdown: string, explicit?: string): string {
  if (explicit) return explicit;
  const text = stripMarkdown(markdown);
  return text.length > EXCERPT_MAX_LENGTH ? `${text.slice(0, EXCERPT_MAX_LENGTH)}...` : text;
}

function countWords(markdown: string): number {
  const text = stripMarkdown(markdown);
  return countTextUnits(text);
}

function countTextUnits(text: string): number {
  const cjk = text.match(CJK_CHARACTER_PATTERN)?.length ?? 0;
  const latin = text.replace(CJK_CHARACTER_PATTERN, " ").match(LATIN_WORD_PATTERN)?.length ?? 0;
  return cjk + latin;
}

function normalizeTitleForComparison(text: string): string {
  return text
    .replace(PARENTHETICAL_TEXT_PATTERN, "")
    .replace(MARKDOWN_TITLE_MARKUP_PATTERN, "")
    .toLocaleLowerCase(DATE_LOCALE)
    .replace(TITLE_COMPARISON_SEPARATOR_PATTERN, "")
    .trim();
}

function stripLeadingDuplicateTitleHeading(markdown: string, title: string): string {
  const normalizedTitle = normalizeTitleForComparison(title);
  if (!normalizedTitle) return markdown;

  const lines = markdown.split("\n");
  let headingIndex = 0;

  while (headingIndex < lines.length) {
    const trimmedLine = lines[headingIndex].trim();

    if (!trimmedLine || LEADING_HTML_COMMENT_PATTERN.test(trimmedLine) || TOC_MARKER_PATTERN.test(trimmedLine)) {
      headingIndex += 1;
      continue;
    }

    break;
  }

  const headingMatch = MARKDOWN_HEADING_PATTERN.exec(lines[headingIndex]?.trim() ?? "");
  if (!headingMatch) return markdown;

  const headingText = headingMatch[2];
  if (normalizeTitleForComparison(headingText) !== normalizedTitle) return markdown;

  const nextLineIndex = headingIndex + 1;
  const endIndex =
    nextLineIndex < lines.length && lines[nextLineIndex].trim() === "" ? nextLineIndex + 1 : nextLineIndex;

  return [...lines.slice(0, headingIndex), ...lines.slice(endIndex)].join("\n");
}

function calculateReadingMinutes(markdown: string, wordCount: number): number {
  const codeUnits =
    markdown.match(MARKDOWN_CODE_BLOCK_PATTERN)?.reduce((total, block) => total + countTextUnits(block), 0) ?? 0;
  const imageSeconds = (markdown.match(MARKDOWN_IMAGE_PATTERN)?.length ?? 0) * SECONDS_PER_IMAGE;
  const minutes =
    wordCount / READING_UNITS_PER_MINUTE + codeUnits / CODE_UNITS_PER_READING_MINUTE + imageSeconds / SECONDS_PER_MINUTE;

  return Math.max(MIN_READING_MINUTES, Math.ceil(minutes));
}

function extractHeadings(markdown: string): Heading[] {
  const idRegistry = createHeadingIdRegistry();
  const headings: Heading[] = [];
  let insideFencedCodeBlock = false;

  for (const line of markdown.split("\n")) {
    const trimmedLine = line.trim();
    if (FENCED_CODE_BLOCK_PATTERN.test(trimmedLine)) {
      insideFencedCodeBlock = !insideFencedCodeBlock;
      continue;
    }

    if (insideFencedCodeBlock) continue;

    const match = MARKDOWN_HEADING_PATTERN.exec(trimmedLine);
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

function isRemoteAsset(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith("data:");
}

export function normalizeAssetPath(src: string | undefined, slug?: string): string {
  if (!src) return "";
  if (src.startsWith("//img/")) return withBasePath(src.slice(1));
  if (isRemoteAsset(src)) return src;

  const withoutDot = src.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  const withoutSlash = withoutDot.startsWith("/") ? withoutDot.slice(1) : withoutDot;
  const normalized =
    slug && withoutSlash.startsWith(LOCAL_POST_IMAGE_DIRECTORY)
      ? `/${GENERATED_POST_ASSETS_DIRECTORY}/${slug}/${withoutSlash}`
      : `/${withoutSlash}`;

  return withBasePath(encodeURI(normalized));
}

function resolveAssetPath(src: string | undefined, source?: PostSource): string | null {
  if (!src || isRemoteAsset(src)) return null;

  const withoutDot = src.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  const withoutSlash = withoutDot.startsWith("/") ? withoutDot.slice(1) : withoutDot;
  if (source && withoutSlash.startsWith(LOCAL_POST_IMAGE_DIRECTORY)) return path.join(source.directory, withoutSlash);

  const publicRelativePath = withoutSlash.startsWith(PUBLIC_PATH_PREFIX)
    ? withoutSlash.slice(PUBLIC_PATH_PREFIX.length)
    : withoutSlash;

  return path.join(process.cwd(), PUBLIC_DIRECTORY, publicRelativePath);
}

function getImageDimensions(src: string | undefined, source?: PostSource): ImageDimensions | null {
  const assetPath = resolveAssetPath(src, source);
  if (!assetPath || !fs.existsSync(assetPath)) return null;

  const buffer = fs.readFileSync(assetPath);
  if (buffer.length < IMAGE_HEADER_MIN_BYTES) return null;

  if (buffer.toString("ascii", PNG_SIGNATURE_OFFSET, PNG_SIGNATURE_LENGTH) === "PNG") {
    return {
      width: buffer.readUInt32BE(PNG_DIMENSION_OFFSET.width),
      height: buffer.readUInt32BE(PNG_DIMENSION_OFFSET.height)
    };
  }

  if (buffer.toString("ascii", GIF_SIGNATURE_OFFSET, GIF_SIGNATURE_LENGTH) === "GIF") {
    return {
      width: buffer.readUInt16LE(GIF_DIMENSION_OFFSET.width),
      height: buffer.readUInt16LE(GIF_DIMENSION_OFFSET.height)
    };
  }

  if (buffer[0] !== JPEG_SIGNATURE.firstByte || buffer[1] !== JPEG_SIGNATURE.secondByte) return null;

  let offset = JPEG_SIGNATURE.startOffset;
  while (offset < buffer.length) {
    if (buffer[offset] !== JPEG_MARKER_PREFIX) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + JPEG_SEGMENT_LENGTH_OFFSET);

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      return {
        width: buffer.readUInt16BE(offset + JPEG_DIMENSION_OFFSET.width),
        height: buffer.readUInt16BE(offset + JPEG_DIMENSION_OFFSET.height)
      };
    }

    offset += JPEG_SEGMENT_HEADER_BYTES + length;
  }

  return null;
}

function getCoverImageMeta(src: string | undefined, source: PostSource): CoverImageMeta {
  if (!src) return EMPTY_COVER_META;

  const dimensions = getImageDimensions(src, source);
  if (!dimensions) return FALLBACK_COVER_META;

  const orientation =
    dimensions.width === dimensions.height ? "square" : dimensions.width > dimensions.height ? "landscape" : "portrait";

  return {
    orientation,
    aspectRatio: `${dimensions.width} / ${dimensions.height}`
  };
}

function readPost(source: PostSource): Post {
  const file = fs.readFileSync(source.filePath, "utf8");
  const { content: rawContent, data } = matter(file);
  const frontmatter = data as RawFrontmatter;
  const slug = source.slug;
  const title = frontmatter.title ?? titleFromSlug(slug);
  const content = stripLeadingDuplicateTitleHeading(rawContent, title);
  const date = parseDate(frontmatter.date);
  const wordCount = countWords(content);
  const coverSource = frontmatter["header-img"];
  const coverImage = getCoverImageMeta(coverSource, source);

  return {
    slug,
    title,
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
    readingMinutes: calculateReadingMinutes(content, wordCount),
    wordCount,
    content,
    headings: extractHeadings(content)
  };
}

let allPostsCache: AllPostsCache | null = null;
const postCache = new Map<string, CachedPost>();

function sourceFromMarkdownFile(fileName: string): PostSource {
  const filePath = path.join(POSTS_DIRECTORY, fileName);
  return {
    slug: fileName.slice(0, -MARKDOWN_EXTENSION.length),
    filePath,
    directory: path.dirname(filePath),
    cacheKey: filePath
  };
}

function sourceFromPostDirectory(slug: string): PostSource | null {
  const directory = path.join(POSTS_DIRECTORY, slug);
  const filePath = path.join(directory, POST_INDEX_FILE);

  if (!fs.existsSync(filePath)) return null;

  return {
    slug,
    filePath,
    directory,
    cacheKey: filePath
  };
}

function getPostSources(): PostSource[] {
  const sources = new Map<string, PostSource>();
  const entries = fs.readdirSync(POSTS_DIRECTORY, { withFileTypes: true });

  entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(MARKDOWN_EXTENSION))
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

function getPostSourceBySlug(slug: string): PostSource | null {
  const markdownFileName = `${slug}${MARKDOWN_EXTENSION}`;

  return sourceFromPostDirectory(slug) ??
    (fs.existsSync(path.join(POSTS_DIRECTORY, markdownFileName)) ? sourceFromMarkdownFile(markdownFileName) : null);
}

function getSourceModifiedTime(source: PostSource): number {
  return fs.statSync(source.filePath).mtimeMs;
}

function makeSourcesSignature(sources: PostSource[]): string {
  return sources.map((source) => `${source.cacheKey}:${getSourceModifiedTime(source)}`).join("|");
}

function getCachedPost(source: PostSource): Post {
  const modifiedTime = getSourceModifiedTime(source);
  const cached = postCache.get(source.cacheKey);

  if (cached && cached.modifiedTime === modifiedTime) return cached.post;

  const post = readPost(source);
  postCache.set(source.cacheKey, { modifiedTime, post });
  return post;
}

function getAllPostRecords(): Post[] {
  const sources = getPostSources();
  const signature = makeSourcesSignature(sources);

  if (!allPostsCache || allPostsCache.signature !== signature) {
    allPostsCache = {
      signature,
      posts: sources.map(getCachedPost).sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    };
  }

  return allPostsCache.posts;
}

export function getAllPosts(): PostMeta[] {
  return getAllPostRecords().map(({ content: _content, headings: _headings, ...meta }) => meta);
}

export function getPostBySlug(slug: string): Post | null {
  const source = getPostSourceBySlug(slug);

  if (!source) return null;
  return getCachedPost(source);
}

export function getAllTags(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1));
    post.categories.forEach((category) => map.set(category, (map.get(category) ?? 0) + 1));
  });

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPostsByTag(tag: string): PostMeta[] {
  const decoded = decodeURIComponent(tag);
  return getAllPosts().filter(
    (post) => post.tags.includes(decoded) || post.categories.includes(decoded)
  );
}

export function getArchiveGroups(): Record<string, PostMeta[]> {
  return getAllPosts().reduce<Record<string, PostMeta[]>>((groups, post) => {
    const year = new Date(post.date).getFullYear().toString();
    groups[year] = groups[year] ? [...groups[year], post] : [post];
    return groups;
  }, {});
}

export function getAbsolutePostUrl(slug: string): string {
  return `${siteConfig.url}/blog/${slug}/`;
}

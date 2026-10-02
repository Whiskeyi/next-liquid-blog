import { siteConfig } from "@/lib/site";

export const locales = ["zh-CN", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";
export const localeStorageKey = "locale";

export function isLocale(value: unknown): value is Locale {
  return locales.some((locale) => locale === value);
}

const zh = {
  mainNavigation: "主导航",
  home: "首页",
  archive: "归档",
  about: "关于",
  brandHome: "{name} 首页",
  repository: "博客源码 GitHub 仓库",
  switchLanguage: "Switch to English",
  switchTheme: "切换主题",
  description: siteConfig.description,
  heroVisual: "首页主视觉",
  heroCarousel: "首页主视觉轮播图",
  goToSlide: "切换到第 {count} 张轮播图",
  latestNotes: siteConfig.home.feedTitle,
  feedDescription: siteConfig.home.feedDescription,
  postsCount: `{count} ${siteConfig.home.feedEyebrowSuffix}`,
  postList: "文章列表",
  searchPosts: "搜索文章、标签或摘要",
  filterTags: "标签筛选",
  allTags: "全部",
  note: "笔记",
  readPost: "阅读 {title}",
  coverError: "封面暂时无法显示",
  readingMinutes: "{count} 分钟",
  wordCount: "{count} 字",
  views: "次阅读",
  archiveDescription: "按年份整理的技术笔记索引。",
  archiveNotesAcross: "篇笔记，跨越",
  years: "年",
  backHome: "返回首页",
  tag: "标签",
  tagTitle: "{name} 标签",
  relatedPosts: "共 {count} 篇相关文章。",
  notFound: "这个页面暂时没有内容。",
  email: "邮箱",
  profileSummary: "GitHub 个人简介",
  avatar: "{name} 的 GitHub 头像",
  cover: "{title} 封面图",
  neighbors: "相邻文章",
  previousPost: "上一篇",
  nextPost: "下一篇",
  toc: "目录",
  articleToc: "文章目录",
  articleFallback: "这篇文章的译文尚未发布，当前显示中文原文。",
  expandToc: "展开目录",
  collapseToc: "收起目录",
  openToc: "打开目录",
  closeToc: "关闭目录",
  mobileToc: "移动端文章目录",
  decreaseFont: "缩小字号",
  increaseFont: "放大字号",
  backToTop: "回到顶部",
  copyCode: "复制代码",
  copied: "已复制",
  headingLink: "标题链接",
  viewImage: "查看大图",
  viewImageAlt: "查看大图：{alt}",
  closeImage: "关闭图片预览",
  zoomOut: "缩小图片",
  resetImage: "重置图片",
  zoomIn: "放大图片",
  imageError: "图片加载失败"
};

export type MessageKey = keyof typeof zh;
type Message = string | { one: string; other: string };
export type MessageValues = Record<string, string | number>;

const en = {
  mainNavigation: "Main navigation",
  home: "Home",
  archive: "Archive",
  about: "About",
  brandHome: "{name} home",
  repository: "Blog source on GitHub",
  switchLanguage: "切换到中文",
  switchTheme: "Toggle theme",
  description: "Notes on full-stack development, AI applications, and agent engineering.",
  heroVisual: "Homepage hero image",
  heroCarousel: "Homepage image carousel",
  goToSlide: "Go to slide {count}",
  latestNotes: "Latest Notes",
  feedDescription: "Practical notes and reflections on full-stack development, AI applications, and building agents.",
  postsCount: { one: "{count} article", other: "{count} articles" },
  postList: "Articles",
  searchPosts: "Search articles, tags, or summaries",
  filterTags: "Filter by tag",
  allTags: "All",
  note: "Note",
  readPost: "Read {title}",
  coverError: "Cover image unavailable",
  readingMinutes: "{count} min read",
  wordCount: { one: "{count} word", other: "{count} words" },
  views: "views",
  archiveDescription: "Technical notes organized by year.",
  archiveNotesAcross: "notes across",
  years: "years",
  backHome: "Back to home",
  tag: "Tag",
  tagTitle: "{name} tag",
  relatedPosts: { one: "{count} related article.", other: "{count} related articles." },
  notFound: "There is no content on this page yet.",
  email: "Email",
  profileSummary: "GitHub profile summary",
  avatar: "{name}'s GitHub avatar",
  cover: "Cover image for {title}",
  neighbors: "Adjacent articles",
  previousPost: "Previous article",
  nextPost: "Next article",
  toc: "Contents",
  articleToc: "Table of contents",
  articleFallback: "The English translation is not published yet. Showing the Chinese original.",
  expandToc: "Expand contents",
  collapseToc: "Collapse contents",
  openToc: "Open contents",
  closeToc: "Close contents",
  mobileToc: "Mobile table of contents",
  decreaseFont: "Decrease font size",
  increaseFont: "Increase font size",
  backToTop: "Back to top",
  copyCode: "Copy code",
  copied: "Copied",
  headingLink: "Link to heading",
  viewImage: "View full image",
  viewImageAlt: "View full image: {alt}",
  closeImage: "Close image preview",
  zoomOut: "Zoom out",
  resetImage: "Reset image",
  zoomIn: "Zoom in",
  imageError: "Image failed to load"
} satisfies Record<MessageKey, Message>;

const messages: Record<Locale, Record<MessageKey, Message>> = { "zh-CN": zh, en };

export function translate(locale: Locale, key: MessageKey, values: MessageValues = {}): string {
  const message = messages[locale][key];
  const template = typeof message === "string"
    ? message
    : message[new Intl.PluralRules(locale).select(Number(values.count)) === "one" ? "one" : "other"];

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) return placeholder;
    return typeof value === "number" ? new Intl.NumberFormat(locale).format(value) : value;
  });
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: locale === "en" ? "short" : "2-digit",
    day: "2-digit",
    timeZone: siteConfig.timeZone
  }).format(new Date(date));
}

export const localizedAbout = {
  "zh-CN": siteConfig.about,
  en: {
    ...siteConfig.about,
    eyebrow: "About",
    profileNote: "Keep learning. :)",
    profileReadme: [{ label: "Focus", value: "AI and Full-Stack" }],
    timelineEyebrow: "Work Timeline",
    timelineTitle: "Work Experience",
    timeline: [
      {
        period: "2022.06 - 2022.12",
        title: "Frontend Development Intern",
        company: "NetEase (Hangzhou)",
        points: ["Developed consumer campaign pages and internal management systems."]
      },
      {
        period: "2023.06 - 2026.01",
        title: "Frontend Developer",
        company: "Alibaba Cloud Intelligence · Quick BI",
        points: ["Built data product interfaces, including complex multidimensional tables, AI-powered data queries, and engineering improvements."]
      },
      {
        period: "2026.01 - Present",
        title: "Full-Stack & Agent Developer",
        company: "Alibaba Group · Taobao Instant Commerce",
        points: ["Developed retail products, an AI coding platform, and merchant-facing agents."]
      }
    ]
  }
};

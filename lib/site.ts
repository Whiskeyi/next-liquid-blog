type NavigationItem = {
  href: string;
  label: string;
};

type TimelineItem = {
  period: string;
  title: string;
  company: string;
  points: string[];
};

type ProfileReadmeItem = {
  label: string;
  value: string;
};

type SiteConfig = {
  name: string;
  title: string;
  author: string;
  description: string;
  url: string;
  locale: string;
  language: string;
  navigation: NavigationItem[];
  links: {
    github: string;
    repository: string;
    email: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    feedEyebrowSuffix: string;
    feedTitle: string;
    feedDescription: string;
    heroImages: string[];
  };
  about: {
    title: string;
    eyebrow: string;
    heading: string;
    heroImage: string;
    profileNote: string;
    profileReadme: ProfileReadmeItem[];
    timelineEyebrow: string;
    timelineTitle: string;
    timeline: TimelineItem[];
  };
};

const DEFAULT_SITE_URL = "https://blog.zhuchj.com";

export const siteConfig = {
  name: "Whiskeyi's Blog",
  title: "Whiskeyi's Blog",
  author: "Whiskeyi",
  description: "前端工程、React、JavaScript 与系统化学习笔记。",
  url: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  locale: "zh_CN",
  language: "zh-CN",
  navigation: [
    { href: "/", label: "首页" },
    { href: "/archive", label: "归档" },
    { href: "/about", label: "关于" }
  ],
  links: {
    github: "https://github.com/Whiskeyi",
    repository: "https://github.com/Whiskeyi/next-liquid-blog",
    email: "zhuchjie@gmail.com"
  },
  home: {
    heroEyebrow: "Frontend / React / JavaScript",
    heroTitle: "Whiskeyi's Blog",
    feedEyebrowSuffix: "篇文章",
    feedTitle: "Latest Notes",
    feedDescription: "围绕前端工程、React、JavaScript 与系统化学习整理的长期笔记。",
    heroImages: [
      "/img/header_img/blue-wave.jpg",
      "/img/header_img/star-trails.jpg",
      "/img/header_img/ocean-shore.jpg",
      "/img/header_img/ocean-wave.jpg",
      "/img/header_img/valley-stars.jpg",
      "/img/header_img/green-beams.jpg",
      "/img/header_img/city-night.jpg",
      "/img/header_img/snowy-lake.jpg",
      "/img/header_img/boat-wake.jpg"
    ]
  },
  about: {
    title: "关于",
    eyebrow: "About",
    heading: "Whiskeyi",
    heroImage: "/img/about/avatar.jpg",
    profileNote: "Keep learning. :)",
    profileReadme: [
      {
        label: "Focus",
        value: "AI and Full-Stack"
      }
    ],
    timelineEyebrow: "Work Timeline",
    timelineTitle: "工作经历",
    timeline: [
      {
        period: "2022.06 - 2022.12",
        title: "前端开发实习",
        company: "网易（杭州）网络有限公司",
        points: ["参与 C 端活动页与后台系统研发"]
      },
      {
        period: "2023.06 - 2026.01",
        title: "前端开发",
        company: "阿里云智能集团 · Quick BI",
        points: ["参与数据产品前端研发，包括复杂多维表格、AI智能问数与工程化优化"]
      },
      {
        period: "2026.01 - 至今",
        title: "全栈开发",
        company: "阿里巴巴集团 · 淘宝闪购",
        points: ["参与零售业务研发、AI Coding平台建设与FDE实践"]
      }
    ]
  }
} satisfies SiteConfig;

export function withBasePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeSiteHref(href: string): string {
  if (!href.startsWith("http://") && !href.startsWith("https://")) return href;

  const url = parseUrl(href);
  if (!url) return href;

  const siteUrl = parseUrl(siteConfig.url);

  if (!siteUrl || siteUrl.hostname !== url.hostname) return href;

  const sitePath = siteUrl.origin === url.origin && siteUrl.pathname !== "/" ? siteUrl.pathname.replace(/\/$/, "") : "";
  const pathname =
    sitePath && url.pathname.startsWith(`${sitePath}/`) ? url.pathname.slice(sitePath.length) : url.pathname;

  return withBasePath(`${pathname}${url.search}${url.hash}`);
}

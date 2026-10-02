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

type HeroImage = {
  src: string;
  width: number;
  height: number;
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
  timeZone: string;
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
    heroImages: HeroImage[];
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
  description: "全栈开发、AI 应用与 Agent 工程实践。",
  url: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  locale: "zh_CN",
  language: "zh-CN",
  timeZone: "Asia/Shanghai",
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
    heroEyebrow: "Full-stack / AI / Agent",
    heroTitle: "Whiskeyi's Blog",
    feedEyebrowSuffix: "篇文章",
    feedTitle: "最新笔记",
    feedDescription: "记录全栈开发、AI 应用与 Agent 构建中的实践、思考与系统化学习。",
    heroImages: [
      { src: "/img/header_img/blue-wave.jpg", width: 1600, height: 1066 },
      { src: "/img/header_img/star-trails.jpg", width: 3182, height: 1640 },
      { src: "/img/header_img/ocean-shore.jpg", width: 2359, height: 1327 },
      { src: "/img/header_img/ocean-wave.jpg", width: 2460, height: 1640 },
      { src: "/img/header_img/valley-stars.jpg", width: 2457, height: 1640 },
      { src: "/img/header_img/green-beams.jpg", width: 2460, height: 1640 },
      { src: "/img/header_img/city-night.jpg", width: 2460, height: 1640 },
      { src: "/img/header_img/snowy-lake.jpg", width: 2460, height: 1640 },
      { src: "/img/header_img/boat-wake.jpg", width: 2460, height: 1640 }
    ]
  },
  about: {
    title: "关于",
    eyebrow: "关于",
    heading: "Whiskeyi",
    heroImage: "/img/about/avatar.jpg",
    profileNote: "持续学习。:)",
    profileReadme: [
      {
        label: "方向",
        value: "AI 与全栈开发"
      }
    ],
    timelineEyebrow: "工作经历",
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
        title: "全栈 & Agent开发",
        company: "阿里巴巴集团 · 淘宝闪购",
        points: ["参与零售业务、AI Coding平台与商家端Agent研发"]
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

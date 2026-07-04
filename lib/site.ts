export const siteConfig = {
  name: "Whiskeyi's Blog",
  title: "Whiskeyi's Blog",
  author: "Whiskeyi",
  description: "前端工程、React、JavaScript 与系统化学习笔记。",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://blog.zhuchj.com",
  locale: "zh_CN",
  language: "zh-CN",
  navigation: [
    { href: "/", label: "首页" },
    { href: "/archive", label: "归档" },
    { href: "/about", label: "关于" }
  ],
  links: {
    github: "https://github.com/Whiskeyi",
    email: "zhuchjie@gmail.com"
  },
  home: {
    heroEyebrow: "Frontend / React / JavaScript",
    heroTitle: "Whiskeyi's Blog",
    feedEyebrowSuffix: "篇文章",
    feedTitle: "Latest Notes",
    feedDescription: "围绕前端工程、React、JavaScript 与系统化学习整理的长期笔记。",
    heroImages: [
      "/img/header_img/27.jpg",
      "/img/header_img/23.jpg",
      "/img/header_img/4.jpg",
      "/img/header_img/11.jpg",
      "/img/header_img/24.jpg",
      "/img/header_img/25.jpg",
      "/img/header_img/33.jpg",
      "/img/header_img/39.jpg",
      "/img/header_img/43.jpg"
    ]
  },
  about: {
    title: "关于",
    eyebrow: "About",
    heading: "Whiskeyi",
    description:
      "一个偏前端工程、React、JavaScript 与系统化学习记录的个人博客，专注把长期实践沉淀成清晰、可阅读的笔记。",
    heroImage: "/img/header_img/45.jpg",
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
};

export function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

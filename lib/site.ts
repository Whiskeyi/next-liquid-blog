export const siteConfig = {
  name: "Whiskeyi's Blog",
  author: "Whiskeyi",
  title: "Whiskeyi's Blog",
  description: "前端工程、React、JavaScript 与系统化学习笔记。",
  url: "https://zhuchj.com",
  email: "zhuchjie@gmail.com",
  github: "https://github.com/Whiskeyi"
};

export function withBasePath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}

import { BriefcaseBusiness, Code2, Mail } from "lucide-react";
import { WorkTimeline } from "@/components/work-timeline";
import { siteConfig, withBasePath } from "@/lib/site";

export const metadata = {
  title: "关于",
  description: `About ${siteConfig.author}`
};

const workTimeline = [
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
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBasePath("/img/header_img/45.jpg")} alt="" />
        <div className="about-copy">
          <span>About</span>
          <h1>{siteConfig.author}</h1>
          <p>
            一个偏前端工程、React、JavaScript 与系统化学习记录的个人博客，专注把长期实践沉淀成清晰、可阅读的笔记。
          </p>
          <div className="about-actions">
            <a href={siteConfig.github} target="_blank" rel="noreferrer">
              <Code2 size={18} />
              GitHub
            </a>
            <a href={`mailto:${siteConfig.email}`}>
              <Mail size={18} />
              Email
            </a>
          </div>
        </div>
      </section>
      <section className="about-timeline" aria-labelledby="work-timeline">
        <div className="about-timeline-head">
          <span>
            <BriefcaseBusiness size={18} />
            Work Timeline
          </span>
          <h2 id="work-timeline">工作经历</h2>
        </div>
        <WorkTimeline items={workTimeline} />
      </section>
    </main>
  );
}

import { BriefcaseBusiness, Code2, Mail } from "lucide-react";
import { WorkTimeline } from "@/components/work-timeline";
import { siteConfig, withBasePath } from "@/lib/site";

export const metadata = {
  title: siteConfig.about.title,
  description: `About ${siteConfig.author}`
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-copy">
          <span>{siteConfig.about.eyebrow}</span>
          <h1>{siteConfig.about.heading}</h1>
          <p className="about-note">{siteConfig.about.profileNote}</p>
          <div className="about-actions">
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              <Code2 size={18} />
              GitHub
            </a>
            <a href={`mailto:${siteConfig.links.email}`}>
              <Mail size={18} />
              Email
            </a>
          </div>
        </div>
        <div className="about-profile" aria-label="GitHub profile summary">
          <figure className="about-portrait" aria-label={`${siteConfig.author} GitHub 头像`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(siteConfig.about.heroImage)} alt="" width={460} height={460} decoding="async" />
          </figure>
          <dl className="about-readme">
            {siteConfig.about.profileReadme.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="about-timeline" aria-labelledby="work-timeline">
        <div className="about-timeline-head">
          <span>
            <BriefcaseBusiness size={18} />
            {siteConfig.about.timelineEyebrow}
          </span>
          <h2 id="work-timeline">{siteConfig.about.timelineTitle}</h2>
        </div>
        <WorkTimeline items={siteConfig.about.timeline} />
      </section>
    </main>
  );
}

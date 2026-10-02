"use client";

import { BriefcaseBusiness, Code2, Mail } from "lucide-react";
import { WorkTimeline } from "@/components/work-timeline";
import { useI18n } from "@/components/i18n-provider";
import { LocalizedPageTitle } from "@/components/localized";
import { localizedAbout } from "@/lib/i18n";
import { siteConfig, withBasePath } from "@/lib/site";

export function AboutContent() {
  const { locale, t } = useI18n();
  const about = localizedAbout[locale];

  return (
    <main className="about-page">
      <LocalizedPageTitle id="about" />
      <section className="about-hero">
        <div className="about-copy">
          <span>{about.eyebrow}</span>
          <h1>{about.heading}</h1>
          <p className="about-note">{about.profileNote}</p>
          <div className="about-actions">
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              <Code2 size={18} />
              GitHub
            </a>
            <a href={`mailto:${siteConfig.links.email}`}>
              <Mail size={18} />
              {t("email")}
            </a>
          </div>
        </div>
        <div className="about-profile" aria-label={t("profileSummary")}>
          <figure className="about-portrait" aria-label={t("avatar", { name: siteConfig.author })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBasePath(about.heroImage)} alt="" width={460} height={460} decoding="async" />
          </figure>
          <dl className="about-readme">
            {about.profileReadme.map((item) => (
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
            {about.timelineEyebrow}
          </span>
          <h2 id="work-timeline">{about.timelineTitle}</h2>
        </div>
        <WorkTimeline items={about.timeline} />
      </section>
    </main>
  );
}

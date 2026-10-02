import { AboutContent } from "@/components/about-content";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: siteConfig.about.title,
  description: `About ${siteConfig.author}`
};

export default function AboutPage() {
  return <AboutContent />;
}

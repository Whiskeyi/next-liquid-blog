import { PostTitle } from "@/components/localized-content";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeMotion } from "@/components/home-motion";
import { PostFeed } from "@/components/post-feed";
import { LocalizedRegion, LocalizedText } from "@/components/localized";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const latest = posts[0];

  return (
    <main>
      <section className="home-hero">
        <HomeMotion />
        <div className="hero-content">
          <div className="hero-grid">
            <LocalizedRegion as="figure" className="hero-visual" label="heroVisual">
              <HeroCarousel images={siteConfig.home.heroImages} />
              <div className="hero-copy">
                <span>{siteConfig.home.heroEyebrow}</span>
                <h1>{siteConfig.home.heroTitle}</h1>
                <p><LocalizedText id="description" /></p>
                {latest ? (
                  <Link className="hero-link" href={`/blog/${latest.slug}`}>
                    <PostTitle post={latest} />
                    <ArrowUpRight size={18} />
                  </Link>
                ) : null}
              </div>
            </LocalizedRegion>
          </div>
        </div>
      </section>

      <div className="page-shell">
        <section className="section-heading" aria-labelledby="latest-posts">
          <span>
            <LocalizedText id="postsCount" values={{ count: posts.length }} />
          </span>
          <h2 id="latest-posts"><LocalizedText id="latestNotes" /></h2>
          <p><LocalizedText id="feedDescription" /></p>
        </section>
        <PostFeed posts={posts} tags={tags} />
      </div>
    </main>
  );
}

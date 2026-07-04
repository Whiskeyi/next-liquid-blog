import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeMotion } from "@/components/home-motion";
import { PostFeed } from "@/components/post-feed";
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
            <figure className="hero-visual" aria-label="抽象玻璃建筑主视觉">
              <HeroCarousel images={siteConfig.home.heroImages} />
              <div className="hero-copy">
                <span>{siteConfig.home.heroEyebrow}</span>
                <h1>{siteConfig.home.heroTitle}</h1>
                <p>{siteConfig.description}</p>
                {latest ? (
                  <Link className="hero-link" href={`/blog/${latest.slug}`}>
                    {latest.title}
                    <ArrowUpRight size={18} />
                  </Link>
                ) : null}
              </div>
            </figure>
          </div>
        </div>
      </section>

      <div className="page-shell">
        <section className="section-heading" aria-labelledby="latest-posts">
          <span>
            {posts.length} {siteConfig.home.feedEyebrowSuffix}
          </span>
          <h2 id="latest-posts">{siteConfig.home.feedTitle}</h2>
          <p>{siteConfig.home.feedDescription}</p>
        </section>
        <PostFeed posts={posts} tags={tags} />
      </div>
    </main>
  );
}

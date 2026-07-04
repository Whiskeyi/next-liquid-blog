import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { PostFeed } from "@/components/post-feed";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

const heroImages = [
  "/img/header_img/4.jpg",
  "/img/header_img/39.jpg",
  "/img/header_img/27.jpg",
  "/img/header_img/16.jpg"
];

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const latest = posts[0];

  return (
    <main>
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-grid">
            <figure className="hero-visual" aria-label="抽象玻璃建筑主视觉">
              <HeroCarousel images={heroImages} />
              <div className="hero-copy">
                <span>Frontend / React / JavaScript</span>
                <h1>Whiskeyi&apos;s Blog</h1>
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
          <span>{posts.length} 篇文章</span>
          <h2 id="latest-posts">Latest Notes</h2>
          <p>围绕前端工程、React、JavaScript 与系统化学习整理的长期笔记。</p>
        </section>
        <PostFeed posts={posts} tags={tags} />
      </div>
    </main>
  );
}

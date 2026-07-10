import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye, Hash } from "lucide-react";
import { ArticleReadingTools } from "@/components/article-reading-tools";
import { ArticleToc } from "@/components/article-toc";
import { ImageZoomTrigger } from "@/components/image-with-zoom";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ViewCounter } from "@/components/view-counter";
import { getAbsolutePostUrl, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig, withBasePath } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const LEGACY_FEATURE_ARTICLE_SLUG = "2024-10-26-React19";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  const coverUrl = post.hasCover ? new URL(post.cover, siteConfig.url).toString() : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: getAbsolutePostUrl(post.slug)
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: getAbsolutePostUrl(post.slug),
      publishedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
      images: coverUrl ? [{ url: coverUrl }] : undefined
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const posts = getAllPosts();
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex >= 0 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const labels = Array.from(new Set([...post.categories, ...post.tags]));
  const heroClassName = ["article-hero", post.hasCover ? "article-hero-with-cover" : "article-hero-no-cover"].join(" ");
  const articleClassName = post.slug === LEGACY_FEATURE_ARTICLE_SLUG ? "article-feature" : "article-standard";
  const coverSizes =
    post.coverOrientation === "landscape"
      ? "(max-width: 760px) calc(100vw - 36px), (max-width: 1599px) 100vw, (max-width: 2879px) 1520px, 1920px"
      : "(max-width: 760px) calc(100vw - 36px), (max-width: 1599px) 42vw, (max-width: 2879px) 420px, 460px";

  return (
    <main className="article-page">
      <article className={articleClassName}>
        <header className={heroClassName} data-cover-orientation={post.coverOrientation}>
          {post.hasCover ? (
            <figure className="article-hero-image" aria-label={`${post.title} 封面图`}>
              <ImageZoomTrigger
                src={post.cover}
                alt={`${post.title} 封面图`}
                buttonClassName="article-hero-image-button"
                buttonLabel={`查看大图：${post.title} 封面图`}
              >
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  priority
                  loading="eager"
                  sizes={coverSizes}
                />
              </ImageZoomTrigger>
              <span className="article-hero-watermark" aria-hidden="true">
                <img src={withBasePath("/img/signature/signature.png")} alt="" />
              </span>
            </figure>
          ) : null}
          <div className="article-hero-content">
            <Link className="back-link" href="/">
              <ArrowLeft size={17} />
              返回首页
            </Link>
            <div className="article-meta">
              <span>
                <CalendarDays size={15} />
                {post.displayDate}
              </span>
              <span>
                <Clock3 size={15} />
                {post.readingMinutes} 分钟
              </span>
              <span>
                <Hash size={15} />
                {post.wordCount.toLocaleString("zh-CN")} 字
              </span>
              <span>
                <Eye size={15} />
                <ViewCounter /> 次阅读
              </span>
            </div>
            <h1>{post.title}</h1>
            {post.subtitle ? <p>{post.subtitle}</p> : null}
            <div className="article-tags">
              {labels.map((tag) => (
                <Link className="chip" href={`/tags/${encodeURIComponent(tag)}`} key={tag}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="article-layout">
          <ArticleToc headings={post.headings} />
          <div className="article-content">
            <MarkdownRenderer content={post.content} slug={post.slug} />
            {previousPost || nextPost ? (
              <nav className="article-neighbor-nav" aria-label="相邻文章">
                {previousPost ? (
                  <Link className="article-neighbor-link article-neighbor-link-prev" href={`/blog/${previousPost.slug}`}>
                    <span className="article-neighbor-direction">
                      <ArrowLeft size={16} />
                      上一篇
                    </span>
                    <strong>{previousPost.title}</strong>
                    <time dateTime={previousPost.date}>{previousPost.displayDate}</time>
                  </Link>
                ) : (
                  <span className="article-neighbor-empty" aria-hidden="true" />
                )}
                {nextPost ? (
                  <Link className="article-neighbor-link article-neighbor-link-next" href={`/blog/${nextPost.slug}`}>
                    <span className="article-neighbor-direction">
                      下一篇
                      <ArrowRight size={16} />
                    </span>
                    <strong>{nextPost.title}</strong>
                    <time dateTime={nextPost.date}>{nextPost.displayDate}</time>
                  </Link>
                ) : (
                  <span className="article-neighbor-empty" aria-hidden="true" />
                )}
              </nav>
            ) : null}
          </div>
        </div>
        <ArticleReadingTools headings={post.headings} />
      </article>
    </main>
  );
}

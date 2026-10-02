import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Eye, Hash } from "lucide-react";
import { ArticleReadingTools } from "@/components/article-reading-tools";
import { ArticleToc } from "@/components/article-toc";
import { ArticleCover } from "@/components/article-cover";
import { LocalizedDate, LocalizedRegion, LocalizedText } from "@/components/localized";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ViewCounter } from "@/components/view-counter";
import { getAbsolutePostUrl, getAllPosts, getPostBySlug } from "@/lib/posts";
import { ArticleLanguageNotice, ArticlePageTitle, LocalizedContent } from "@/components/localized-content";
import { localizePost } from "@/lib/post-localization";
import type { Post, PostMeta } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

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

  const english = getPostBySlug(slug, "en")!;
  const posts = getAllPosts();
  return (
    <LocalizedContent variants={{
      "zh-CN": await renderArticle(post, posts),
      en: await renderArticle(english, posts.map((item) => localizePost(item, "en")))
    }} />
  );
}

async function renderArticle(post: Post, posts: PostMeta[]) {
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const previousPost = currentIndex >= 0 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const labels = Array.from(new Set([...post.categories, ...post.tags]));
  const heroClassName = ["article-hero", post.hasCover ? "article-hero-with-cover" : "article-hero-no-cover"].join(" ");
  const articleClassName = post.slug === LEGACY_FEATURE_ARTICLE_SLUG ? "article-feature" : "article-standard";
  const coverSizes =
    post.coverOrientation === "landscape"
      ? "(max-width: 760px) calc(100vw - 36px), (max-width: 1599px) 100vw, (max-width: 2879px) 1680px, 2160px"
      : "(max-width: 760px) calc(100vw - 36px), (max-width: 1599px) 42vw, (max-width: 2879px) 420px, 460px";

  return (
    <main className="article-page">
      <ArticlePageTitle title={post.title} />
      <article className={articleClassName} lang={post.language}>
        <header className={heroClassName} data-cover-orientation={post.coverOrientation}>
          {post.hasCover ? (
            <ArticleCover
              post={{ title: post.title, cover: post.cover, coverWidth: post.coverWidth }}
              sizes={coverSizes}
            />
          ) : null}
          <div className="article-hero-content">
            <Link className="back-link" href="/">
              <ArrowLeft size={17} />
              <LocalizedText id="backHome" />
            </Link>
            <div className="article-meta">
              <span>
                <CalendarDays size={15} />
                <LocalizedDate date={post.date} />
              </span>
              <span>
                <Clock3 size={15} />
                <LocalizedText id="readingMinutes" values={{ count: post.readingMinutes }} />
              </span>
              <span>
                <Hash size={15} />
                <LocalizedText id="wordCount" values={{ count: post.wordCount }} />
              </span>
              <span>
                <Eye size={15} />
                <ViewCounter /> <LocalizedText id="views" />
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
            <ArticleLanguageNotice language={post.language} />
            <MarkdownRenderer content={post.content} slug={post.slug} />
            {previousPost || nextPost ? (
              <LocalizedRegion as="nav" className="article-neighbor-nav" label="neighbors">
                {previousPost ? (
                  <Link className="article-neighbor-link article-neighbor-link-prev" href={`/blog/${previousPost.slug}`}>
                    <span className="article-neighbor-direction">
                      <ArrowLeft size={16} />
                      <LocalizedText id="previousPost" />
                    </span>
                    <strong>{previousPost.title}</strong>
                    <LocalizedDate date={previousPost.date} />
                  </Link>
                ) : (
                  <span className="article-neighbor-empty" aria-hidden="true" />
                )}
                {nextPost ? (
                  <Link className="article-neighbor-link article-neighbor-link-next" href={`/blog/${nextPost.slug}`}>
                    <span className="article-neighbor-direction">
                      <LocalizedText id="nextPost" />
                      <ArrowRight size={16} />
                    </span>
                    <strong>{nextPost.title}</strong>
                    <LocalizedDate date={nextPost.date} />
                  </Link>
                ) : (
                  <span className="article-neighbor-empty" aria-hidden="true" />
                )}
              </LocalizedRegion>
            ) : null}
          </div>
        </div>
        <ArticleReadingTools headings={post.headings} />
      </article>
    </main>
  );
}

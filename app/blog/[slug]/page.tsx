import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Eye, Hash } from "lucide-react";
import { ArticleReadingTools } from "@/components/article-reading-tools";
import { ArticleToc } from "@/components/article-toc";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ViewCounter } from "@/components/view-counter";
import { getAbsolutePostUrl, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

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
      tags: post.tags
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const labels = Array.from(new Set([...post.categories, ...post.tags]));

  return (
    <main>
      <article>
        <header className="article-hero">
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
            <MarkdownRenderer content={post.content} />
          </div>
        </div>
        <ArticleReadingTools headings={post.headings} />
      </article>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type PageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const name = decodeURIComponent(tag);

  return {
    title: `${name} 标签`,
    description: `所有 ${name} 相关文章`
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = getPostsByTag(name);

  return (
    <main className="page-shell inner-page">
      <Link className="back-link dark" href="/">
        <ArrowLeft size={17} />
        返回首页
      </Link>
      <section className="section-heading">
        <span>Tag</span>
        <h1>{name}</h1>
        <p>共 {posts.length} 篇相关文章。</p>
      </section>
      <div className="post-grid compact">
        {posts.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </main>
  );
}

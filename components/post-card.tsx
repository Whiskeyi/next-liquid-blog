"use client";

import Link from "next/link";
import { Command } from "lucide-react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { glassStyle } from "@/components/glass-style";
import { PostMeta } from "@/lib/posts";
import { getShortcutLabel } from "@/lib/shortcuts";

type PostCardProps = {
  post: PostMeta;
  index?: number;
  shortcutActive?: boolean;
};

export function PostCard({ post, index = 0, shortcutActive = false }: PostCardProps) {
  const router = useRouter();
  const labels = Array.from(new Set([...post.categories, ...post.tags]));
  const href = `/blog/${post.slug}`;
  const shortcutLabel = getShortcutLabel(index);

  function openPost(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) return;
    router.push(href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter") return;
    router.push(href);
  }

  return (
    <article
      className="post-card"
      style={glassStyle}
      role="link"
      tabIndex={0}
      aria-label={`阅读 ${post.title}`}
      onClick={openPost}
      onKeyDown={handleKeyDown}
    >
      <div className="post-card-body">
        <div className="post-card-top">
          <div className="post-index" aria-hidden="true">
            {shortcutActive && shortcutLabel ? (
              <>
                <Command size={14} />
                {shortcutLabel}
              </>
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </div>
          <div className="post-meta">
            <span>{post.displayDate}</span>
            <span>{post.readingMinutes} 分钟</span>
          </div>
        </div>
        <h2>
          <Link href={href}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="post-card-footer">
          <div className="chip-row">
            {labels.slice(0, 2).map((tag) => (
              <Link className="chip" href={`/tags/${encodeURIComponent(tag)}`} key={`${post.slug}-${tag}`}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

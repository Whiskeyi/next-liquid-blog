"use client";

import Link from "next/link";
import Image from "next/image";
import { Command } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
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
  const leadLabel = labels[0] ?? "Note";
  const cardStyle = glassStyle as CSSProperties;
  const mediaStyle = { "--cover-aspect-ratio": post.coverAspectRatio } as CSSProperties;
  const cardClassName = [
    "post-card",
    `post-card-variant-${index % 6}`,
    post.hasCover ? "post-card-with-cover" : "post-card-no-cover"
  ].join(" ");
  const shortcut = shortcutActive && shortcutLabel ? (
    <>
      <Command size={14} />
      {shortcutLabel}
    </>
  ) : (
    String(index + 1).padStart(2, "0")
  );

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
      className={cardClassName}
      data-cover-orientation={post.coverOrientation}
      style={cardStyle}
      role="link"
      tabIndex={0}
      aria-label={`阅读 ${post.title}`}
      onClick={openPost}
      onKeyDown={handleKeyDown}
    >
      {post.hasCover ? (
        <div className="post-card-media" style={mediaStyle} aria-hidden="true">
          <Image
            src={post.cover}
            alt=""
            fill
            sizes="(max-width: 640px) calc((100vw - 40px) / 2), (max-width: 920px) calc((100vw - 46px) / 2), 350px"
          />
          <div className="post-card-media-shade" />
          <div className="post-index">{shortcut}</div>
        </div>
      ) : null}
      <div className="post-card-body">
        {!post.hasCover ? (
          <div className="post-card-note-head">
            <div className="post-index" aria-hidden="true">
              {shortcut}
            </div>
            <span>{leadLabel}</span>
          </div>
        ) : (
          <div className="post-card-kicker">
            <span>{leadLabel}</span>
            <span>{post.readingMinutes} 分钟</span>
          </div>
        )}
        <h2>
          <Link href={href}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="post-card-footer">
          <time dateTime={post.date}>{post.displayDate}</time>
          <div className="chip-row">
            {labels.slice(post.hasCover ? 1 : 0, post.hasCover ? 3 : 2).map((tag) => (
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

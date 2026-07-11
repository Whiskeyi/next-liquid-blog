"use client";

import Link from "next/link";
import Image from "next/image";
import { Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { glassStyle } from "@/components/glass-style";
import type { PostMeta } from "@/lib/posts";
import { getShortcutLabel } from "@/lib/shortcuts";

const CARD_VARIANT_COUNT = 6;
const COVERED_CARD_VISIBLE_LABELS = 2;
const TEXT_CARD_VISIBLE_LABELS = 2;
const CARD_INDEX_PAD_LENGTH = 2;
const POST_CARD_IMAGE_SIZES =
  "(max-width: 640px) calc((100vw - 40px) / 2), (max-width: 920px) calc((100vw - 46px) / 2), (min-width: 2880px) 420px, (min-width: 1600px) 410px, 350px";

type PostCardProps = {
  post: PostMeta;
  index?: number;
  shortcutActive?: boolean;
};

export function PostCard({ post, index = 0, shortcutActive = false }: PostCardProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const labels = Array.from(new Set([...post.categories, ...post.tags]));
  const href = `/blog/${post.slug}`;
  const shortcutLabel = getShortcutLabel(index);
  const leadLabel = labels[0] ?? "Note";
  const cardStyle = glassStyle as CSSProperties;
  const mediaStyle = { "--cover-aspect-ratio": post.coverAspectRatio } as CSSProperties;
  const cardClassName = [
    "post-card",
    `post-card-variant-${index % CARD_VARIANT_COUNT}`,
    post.hasCover ? "post-card-with-cover" : "post-card-no-cover"
  ].join(" ");
  const visibleLabelStart = post.hasCover ? 1 : 0;
  const visibleLabelEnd = post.hasCover ? COVERED_CARD_VISIBLE_LABELS + 1 : TEXT_CARD_VISIBLE_LABELS;
  const shortcut = shortcutActive && shortcutLabel ? (
    <>
      <Command size={14} />
      {shortcutLabel}
    </>
  ) : (
    String(index + 1).padStart(CARD_INDEX_PAD_LENGTH, "0")
  );

  function markPending() {
    setPending(true);
  }

  function openPost(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a")) return;
    markPending();
    router.push(href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter") return;
    markPending();
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
      data-pending={pending}
      onClick={openPost}
      onKeyDown={handleKeyDown}
    >
      {post.hasCover ? (
        <div className="post-card-media" style={mediaStyle} data-loaded={imageLoaded} aria-hidden="true">
          <Image
            src={post.cover}
            alt=""
            fill
            sizes={POST_CARD_IMAGE_SIZES}
            loading={index < 5 ? "eager" : "lazy"}
            fetchPriority={index < 2 ? "high" : "auto"}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
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
          <Link href={href} onClick={markPending}>
            {post.title}
          </Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="post-card-footer">
          <time dateTime={post.date}>{post.displayDate}</time>
          <div className="chip-row">
            {labels.slice(visibleLabelStart, visibleLabelEnd).map((tag) => (
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

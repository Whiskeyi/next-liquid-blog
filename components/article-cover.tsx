"use client";

import { useI18n } from "@/components/i18n-provider";
import { ImageZoomTrigger } from "@/components/image-with-zoom";
import { ResponsiveImage } from "@/components/responsive-image";
import type { PostMeta } from "@/lib/posts";
import { withBasePath } from "@/lib/site";

type ArticleCoverProps = {
  post: Pick<PostMeta, "title" | "cover" | "coverWidth">;
  sizes: string;
};

export function ArticleCover({ post, sizes }: ArticleCoverProps) {
  const { t } = useI18n();
  const alt = t("cover", { title: post.title });

  return (
    <figure className="article-hero-image" aria-label={alt}>
      <ImageZoomTrigger
        src={post.cover}
        alt={alt}
        buttonClassName="article-hero-image-button"
      >
        <ResponsiveImage
          src={post.cover}
          sourceWidth={post.coverWidth}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes={sizes}
        />
      </ImageZoomTrigger>
      <span className="article-hero-watermark" aria-hidden="true">
        <img src={withBasePath("/img/signature/signature.png")} alt="" />
      </span>
    </figure>
  );
}

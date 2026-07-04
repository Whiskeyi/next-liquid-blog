"use client";

import { X } from "lucide-react";
import { useState } from "react";

type ImageWithZoomProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export function ImageWithZoom({ src, alt = "", ...props }: ImageWithZoomProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="article-image-button" type="button" onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />
      </button>
      {open ? (
        <div className="image-lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <button className="lightbox-close" type="button" aria-label="关闭图片预览">
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
        </div>
      ) : null}
    </>
  );
}

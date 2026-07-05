"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ImageWithZoomProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

const lightboxGlassStyle: React.CSSProperties = {
  backdropFilter: "blur(12px) saturate(140%)",
  WebkitBackdropFilter: "blur(12px) saturate(140%)"
};

const lightboxCloseStyle: React.CSSProperties = {
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)"
};

export function ImageWithZoom({ src, alt = "", ...props }: ImageWithZoomProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const lightbox =
    open && mounted
      ? createPortal(
          <div
            className="image-lightbox"
            role="dialog"
            aria-modal="true"
            style={lightboxGlassStyle}
            onClick={() => setOpen(false)}
          >
            <button
              className="lightbox-close"
              type="button"
              aria-label="关闭图片预览"
              style={lightboxCloseStyle}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button className="article-image-button" type="button" onClick={() => setOpen(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />
      </button>
      {lightbox}
    </>
  );
}

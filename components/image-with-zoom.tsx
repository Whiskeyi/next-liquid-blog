"use client";

import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ImageWithZoomProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

type ImageZoomTriggerProps = {
  src: string;
  alt?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  children: ReactNode;
};

type ImageTransform = {
  scale: number;
  x: number;
  y: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

const MIN_SCALE = 0.6;
const DEFAULT_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.1;
const WHEEL_SCALE_STEP = 0.04;
const PINCH_SENSITIVITY = 0.58;
const DOUBLE_CLICK_SCALE = 1.35;

const defaultTransform: ImageTransform = {
  scale: DEFAULT_SCALE,
  x: 0,
  y: 0
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getDistance = (first: PointerPosition, second: PointerPosition) =>
  Math.hypot(first.x - second.x, first.y - second.y);

const lightboxGlassStyle: React.CSSProperties = {
  backdropFilter: "blur(12px) saturate(140%)",
  WebkitBackdropFilter: "blur(12px) saturate(140%)"
};

const lightboxCloseStyle: React.CSSProperties = {
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)"
};

const parseImageDimension = (value: React.ImgHTMLAttributes<HTMLImageElement>["width"]) => {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : null;
  if (typeof value !== "string") return null;

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

function getImageAspectRatio(
  width: React.ImgHTMLAttributes<HTMLImageElement>["width"],
  height: React.ImgHTMLAttributes<HTMLImageElement>["height"]
) {
  const parsedWidth = parseImageDimension(width);
  const parsedHeight = parseImageDimension(height);

  if (!parsedWidth || !parsedHeight) return undefined;

  return `${parsedWidth} / ${parsedHeight}`;
}

export function ImageZoomTrigger({
  src,
  alt = "",
  buttonClassName = "article-image-button",
  buttonLabel = "查看大图",
  children
}: ImageZoomTriggerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [transform, setTransform] = useState<ImageTransform>(defaultTransform);
  const transformRef = useRef<ImageTransform>(defaultTransform);
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const panPointRef = useRef<PointerPosition | null>(null);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const didMoveRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyTransform = useCallback((updater: ImageTransform | ((current: ImageTransform) => ImageTransform)) => {
    setTransform((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE);
      const normalized = scale <= DEFAULT_SCALE ? { scale, x: 0, y: 0 } : { scale, x: next.x, y: next.y };

      transformRef.current = normalized;
      return normalized;
    });
  }, []);

  const resetTransform = useCallback(() => {
    pointersRef.current.clear();
    panPointRef.current = null;
    pinchStartRef.current = null;
    didMoveRef.current = false;
    applyTransform(defaultTransform);
  }, [applyTransform]);

  const zoomBy = useCallback(
    (delta: number) => {
      applyTransform((current) => ({
        ...current,
        scale: current.scale + delta
      }));
    },
    [applyTransform]
  );

  useEffect(() => {
    if (open) {
      resetTransform();
    }
  }, [open, resetTransform]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "0") {
        resetTransform();
      } else if (event.key === "+" || event.key === "=") {
        zoomBy(SCALE_STEP);
      } else if (event.key === "-") {
        zoomBy(-SCALE_STEP);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, resetTransform, zoomBy]);

  const getPointerList = () => Array.from(pointersRef.current.values());

  const startPinch = () => {
    const [first, second] = getPointerList();

    if (!first || !second) return;

    pinchStartRef.current = {
      distance: getDistance(first, second),
      scale: transformRef.current.scale
    };
    panPointRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      panPointRef.current = { x: event.clientX, y: event.clientY };
      pinchStartRef.current = null;
      didMoveRef.current = false;
    } else if (pointersRef.current.size === 2) {
      didMoveRef.current = true;
      startPinch();
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    event.preventDefault();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const [first, second] = getPointerList();
      if (!first || !second || pinchStartRef.current.distance === 0) return;

      didMoveRef.current = true;
      const pinchRatio = getDistance(first, second) / pinchStartRef.current.distance;
      const nextScale = pinchStartRef.current.scale * (1 + (pinchRatio - 1) * PINCH_SENSITIVITY);
      applyTransform((current) => ({
        ...current,
        scale: nextScale
      }));
      return;
    }

    if (transformRef.current.scale <= DEFAULT_SCALE || !panPointRef.current) return;

    const deltaX = event.clientX - panPointRef.current.x;
    const deltaY = event.clientY - panPointRef.current.y;

    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
      didMoveRef.current = true;
    }

    panPointRef.current = { x: event.clientX, y: event.clientY };
    applyTransform((current) => ({
      ...current,
      x: current.x + deltaX,
      y: current.y + deltaY
    }));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointersRef.current.delete(event.pointerId);
    pinchStartRef.current = null;

    const [remainingPointer] = getPointerList();
    panPointRef.current = remainingPointer ?? null;
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    zoomBy(event.deltaY > 0 ? -WHEEL_SCALE_STEP : WHEEL_SCALE_STEP);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    event.stopPropagation();
    applyTransform(transformRef.current.scale === DEFAULT_SCALE ? { scale: DOUBLE_CLICK_SCALE, x: 0, y: 0 } : defaultTransform);
  };

  const handleLightboxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (didMoveRef.current) {
      didMoveRef.current = false;
      return;
    }

    setOpen(false);
  };

  const lightbox =
    open && mounted
      ? createPortal(
          <div
            className="image-lightbox"
            data-zoomed={transform.scale > DEFAULT_SCALE}
            role="dialog"
            aria-modal="true"
            style={lightboxGlassStyle}
            onClick={handleLightboxClick}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
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
            <div
              className="lightbox-controls"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onWheel={(event) => event.stopPropagation()}
            >
              <button className="lightbox-control" type="button" aria-label="缩小图片" onClick={() => zoomBy(-SCALE_STEP)}>
                <Minus size={18} />
              </button>
              <button className="lightbox-control" type="button" aria-label="重置图片" onClick={resetTransform}>
                <RotateCcw size={17} />
              </button>
              <button className="lightbox-control" type="button" aria-label="放大图片" onClick={() => zoomBy(SCALE_STEP)}>
                <Plus size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="lightbox-image"
              src={src}
              alt={alt}
              draggable={false}
              style={{
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`
              }}
              onClick={(event) => event.stopPropagation()}
              onDoubleClick={handleDoubleClick}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button className={buttonClassName} type="button" aria-label={buttonLabel} onClick={() => setOpen(true)}>
        {children}
      </button>
      {lightbox}
    </>
  );
}

export function ImageWithZoom({ src, alt = "", loading, decoding, onLoad, onError, style, ...props }: ImageWithZoomProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const aspectRatio = getImageAspectRatio(props.width, props.height);

  useEffect(() => {
    setEnhanced(true);

    const image = imageRef.current;

    if (!image) return;

    const syncImageStatus = () => {
      if (image.complete && image.naturalWidth > 0) {
        setStatus("loaded");
      } else if (image.complete) {
        setStatus("error");
      } else {
        setStatus("loading");
      }
    };
    const handleNativeLoad = () => setStatus("loaded");
    const handleNativeError = () => setStatus("error");
    const frameId = window.requestAnimationFrame(syncImageStatus);

    image.addEventListener("load", handleNativeLoad);
    image.addEventListener("error", handleNativeError);
    syncImageStatus();

    return () => {
      window.cancelAnimationFrame(frameId);
      image.removeEventListener("load", handleNativeLoad);
      image.removeEventListener("error", handleNativeError);
    };
  }, [src]);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus("loaded");
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus("error");
    onError?.(event);
  };

  return (
    <ImageZoomTrigger src={src} alt={alt} buttonLabel={alt ? `查看大图：${alt}` : "查看大图"}>
      <span
        className="article-image-frame"
        data-enhanced={enhanced ? "true" : "false"}
        data-has-ratio={aspectRatio ? "true" : "false"}
        data-status={status}
        style={{ aspectRatio }}
      >
        <span className="article-image-placeholder" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...props}
          ref={imageRef}
          src={src}
          alt={alt}
          loading={loading ?? "lazy"}
          decoding={decoding ?? "async"}
          style={style}
          onLoad={handleLoad}
          onError={handleError}
        />
        <span className="article-image-error" role="status">
          图片加载失败
        </span>
      </span>
    </ImageZoomTrigger>
  );
}

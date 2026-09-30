"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { flushSync } from "react-dom";
import { ResponsiveImage } from "@/components/responsive-image";
import { getResponsiveImageProps } from "@/lib/image-variants";

type HeroCarouselImage = {
  src: string;
  width: number;
  height: number;
};

type HeroCarouselProps = {
  images: HeroCarouselImage[];
};

type SwipeStart = {
  x: number;
  y: number;
  pointerId: number;
  width: number;
};

type SlideDirection = "next" | "previous";
type ImageLayer = "active" | "previous" | "peek" | "idle";

const SLIDE_INTERVAL_MS = 8000;
const HERO_IMAGE_SIZES =
  "(min-width: 2880px) 2160px, (min-width: 1744px) 1680px, (min-width: 1600px) calc(100vw - 64px), (min-width: 1168px) 1120px, (max-width: 640px) calc(100vw - 28px), calc(100vw - 48px)";
const TOUCH_SWIPE = {
  minDistancePx: 72,
  minDistanceRatio: 0.18,
  axisRatio: 1.18,
  settleDurationMs: 500,
  resetDurationMs: 340
} as const;
const DESKTOP_PARALLAX = {
  maxOffsetPx: 14,
  pointerCenterRatio: 0.5,
  easingFactor: 0.14,
  settleThreshold: 0.02
} as const;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const parallaxFrameRef = useRef<number | null>(null);
  const dragAnimationFrameRef = useRef<number | null>(null);
  const parallaxTargetRef = useRef({ x: 0, y: 0 });
  const parallaxCurrentRef = useRef({ x: 0, y: 0 });
  const swipeStartRef = useRef<SwipeStart | null>(null);
  const dragPreviewOffsetRef = useRef(0);
  const touchSettlingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("next");
  const [dragPreviewOffset, setDragPreviewOffset] = useState(0);
  const [isTouchInteracting, setIsTouchInteracting] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isTouchInteracting || prefersReducedMotion()) return;

    const timer = window.setTimeout(() => {
      const carousel = carouselRef.current;
      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      if (carousel && isMobile && !touchSettlingRef.current) {
        commitTouchSlide(carousel, 1);
        return;
      }

      moveSlide(1);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, images.length, isTouchInteracting]);

  useEffect(() => {
    return () => {
      if (parallaxFrameRef.current !== null) window.cancelAnimationFrame(parallaxFrameRef.current);
      if (dragAnimationFrameRef.current !== null) window.cancelAnimationFrame(dragAnimationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setTimeout(() => {
      const nextImage = images[(activeIndex + 1) % images.length];
      const source = getResponsiveImageProps(nextImage.src, nextImage.width);
      const preload = new window.Image();
      preload.decoding = "async";
      preload.sizes = HERO_IMAGE_SIZES;
      if (source.srcSet) preload.srcset = source.srcSet;
      preload.src = source.src;
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeIndex, images]);

  function updateParallaxTarget(x: number, y: number) {
    if (prefersReducedMotion()) return;

    parallaxTargetRef.current = { x, y };
    if (parallaxFrameRef.current !== null) return;

    function renderFrame() {
      const carousel = carouselRef.current;
      if (!carousel) {
        parallaxFrameRef.current = null;
        return;
      }

      const current = parallaxCurrentRef.current;
      const target = parallaxTargetRef.current;
      const next = {
        x: current.x + (target.x - current.x) * DESKTOP_PARALLAX.easingFactor,
        y: current.y + (target.y - current.y) * DESKTOP_PARALLAX.easingFactor
      };
      const settled =
        Math.abs(target.x - next.x) < DESKTOP_PARALLAX.settleThreshold &&
        Math.abs(target.y - next.y) < DESKTOP_PARALLAX.settleThreshold;

      parallaxCurrentRef.current = settled ? target : next;
      carousel.style.setProperty("--hero-x", String(settled ? target.x : next.x));
      carousel.style.setProperty("--hero-y", String(settled ? target.y : next.y));

      if (settled) {
        parallaxFrameRef.current = null;
      } else {
        parallaxFrameRef.current = window.requestAnimationFrame(renderFrame);
      }
    }

    parallaxFrameRef.current = window.requestAnimationFrame(renderFrame);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      const swipeStart = swipeStartRef.current;
      if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      if (Math.abs(deltaX) <= Math.abs(deltaY) * TOUCH_SWIPE.axisRatio) return;

      const dragX = Math.max(-swipeStart.width, Math.min(swipeStart.width, deltaX));
      const previewOffset = deltaX > 0 ? -1 : 1;
      if (dragPreviewOffsetRef.current !== previewOffset) {
        dragPreviewOffsetRef.current = previewOffset;
        setDragPreviewOffset(previewOffset);
      }
      event.currentTarget.setAttribute("data-dragging", "true");
      event.currentTarget.setAttribute("data-drag-direction", previewOffset > 0 ? "next" : "previous");
      event.currentTarget.style.setProperty("--hero-drag-x", `${dragX}px`);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x =
      ((event.clientX - rect.left) / rect.width - DESKTOP_PARALLAX.pointerCenterRatio) *
      DESKTOP_PARALLAX.maxOffsetPx;
    const y =
      ((event.clientY - rect.top) / rect.height - DESKTOP_PARALLAX.pointerCenterRatio) *
      DESKTOP_PARALLAX.maxOffsetPx;
    updateParallaxTarget(x, y);
  }

  function resetParallax() {
    updateParallaxTarget(0, 0);
  }

  function finishTouchDrag(target: HTMLDivElement) {
    touchSettlingRef.current = false;
    dragPreviewOffsetRef.current = 0;
    setDragPreviewOffset(0);
    setIsTouchInteracting(false);
    target.removeAttribute("data-dragging");
    target.removeAttribute("data-drag-direction");
    target.removeAttribute("data-settling");
    target.style.setProperty("--hero-drag-x", "0px");
  }

  function animateTouchDrag(target: HTMLDivElement, x: number, durationMs: number, onComplete: () => void) {
    if (dragAnimationFrameRef.current !== null) window.cancelAnimationFrame(dragAnimationFrameRef.current);

    if (prefersReducedMotion()) {
      target.style.setProperty("--hero-drag-x", `${x}px`);
      onComplete();
      return;
    }

    const startX = Number.parseFloat(target.style.getPropertyValue("--hero-drag-x")) || 0;
    const startedAt = performance.now();

    function renderFrame(now: number) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      target.style.setProperty("--hero-drag-x", `${startX + (x - startX) * eased}px`);

      if (progress < 1) {
        dragAnimationFrameRef.current = window.requestAnimationFrame(renderFrame);
        return;
      }

      dragAnimationFrameRef.current = null;
      onComplete();
    }

    dragAnimationFrameRef.current = window.requestAnimationFrame(renderFrame);
  }

  function resetTouchDrag(target: HTMLDivElement) {
    if (dragPreviewOffsetRef.current === 0) {
      finishTouchDrag(target);
      return;
    }

    touchSettlingRef.current = true;
    target.removeAttribute("data-dragging");
    target.setAttribute("data-settling", "true");
    animateTouchDrag(target, 0, TOUCH_SWIPE.resetDurationMs, () => finishTouchDrag(target));
  }

  function finishCommittedTouchDrag(target: HTMLDivElement, offset: number) {
    target.style.setProperty("--hero-drag-x", "0px");
    flushSync(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + offset + images.length) % images.length;
        setPreviousIndex(nextIndex);
        return nextIndex;
      });
      dragPreviewOffsetRef.current = 0;
      setDragPreviewOffset(0);
      setIsTouchInteracting(false);
    });
    touchSettlingRef.current = false;
    target.removeAttribute("data-dragging");
    target.removeAttribute("data-drag-direction");
    target.removeAttribute("data-settling");
  }

  function moveSlide(offset: number) {
    if (images.length <= 1) return;

    setSlideDirection(offset > 0 ? "next" : "previous");
    setActiveIndex((current) => {
      const nextIndex = (current + offset + images.length) % images.length;
      if (nextIndex === current) return current;

      setPreviousIndex(current);
      return nextIndex;
    });
  }

  function selectSlide(index: number) {
    if (touchSettlingRef.current) return;

    setActiveIndex((current) => {
      if (index === current) return current;

      setSlideDirection(index > current ? "next" : "previous");
      setPreviousIndex(current);
      return index;
    });
  }

  function releaseSwipeCapture(target: HTMLDivElement, pointerId: number) {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }

  function commitTouchSlide(target: HTMLDivElement, offset: number) {
    if (images.length <= 1) {
      resetTouchDrag(target);
      return;
    }

    const direction = offset > 0 ? "next" : "previous";
    const travelX = offset > 0 ? -target.clientWidth : target.clientWidth;

    touchSettlingRef.current = true;
    target.removeAttribute("data-dragging");
    target.setAttribute("data-settling", "true");
    target.setAttribute("data-drag-direction", direction);
    flushSync(() => {
      setSlideDirection(direction);

      if (dragPreviewOffsetRef.current !== offset) {
        dragPreviewOffsetRef.current = offset;
        setDragPreviewOffset(offset);
      }
    });

    animateTouchDrag(target, travelX, TOUCH_SWIPE.settleDurationMs, () =>
      finishCommittedTouchDrag(target, offset)
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    if (event.target instanceof Element && event.target.closest(".hero-carousel-progress")) return;
    if (touchSettlingRef.current) return;

    if (dragAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAnimationFrameRef.current);
      dragAnimationFrameRef.current = null;
    }
    dragPreviewOffsetRef.current = 0;
    setDragPreviewOffset(0);
    setIsTouchInteracting(true);
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      width: event.currentTarget.clientWidth
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const swipeStart = swipeStartRef.current;
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

    swipeStartRef.current = null;
    releaseSwipeCapture(event.currentTarget, event.pointerId);

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const minDistance = Math.max(
      TOUCH_SWIPE.minDistancePx,
      swipeStart.width * TOUCH_SWIPE.minDistanceRatio
    );
    const isHorizontalSwipe =
      Math.abs(deltaX) >= minDistance &&
      Math.abs(deltaX) > Math.abs(deltaY) * TOUCH_SWIPE.axisRatio;
    if (!isHorizontalSwipe) {
      resetTouchDrag(event.currentTarget);
      return;
    }

    commitTouchSlide(event.currentTarget, deltaX < 0 ? 1 : -1);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (swipeStartRef.current?.pointerId === event.pointerId) {
      swipeStartRef.current = null;
      releaseSwipeCapture(event.currentTarget, event.pointerId);
      resetTouchDrag(event.currentTarget);
    }
  }

  function getWrappedIndex(index: number) {
    return (index + images.length) % images.length;
  }

  const dragPreviewIndex = images.length > 1 ? getWrappedIndex(activeIndex + dragPreviewOffset) : activeIndex;
  const showTransitionPrevious = images.length > 1 && previousIndex !== activeIndex;
  const showDragPreview = images.length > 1 && dragPreviewOffset !== 0;

  function getImageLayer(index: number): ImageLayer {
    if (index === activeIndex) return "active";
    if (showDragPreview && index === dragPreviewIndex) return "peek";
    if (showTransitionPrevious && index === previousIndex) return "previous";
    return "idle";
  }

  return (
    <div
      ref={carouselRef}
      className="hero-carousel"
      aria-label="首页主视觉轮播图"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={resetParallax}
    >
      {images.map((image, index) => {
        const layer = getImageLayer(index);
        if (layer === "idle") return null;

        const isPeek = layer === "peek";
        const direction = isPeek
          ? dragPreviewOffset > 0
            ? "next"
            : "previous"
          : layer === "active" || layer === "previous"
            ? slideDirection
            : undefined;

        return (
          <ResponsiveImage
            key={image.src}
            src={image.src}
            sourceWidth={image.width}
            alt=""
            data-layer={layer}
            data-direction={direction}
            data-animated={layer === "active" && showTransitionPrevious}
            sizes={HERO_IMAGE_SIZES}
            decoding="async"
            draggable={false}
            fetchPriority={index === 0 && activeIndex === 0 ? "high" : "auto"}
            loading="eager"
          />
        );
      })}
      <div className="hero-carousel-progress">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`切换到第 ${index + 1} 张轮播图`}
            aria-current={index === activeIndex}
            data-active={index === activeIndex}
            onClick={() => selectSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

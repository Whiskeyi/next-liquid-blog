"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { withBasePath } from "@/lib/site";

type HeroCarouselProps = {
  images: string[];
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
const TOUCH_SWIPE = {
  minDistancePx: 72,
  minDistanceRatio: 0.18,
  axisRatio: 1.18,
  settleDurationSeconds: 0.5,
  resetDurationSeconds: 0.34
} as const;
const DESKTOP_PARALLAX = {
  maxOffsetPx: 14,
  pointerCenterRatio: 0.5,
  easingDurationSeconds: 0.8
} as const;

export function HeroCarousel({ images }: HeroCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const moveXRef = useRef<((value: number) => void) | null>(null);
  const moveYRef = useRef<((value: number) => void) | null>(null);
  const swipeStartRef = useRef<SwipeStart | null>(null);
  const dragPreviewOffsetRef = useRef(0);
  const touchSettlingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("next");
  const [dragPreviewOffset, setDragPreviewOffset] = useState(0);
  const [isTouchInteracting, setIsTouchInteracting] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isTouchInteracting) return;

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
    const carousel = carouselRef.current;
    if (!carousel) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    moveXRef.current = gsap.quickTo(carousel, "--hero-x", {
      duration: DESKTOP_PARALLAX.easingDurationSeconds,
      ease: "power3.out"
    });
    moveYRef.current = gsap.quickTo(carousel, "--hero-y", {
      duration: DESKTOP_PARALLAX.easingDurationSeconds,
      ease: "power3.out"
    });

    return () => {
      moveXRef.current = null;
      moveYRef.current = null;
    };
  }, []);

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
    moveXRef.current?.(x);
    moveYRef.current?.(y);
  }

  function resetParallax() {
    moveXRef.current?.(0);
    moveYRef.current?.(0);
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

  function animateTouchDrag(target: HTMLDivElement, x: number, duration: number, onComplete: () => void) {
    gsap.killTweensOf(target, "--hero-drag-x");
    gsap.to(target, {
      "--hero-drag-x": `${x}px`,
      duration,
      ease: "power3.out",
      overwrite: "auto",
      onComplete
    });
  }

  function resetTouchDrag(target: HTMLDivElement) {
    if (dragPreviewOffsetRef.current === 0) {
      finishTouchDrag(target);
      return;
    }

    touchSettlingRef.current = true;
    target.removeAttribute("data-dragging");
    target.setAttribute("data-settling", "true");
    animateTouchDrag(target, 0, TOUCH_SWIPE.resetDurationSeconds, () => finishTouchDrag(target));
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

    animateTouchDrag(target, travelX, TOUCH_SWIPE.settleDurationSeconds, () =>
      finishCommittedTouchDrag(target, offset)
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    if (event.target instanceof Element && event.target.closest(".hero-carousel-progress")) return;
    if (touchSettlingRef.current) return;

    gsap.killTweensOf(event.currentTarget, "--hero-drag-x");
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
        const isPeek = layer === "peek";
        const direction = isPeek
          ? dragPreviewOffset > 0
            ? "next"
            : "previous"
          : layer === "active" || layer === "previous"
            ? slideDirection
            : undefined;

        return (
          <img
            key={image}
            src={withBasePath(image)}
            alt=""
            data-layer={layer}
            data-direction={direction}
            data-animated={layer === "active" && showTransitionPrevious}
            decoding="async"
            draggable={false}
            fetchPriority={index === 0 ? "high" : "auto"}
            loading="eager"
          />
        );
      })}
      <div className="hero-carousel-progress">
        {images.map((image, index) => (
          <button
            key={image}
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

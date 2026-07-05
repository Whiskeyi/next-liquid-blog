"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { gsap } from "gsap";
import { withBasePath } from "@/lib/site";

type HeroCarouselProps = {
  images: string[];
};

type SwipeStart = {
  x: number;
  y: number;
  pointerId: number;
};

const SLIDE_INTERVAL_MS = 8000;
const TOUCH_SWIPE = {
  minDistancePx: 44,
  axisRatio: 1.25,
  dragLimitPx: 56,
  dragDamping: 0.28,
  resetDurationSeconds: 0.36
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current);
        return (current + 1) % images.length;
      });
    }, SLIDE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, images.length]);

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

      const dragX = Math.max(
        -TOUCH_SWIPE.dragLimitPx,
        Math.min(TOUCH_SWIPE.dragLimitPx, deltaX * TOUCH_SWIPE.dragDamping)
      );
      event.currentTarget.setAttribute("data-dragging", "true");
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

  function resetTouchDrag(target: HTMLDivElement) {
    target.removeAttribute("data-dragging");
    gsap.to(target, {
      "--hero-drag-x": 0,
      duration: TOUCH_SWIPE.resetDurationSeconds,
      ease: "power3.out"
    });
  }

  function moveSlide(offset: number) {
    if (images.length <= 1) return;

    setActiveIndex((current) => {
      const nextIndex = (current + offset + images.length) % images.length;
      if (nextIndex === current) return current;

      setPreviousIndex(current);
      return nextIndex;
    });
  }

  function selectSlide(index: number) {
    setActiveIndex((current) => {
      if (index === current) return current;

      setPreviousIndex(current);
      return index;
    });
  }

  function releaseSwipeCapture(target: HTMLDivElement, pointerId: number) {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    if (event.target instanceof Element && event.target.closest(".hero-carousel-progress")) return;

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const swipeStart = swipeStartRef.current;
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

    swipeStartRef.current = null;
    releaseSwipeCapture(event.currentTarget, event.pointerId);
    resetTouchDrag(event.currentTarget);

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= TOUCH_SWIPE.minDistancePx &&
      Math.abs(deltaX) > Math.abs(deltaY) * TOUCH_SWIPE.axisRatio;
    if (!isHorizontalSwipe) return;

    moveSlide(deltaX < 0 ? 1 : -1);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (swipeStartRef.current?.pointerId === event.pointerId) {
      swipeStartRef.current = null;
      releaseSwipeCapture(event.currentTarget, event.pointerId);
      resetTouchDrag(event.currentTarget);
    }
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
      <img src={withBasePath(images[previousIndex])} alt="" data-layer="previous" />
      <img key={images[activeIndex]} src={withBasePath(images[activeIndex])} alt="" data-layer="active" />
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

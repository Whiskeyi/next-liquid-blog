"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { gsap } from "gsap";
import { withBasePath } from "@/lib/site";

type HeroCarouselProps = {
  images: string[];
};

const SLIDE_INTERVAL_MS = 8000;
const SWIPE_DISTANCE_PX = 44;
const SWIPE_AXIS_RATIO = 1.25;

export function HeroCarousel({ images }: HeroCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const moveXRef = useRef<((value: number) => void) | null>(null);
  const moveYRef = useRef<((value: number) => void) | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
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
      duration: 0.8,
      ease: "power3.out"
    });
    moveYRef.current = gsap.quickTo(carousel, "--hero-y", {
      duration: 0.8,
      ease: "power3.out"
    });

    return () => {
      moveXRef.current = null;
      moveYRef.current = null;
    };
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    moveXRef.current?.(x);
    moveYRef.current?.(y);
  }

  function resetParallax() {
    moveXRef.current?.(0);
    moveYRef.current?.(0);
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

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch") return;
    if (event.target instanceof Element && event.target.closest(".hero-carousel-progress")) return;

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId
    };
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const swipeStart = swipeStartRef.current;
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;

    swipeStartRef.current = null;

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const isHorizontalSwipe = Math.abs(deltaX) >= SWIPE_DISTANCE_PX && Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_AXIS_RATIO;
    if (!isHorizontalSwipe) return;

    moveSlide(deltaX < 0 ? 1 : -1);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (swipeStartRef.current?.pointerId === event.pointerId) {
      swipeStartRef.current = null;
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

"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { gsap } from "gsap";
import { withBasePath } from "@/lib/site";

type HeroCarouselProps = {
  images: string[];
};

const SLIDE_INTERVAL_MS = 8000;

export function HeroCarousel({ images }: HeroCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const moveXRef = useRef<((value: number) => void) | null>(null);
  const moveYRef = useRef<((value: number) => void) | null>(null);
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

  function selectSlide(index: number) {
    setActiveIndex((current) => {
      if (index === current) return current;

      setPreviousIndex(current);
      return index;
    });
  }

  return (
    <div
      ref={carouselRef}
      className="hero-carousel"
      aria-label="首页主视觉轮播图"
      onPointerMove={handlePointerMove}
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

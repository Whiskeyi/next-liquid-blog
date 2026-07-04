"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/site";

type HeroCarouselProps = {
  images: string[];
};

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        setPreviousIndex(current);
        return (current + 1) % images.length;
      });
    }, 5200);

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="hero-carousel" aria-hidden="true">
      <img src={withBasePath(images[previousIndex])} alt="" data-layer="previous" />
      <img key={images[activeIndex]} src={withBasePath(images[activeIndex])} alt="" data-layer="active" />
    </div>
  );
}

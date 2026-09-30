"use client";

import { useEffect } from "react";

const entranceTiming: KeyframeAnimationOptions = {
  duration: 620,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  fill: "backwards"
};

export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations: Animation[] = [];
    const heroVisual = document.querySelector<HTMLElement>(".hero-visual");
    const heroCopyItems = document.querySelectorAll<HTMLElement>(".hero-copy > *");
    const feedHeading = document.querySelector<HTMLElement>(".home-hero + .page-shell .section-heading");

    if (heroVisual) {
      animations.push(
        heroVisual.animate(
          [
            { transform: "translateY(18px) scale(0.985)", opacity: 0 },
            { transform: "translateY(0) scale(1)", opacity: 1 }
          ],
          entranceTiming
        )
      );
    }

    heroCopyItems.forEach((element, index) => {
      animations.push(
        element.animate(
          [
            { transform: "translateY(18px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 }
          ],
          { ...entranceTiming, duration: 520, delay: 80 + index * 70 }
        )
      );
    });

    const observer = feedHeading
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            animations.push(
              feedHeading.animate(
                [
                  { transform: "translateY(28px)", opacity: 0 },
                  { transform: "translateY(0)", opacity: 1 }
                ],
                entranceTiming
              )
            );
            observer?.disconnect();
          },
          { rootMargin: "0px 0px -12%" }
        )
      : null;

    if (feedHeading) observer?.observe(feedHeading);

    return () => {
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return null;
}

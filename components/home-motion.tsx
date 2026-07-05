"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HomeMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;

    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>(".home-hero");
      const heroVisual = hero?.querySelector<HTMLElement>(".hero-visual");
      const heroCopyItems = gsap.utils.toArray<HTMLElement>(".hero-copy > *");
      const feedHeading = document.querySelector<HTMLElement>(".home-hero + .page-shell .section-heading");

      if (!hero || !heroVisual) return;
      const heroElement = hero;
      const heroVisualElement = heroVisual;

      function createHeroScrollMotion() {
        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: heroElement,
            start: "top top",
            end: "120% top",
            scrub: 1.15
          }
        });

        heroTimeline
          .to(heroVisualElement, { yPercent: -6, scale: 0.94, opacity: 0, ease: "none" }, 0)
          .to(heroCopyItems, { y: -58, opacity: 0.18, ease: "none", stagger: 0.025 }, 0);
      }

      const introTimeline = gsap.timeline({ onComplete: createHeroScrollMotion });

      introTimeline.fromTo(
        heroVisualElement,
        { y: 18, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.72, ease: "power3.out" }
      );

      if (heroCopyItems.length) {
        introTimeline.fromTo(
          heroCopyItems,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.52, ease: "power3.out", stagger: 0.07 },
          0.08
        );
      }

      if (feedHeading) {
        gsap.fromTo(
          feedHeading,
          { y: 72, opacity: 0, scale: 0.975 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: feedHeading,
              start: "top 96%",
              end: "top 58%",
              scrub: 0.45
            }
          }
        );
      }
    });

    return () => context.revert();
  }, []);

  return null;
}

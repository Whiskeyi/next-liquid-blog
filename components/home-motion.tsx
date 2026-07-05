"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HomeMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>(".home-hero");
      const heroVisual = hero?.querySelector<HTMLElement>(".hero-visual");
      const heroCopyItems = gsap.utils.toArray<HTMLElement>(".hero-copy > *");
      const feedHeading = document.querySelector<HTMLElement>(".home-hero + .page-shell .section-heading");

      if (!hero || !heroVisual) return;

      gsap.fromTo(
        heroVisual,
        { y: 18, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.72, ease: "power3.out" }
      );

      if (heroCopyItems.length) {
        gsap.fromTo(
          heroCopyItems,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.52, ease: "power3.out", stagger: 0.07, delay: 0.08 }
        );
      }

      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "120% top",
          scrub: 1.15
        }
      });

      heroTimeline
        .to(heroVisual, { yPercent: -6, scale: 0.94, ease: "none" }, 0)
        .to(heroCopyItems, { y: -58, opacity: 0.18, ease: "none", stagger: 0.025 }, 0);

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

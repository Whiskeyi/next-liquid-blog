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
      gsap.to(".home-hero .hero-visual", {
        scale: 0.985,
        opacity: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: ".home-hero",
          start: "top top",
          end: "42% top",
          scrub: 0.25
        }
      });
    });

    return () => context.revert();
  }, []);

  return null;
}

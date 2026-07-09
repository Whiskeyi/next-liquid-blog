"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const nav = document.querySelector<HTMLElement>(".glass-nav");
      const page = document.querySelector<HTMLElement>("main");

      if (page) {
        gsap.fromTo(page, { y: 8, opacity: 0.96 }, { y: 0, opacity: 1, duration: 0.24, ease: "power2.out" });
      }

      if (nav) {
        gsap.fromTo(
          nav,
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.52, ease: "power3.out" }
        );
      }

      gsap.utils
        .toArray<HTMLElement>(
          ".archive-overview, .archive-year, .about-hero, .about-timeline-head, .article-hero-content, .article-toc, .article-content"
        )
        .forEach((element) => {
          gsap.fromTo(
            element,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.42,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true
              }
            }
          );
        });

      const archiveItems = gsap.utils.toArray<HTMLElement>(".archive-item");
      if (archiveItems.length) {
        ScrollTrigger.batch(archiveItems, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.38, ease: "power2.out", stagger: 0.03 }
            );
          }
        });
      }

    });

    return () => {
      context.revert();
    };
  }, [pathname]);

  return null;
}

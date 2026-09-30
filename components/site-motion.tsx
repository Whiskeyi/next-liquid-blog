"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector =
  ".archive-overview, .archive-year, .about-hero, .about-timeline-head, .article-hero-content, .article-toc, .article-content, .archive-item";

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations: Animation[] = [];
    const page = document.querySelector<HTMLElement>("main");
    const nav = document.querySelector<HTMLElement>(".glass-nav");

    if (page) {
      animations.push(
        page.animate(
          [
            { transform: "translateY(8px)", opacity: 0.96 },
            { transform: "translateY(0)", opacity: 1 }
          ],
          { duration: 240, easing: "ease-out", fill: "backwards" }
        )
      );
    }

    if (nav) {
      animations.push(
        nav.animate(
          [
            { transform: "translateY(-14px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 }
          ],
          { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
        )
      );
    }

    const revealElements = [...document.querySelectorAll<HTMLElement>(revealSelector)];
    const archiveIndexes = new Map(
      revealElements
        .filter((element) => element.classList.contains("archive-item"))
        .map((element, index) => [element, index])
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          const archiveIndex = archiveIndexes.get(element) ?? 0;
          animations.push(
            element.animate(
              [
                { transform: "translateY(16px)", opacity: 0 },
                { transform: "translateY(0)", opacity: 1 }
              ],
              {
                duration: 400,
                delay: Math.min(archiveIndex, 8) * 24,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "backwards"
              }
            )
          );
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -10%" }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}

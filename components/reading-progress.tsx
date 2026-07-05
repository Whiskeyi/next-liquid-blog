"use client";

import { useEffect, useRef } from "react";

const PERCENT_MAX = 100;
const INITIAL_SCALE_X = 0;

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateProgress() {
      const progressElement = progressRef.current;

      if (!progressElement) {
        return;
      }

      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(PERCENT_MAX, (scrollTop / height) * PERCENT_MAX) : 0;

      progressElement.style.transform = `scaleX(${progress / PERCENT_MAX})`;
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return <div ref={progressRef} className="reading-progress" style={{ transform: `scaleX(${INITIAL_SCALE_X})` }} />;
}

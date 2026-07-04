"use client";

import { useEffect, useRef } from "react";

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
      const progress = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;

      progressElement.style.transform = `scaleX(${progress / 100})`;
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return <div ref={progressRef} className="reading-progress" style={{ transform: "scaleX(0)" }} />;
}

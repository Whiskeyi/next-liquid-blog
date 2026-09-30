"use client";

import { useEffect, useRef } from "react";

const PERCENT_MAX = 100;
const INITIAL_SCALE_X = 0;

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;

    function updateProgress() {
      frameId = 0;
      const progressElement = progressRef.current;

      if (!progressElement) {
        return;
      }

      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(PERCENT_MAX, (scrollTop / height) * PERCENT_MAX) : 0;

      progressElement.style.transform = `scaleX(${progress / PERCENT_MAX})`;
    }

    function requestProgressUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, []);

  return <div ref={progressRef} className="reading-progress" style={{ transform: `scaleX(${INITIAL_SCALE_X})` }} />;
}

"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type TimelineItem = {
  period: string;
  title: string;
  company: string;
  points: string[];
};

type WorkTimelineProps = {
  items: TimelineItem[];
};

type TimelineStyle = CSSProperties & {
  "--timeline-progress": string;
};

export function WorkTimeline({ items }: WorkTimelineProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef("0%");
  const visibleItemsRef = useRef<Set<number>>(new Set([0]));
  const [visibleItems, setVisibleItems] = useState<Set<number>>(() => new Set([0]));
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState("0%");

  useEffect(() => {
    function commitActiveIndex(index: number) {
      if (activeIndexRef.current === index) return;
      activeIndexRef.current = index;
      setActiveIndex(index);
    }

    function commitVisibleItem(index: number) {
      if (visibleItemsRef.current.has(index)) return;
      const next = new Set(visibleItemsRef.current);
      next.add(index);
      visibleItemsRef.current = next;
      setVisibleItems(next);
    }

    function commitAllVisible() {
      if (visibleItemsRef.current.size === items.length) return;
      const next = new Set(items.map((_, index) => index));
      visibleItemsRef.current = next;
      setVisibleItems(next);
    }

    function updateProgress() {
      const list = listRef.current;
      if (!list) return;

      const rect = list.getBoundingClientRect();
      const viewportAnchor = window.innerHeight * 0.72;
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentBottom = document.documentElement.scrollHeight - 2;
      const atDocumentBottom = scrollBottom >= documentBottom;
      const raw = atDocumentBottom ? 1 : (viewportAnchor - rect.top) / Math.max(rect.height, 1);
      const clamped = Math.min(1, Math.max(0, raw));
      const nextProgress = `${Math.round(clamped * 100)}%`;
      if (progressRef.current !== nextProgress) {
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      }

      if (atDocumentBottom || clamped > 0.96) {
        commitActiveIndex(items.length - 1);
        commitAllVisible();
      }
    }

    function requestProgressUpdate() {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        updateProgress();
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!entry.isIntersecting) return;

          commitActiveIndex(index);
          commitVisibleItem(index);
        });
      },
      { rootMargin: "-24% 0px -46% 0px", threshold: 0.25 }
    );

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, [items]);

  return (
    <div className="timeline-list" ref={listRef} style={{ "--timeline-progress": progress } as TimelineStyle}>
      {items.map((item, index) => (
        <article
          className="timeline-item"
          data-index={index}
          data-active={activeIndex === index}
          data-visible={visibleItems.has(index)}
          key={`${item.period}-${item.company}`}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
        >
          <time>{item.period}</time>
          <div>
            <h3>{item.title}</h3>
            <p>{item.company}</p>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}

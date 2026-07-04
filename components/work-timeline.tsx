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
  const [visibleItems, setVisibleItems] = useState<Set<number>>(() => new Set([0]));
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState("0%");

  useEffect(() => {
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
      setProgress(`${clamped * 100}%`);

      if (atDocumentBottom || clamped > 0.96) {
        setActiveIndex(items.length - 1);
        setVisibleItems(new Set(items.map((_, index) => index)));
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!entry.isIntersecting) return;

          setActiveIndex(index);
          setVisibleItems((current) => {
            const next = new Set(current);
            next.add(index);
            return next;
          });
        });
      },
      { rootMargin: "-30% 0px -38% 0px", threshold: 0.2 }
    );

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
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

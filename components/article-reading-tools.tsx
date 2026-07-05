"use client";

import { ArrowUp, ListTree, Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";

const READER_SCALE_CSS_VARIABLE = "--reader-scale";
const READER_FONT_SCALE = {
  default: 1,
  min: 0.92,
  max: 1.18,
  step: 0.04,
  precision: 2
} as const;
const ACTIVE_HEADING_OBSERVER_OPTIONS = {
  rootMargin: "-18% 0px -68% 0px",
  threshold: [0, 1]
} satisfies IntersectionObserverInit;
const READER_BAR_ICON_SIZE = 17;
const CLOSE_ICON_SIZE = 18;

type ArticleReadingToolsProps = {
  headings: Heading[];
};

export function ArticleReadingTools({ headings }: ArticleReadingToolsProps) {
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState<number>(READER_FONT_SCALE.default);

  useEffect(() => {
    document.documentElement.style.setProperty(READER_SCALE_CSS_VARIABLE, fontScale.toString());
    return () => {
      document.documentElement.style.removeProperty(READER_SCALE_CSS_VARIABLE);
    };
  }, [fontScale]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!headings.length) return;

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!headingElements.length) return;

    function activate(id: string) {
      document.querySelectorAll(".article-toc a, .mobile-toc-drawer a").forEach((link) => {
        link.toggleAttribute("aria-current", link.getAttribute("href") === `#${id}`);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible?.target.id) activate(visible.target.id);
      },
      ACTIVE_HEADING_OBSERVER_OPTIONS
    );

    headingElements.forEach((heading) => observer.observe(heading));
    activate(headingElements[0].id);

    return () => observer.disconnect();
  }, [headings]);

  function changeFont(delta: number) {
    setFontScale((current) =>
      Math.min(
        READER_FONT_SCALE.max,
        Math.max(READER_FONT_SCALE.min, Number((current + delta).toFixed(READER_FONT_SCALE.precision)))
      )
    );
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!headings.length) {
    return (
      <div className="mobile-reader-bar">
        <button type="button" onClick={() => changeFont(-READER_FONT_SCALE.step)} aria-label="缩小字号">
          <Minus size={READER_BAR_ICON_SIZE} />
        </button>
        <button type="button" onClick={() => changeFont(READER_FONT_SCALE.step)} aria-label="放大字号">
          <Plus size={READER_BAR_ICON_SIZE} />
        </button>
        <button type="button" onClick={scrollTop} aria-label="回到顶部">
          <ArrowUp size={READER_BAR_ICON_SIZE} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-reader-bar">
        <button type="button" onClick={() => setOpen(true)} aria-label="打开目录">
          <ListTree size={READER_BAR_ICON_SIZE} />
        </button>
        <button type="button" onClick={() => changeFont(-READER_FONT_SCALE.step)} aria-label="缩小字号">
          <Minus size={READER_BAR_ICON_SIZE} />
        </button>
        <button type="button" onClick={() => changeFont(READER_FONT_SCALE.step)} aria-label="放大字号">
          <Plus size={READER_BAR_ICON_SIZE} />
        </button>
        <button type="button" onClick={scrollTop} aria-label="回到顶部">
          <ArrowUp size={READER_BAR_ICON_SIZE} />
        </button>
      </div>

      <div className="mobile-toc-overlay" data-open={open} onClick={() => setOpen(false)} />
      <aside
        className="mobile-toc-drawer"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="移动端文章目录"
      >
        <div className="mobile-toc-head">
          <span>目录</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="关闭目录">
            <X size={CLOSE_ICON_SIZE} />
          </button>
        </div>
        <nav>
          {headings.map((heading) => (
            <a
              key={`${heading.id}-${heading.text}`}
              href={`#${heading.id}`}
              data-depth={heading.depth}
              onClick={() => setOpen(false)}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}

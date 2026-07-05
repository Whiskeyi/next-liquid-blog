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
const ACTIVE_HEADING_OFFSET = 128;
const ARTICLE_BOTTOM_OFFSET = 24;
const ACTIVE_TOC_SCROLL_PADDING = 16;
const TOC_LINK_SELECTOR = ".article-toc a, .mobile-toc-drawer a";
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

    const articleBody = document.querySelector(".markdown-body");

    function keepLinkVisible(link: Element) {
      if (!(link instanceof HTMLElement)) return;

      const container = link.closest<HTMLElement>(".article-toc, .mobile-toc-drawer");
      if (!container?.clientHeight || container.scrollHeight <= container.clientHeight) return;

      const linkRect = link.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const topOverflow = linkRect.top - containerRect.top - ACTIVE_TOC_SCROLL_PADDING;
      const bottomOverflow = linkRect.bottom - containerRect.bottom + ACTIVE_TOC_SCROLL_PADDING;

      if (topOverflow < 0) {
        container.scrollTop += topOverflow;
      } else if (bottomOverflow > 0) {
        container.scrollTop += bottomOverflow;
      }
    }

    function activate(id: string) {
      document.querySelectorAll(TOC_LINK_SELECTOR).forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          link.setAttribute("aria-current", "true");
          keepLinkVisible(link);
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    let frameId = 0;

    function updateActiveHeading() {
      frameId = 0;

      const articleBottom = articleBody?.getBoundingClientRect().bottom ?? document.documentElement.scrollHeight;
      const reachedArticleBottom = articleBottom <= window.innerHeight + ARTICLE_BOTTOM_OFFSET;
      const activeHeading = reachedArticleBottom
        ? headingElements[headingElements.length - 1]
        : headingElements.reduce((current, heading) => {
            return heading.getBoundingClientRect().top <= ACTIVE_HEADING_OFFSET ? heading : current;
          }, headingElements[0]);

      activate(activeHeading.id);
    }

    function requestActiveHeadingUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActiveHeading);
    }

    const mutationObserver = new MutationObserver(requestActiveHeadingUpdate);
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(requestActiveHeadingUpdate);

    window.addEventListener("scroll", requestActiveHeadingUpdate, { passive: true });
    window.addEventListener("resize", requestActiveHeadingUpdate);
    window.addEventListener("hashchange", requestActiveHeadingUpdate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    if (articleBody) resizeObserver?.observe(articleBody);
    requestActiveHeadingUpdate();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestActiveHeadingUpdate);
      window.removeEventListener("resize", requestActiveHeadingUpdate);
      window.removeEventListener("hashchange", requestActiveHeadingUpdate);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [headings, open]);

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

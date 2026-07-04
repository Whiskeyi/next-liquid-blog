"use client";

import { ArrowUp, ListTree, Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Heading } from "@/lib/posts";

type ArticleReadingToolsProps = {
  headings: Heading[];
};

export function ArticleReadingTools({ headings }: ArticleReadingToolsProps) {
  const [open, setOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    document.documentElement.style.setProperty("--reader-scale", fontScale.toString());
    return () => {
      document.documentElement.style.removeProperty("--reader-scale");
    };
  }, [fontScale]);

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
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: [0, 1]
      }
    );

    headingElements.forEach((heading) => observer.observe(heading));
    activate(headingElements[0].id);

    return () => observer.disconnect();
  }, [headings]);

  function changeFont(delta: number) {
    setFontScale((current) => Math.min(1.18, Math.max(0.92, Number((current + delta).toFixed(2)))));
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!headings.length) {
    return (
      <div className="mobile-reader-bar">
        <button type="button" onClick={() => changeFont(-0.04)} aria-label="缩小字号">
          <Minus size={17} />
        </button>
        <button type="button" onClick={() => changeFont(0.04)} aria-label="放大字号">
          <Plus size={17} />
        </button>
        <button type="button" onClick={scrollTop} aria-label="回到顶部">
          <ArrowUp size={17} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-reader-bar">
        <button type="button" onClick={() => setOpen(true)} aria-label="打开目录">
          <ListTree size={17} />
        </button>
        <button type="button" onClick={() => changeFont(-0.04)} aria-label="缩小字号">
          <Minus size={17} />
        </button>
        <button type="button" onClick={() => changeFont(0.04)} aria-label="放大字号">
          <Plus size={17} />
        </button>
        <button type="button" onClick={scrollTop} aria-label="回到顶部">
          <ArrowUp size={17} />
        </button>
      </div>

      <div className="mobile-toc-overlay" data-open={open} onClick={() => setOpen(false)} />
      <aside className="mobile-toc-drawer" data-open={open} aria-label="移动端文章目录">
        <div className="mobile-toc-head">
          <span>目录</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="关闭目录">
            <X size={18} />
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

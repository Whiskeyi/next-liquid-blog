"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Heading } from "@/lib/posts";
import { softGlassStyle } from "@/components/glass-style";

type ArticleTocProps = {
  headings: Heading[];
};

export function ArticleToc({ headings }: ArticleTocProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!headings.length) return null;

  return (
    <aside className="article-toc" data-collapsed={collapsed} style={softGlassStyle} aria-label="文章目录">
      <div className="toc-head">
        {collapsed ? null : <div className="toc-title">目录</div>}
        <button
          className="toc-toggle"
          type="button"
          aria-label={collapsed ? "展开目录" : "收起目录"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {!collapsed ? (
        <nav>
          {headings.map((heading) => (
            <a key={`${heading.id}-${heading.text}`} href={`#${heading.id}`} data-depth={heading.depth}>
              {heading.text}
            </a>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}

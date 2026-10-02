"use client";

import { useI18n } from "@/components/i18n-provider";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Heading } from "@/lib/posts";
import { softGlassStyle } from "@/components/glass-style";

type ArticleTocProps = {
  headings: Heading[];
};

export function ArticleToc({ headings }: ArticleTocProps) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  if (!headings.length) return null;

  return (
    <aside className="article-toc" data-collapsed={collapsed} style={softGlassStyle} aria-label={t("articleToc")}>
      <div className="toc-head">
        {collapsed ? null : <div className="toc-title">{t("toc")}</div>}
        <button
          className="toc-toggle"
          type="button"
          aria-label={t(collapsed ? "expandToc" : "collapseToc")}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {!collapsed ? (
        <nav>
          {headings.map((heading) => (
            <a
              key={`${heading.id}-${heading.text}`}
              href={`#${heading.id}`}
              data-depth={heading.depth}
              title={heading.text}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}

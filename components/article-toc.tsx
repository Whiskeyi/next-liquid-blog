import { Heading } from "@/lib/posts";
import { softGlassStyle } from "@/components/glass-style";

type ArticleTocProps = {
  headings: Heading[];
};

export function ArticleToc({ headings }: ArticleTocProps) {
  if (!headings.length) return null;

  return (
    <aside className="article-toc" style={softGlassStyle} aria-label="文章目录">
      <div className="toc-title">目录</div>
      <nav>
        {headings.map((heading) => (
          <a key={`${heading.id}-${heading.text}`} href={`#${heading.id}`} data-depth={heading.depth}>
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

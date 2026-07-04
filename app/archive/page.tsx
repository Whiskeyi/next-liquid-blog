import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getArchiveGroups } from "@/lib/posts";

export const metadata = {
  title: "归档",
  description: "按年份浏览所有文章"
};

export default function ArchivePage() {
  const groups = getArchiveGroups();
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));
  const total = years.reduce((sum, year) => sum + groups[year].length, 0);

  return (
    <main className="page-shell inner-page archive-page">
      <section className="section-heading">
        <span>Archive</span>
        <h1>归档</h1>
        <p>按年份整理的技术笔记索引。</p>
      </section>

      <div className="archive-overview">
        <strong>{total}</strong>
        <span>notes across</span>
        <strong>{years.length}</strong>
        <span>years</span>
      </div>

      <div className="archive-list">
        {years.map((year) => (
          <section className="archive-year" key={year}>
            <div className="archive-year-label">
              <h2>{year}</h2>
              <span>{groups[year].length} 篇</span>
            </div>
            <div className="archive-items">
              {groups[year].map((post, index) => (
                <Link className="archive-item" href={`/blog/${post.slug}`} key={post.slug}>
                  <time>{post.displayDate.slice(5)}</time>
                  <div>
                    <strong>{post.title}</strong>
                    <span>{[...post.categories, ...post.tags].slice(0, 2).join(" / ") || "Note"}</span>
                  </div>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

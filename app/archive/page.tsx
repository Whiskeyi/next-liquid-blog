import { PostTitle } from "@/components/localized-content";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getArchiveGroups } from "@/lib/posts";
import { LocalizedPageTitle, LocalizedText } from "@/components/localized";

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
      <LocalizedPageTitle id="archive" />
      <section className="section-heading">
        <span>Archive</span>
        <h1><LocalizedText id="archive" /></h1>
        <p><LocalizedText id="archiveDescription" /></p>
      </section>

      <div className="archive-overview">
        <strong>{total}</strong>
        <span><LocalizedText id="archiveNotesAcross" /></span>
        <strong>{years.length}</strong>
        <span><LocalizedText id="years" /></span>
      </div>

      <div className="archive-list">
        {years.map((year) => (
          <section className="archive-year" key={year}>
            <div className="archive-year-label">
              <h2>{year}</h2>
              <span><LocalizedText id="postsCount" values={{ count: groups[year].length }} /></span>
            </div>
            <div className="archive-items">
              {groups[year].map((post, index) => (
                <Link className="archive-item" href={`/blog/${post.slug}`} key={post.slug}>
                  <time>{post.displayDate.slice(5)}</time>
                  <div>
                    <strong><PostTitle post={post} /></strong>
                    <span>{[...post.categories, ...post.tags].slice(0, 2).join(" / ") || <LocalizedText id="note" />}</span>
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

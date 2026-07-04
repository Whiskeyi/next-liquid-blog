"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { glassStyle } from "@/components/glass-style";
import { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { getShortcutIndex } from "@/lib/shortcuts";

type TagOption = {
  name: string;
  count: number;
};

type PostFeedProps = {
  posts: PostMeta[];
  tags: TagOption[];
};

export function PostFeed({ posts, tags }: PostFeedProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");
  const [columnCount, setColumnCount] = useState(3);
  const [modifierDown, setModifierDown] = useState(false);

  useEffect(() => {
    function updateColumnCount() {
      if (window.matchMedia("(max-width: 640px)").matches) {
        setColumnCount(1);
      } else if (window.matchMedia("(max-width: 920px)").matches) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    }

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return posts.filter((post) => {
      const tagsText = [...post.tags, ...post.categories].join(" ");
      const matchesQuery =
        !keyword ||
        `${post.title} ${post.subtitle} ${post.excerpt} ${tagsText}`.toLowerCase().includes(keyword);
      const matchesTag =
        activeTag === "全部" || post.tags.includes(activeTag) || post.categories.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [activeTag, posts, query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const modifierPressed = event.metaKey || event.ctrlKey;
      setModifierDown(modifierPressed);
      if (!modifierPressed) return;

      const index = getShortcutIndex(event.key);
      const post = filteredPosts[index];
      if (!post) return;

      event.preventDefault();
      router.push(`/blog/${post.slug}`);
    }

    function handleKeyUp(event: KeyboardEvent) {
      setModifierDown(event.metaKey || event.ctrlKey);
    }

    function handleBlur() {
      setModifierDown(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [filteredPosts, router]);

  const columns = useMemo(() => {
    const nextColumns = Array.from({ length: columnCount }, () => [] as { post: PostMeta; index: number }[]);
    filteredPosts.forEach((post, index) => {
      nextColumns[index % columnCount].push({ post, index });
    });
    return nextColumns;
  }, [columnCount, filteredPosts]);

  return (
    <section className="feed-section" aria-label="文章列表">
      <div className="feed-toolbar" style={glassStyle}>
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="搜索文章、标签或摘要"
          />
        </label>
        <div className="filter-label">
          <SlidersHorizontal size={17} />
          {filteredPosts.length} 篇
        </div>
      </div>

      <div className="tag-filter" aria-label="标签筛选">
        {["全部", ...tags.map((tag) => tag.name)].map((tag) => (
          <button
            key={tag}
            className="chip"
            type="button"
            data-active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
            {tag !== "全部" ? <span>{tags.find((item) => item.name === tag)?.count}</span> : null}
          </button>
        ))}
      </div>

      <div className="post-grid">
        {columns.map((column, columnIndex) => (
          <div className="post-column" key={`column-${columnIndex}`}>
            {column.map(({ post, index }) => (
              <PostCard key={post.slug} post={post} index={index} shortcutActive={modifierDown} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

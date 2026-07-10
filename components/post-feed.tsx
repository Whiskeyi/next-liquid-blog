"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { glassStyle } from "@/components/glass-style";
import type { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { getShortcutIndex } from "@/lib/shortcuts";

const ALL_TAG_LABEL = "全部";
const INITIAL_POST_COUNT = 12;
const POSTS_PER_BATCH = 6;
const LOAD_MORE_DELAY_MS = 260;
const LOAD_MORE_ROOT_MARGIN = "900px 0px";
const RESPONSIVE_COLUMNS = [
  { mediaQuery: "(max-width: 420px)", count: 1 },
  { mediaQuery: "(max-width: 920px)", count: 2 },
  { mediaQuery: "(min-width: 2880px)", count: 5 },
  { mediaQuery: "(min-width: 1600px)", count: 4 }
] as const;
const DEFAULT_COLUMN_COUNT = 3;
const POST_CARD_WEIGHT = {
  landscape: {
    base: 0.7,
    featured: 0.92,
    featuredEvery: 4,
    featuredRemainder: 3
  },
  portrait: {
    base: 1.2,
    featured: 1.34,
    featuredEvery: 3,
    featuredRemainder: 2
  },
  square: 1,
  none: 0.95,
  titleDivisor: 34,
  titleMax: 0.5,
  excerptDivisor: 180,
  excerptMax: 0.42
} as const;

type TagOption = {
  name: string;
  count: number;
};

type PostColumnItem = {
  post: PostMeta;
  index: number;
};

type PostFeedProps = {
  posts: PostMeta[];
  tags: TagOption[];
};

export function PostFeed({ posts, tags }: PostFeedProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(ALL_TAG_LABEL);
  const [columnCount, setColumnCount] = useState(DEFAULT_COLUMN_COUNT);
  const [modifierDown, setModifierDown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_POST_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    function updateColumnCount() {
      const matchedColumn = RESPONSIVE_COLUMNS.find(({ mediaQuery }) => window.matchMedia(mediaQuery).matches);
      setColumnCount(matchedColumn?.count ?? DEFAULT_COLUMN_COUNT);
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
        activeTag === ALL_TAG_LABEL || post.tags.includes(activeTag) || post.categories.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [activeTag, posts, query]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);
  const hasMorePosts = visibleCount < filteredPosts.length;

  const loadMorePosts = useCallback(() => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(filteredPosts.length, count + POSTS_PER_BATCH));
      setIsLoadingMore(false);
      loadMoreTimeoutRef.current = undefined;
    }, LOAD_MORE_DELAY_MS);
  }, [filteredPosts.length, isLoadingMore]);

  useEffect(() => {
    if (loadMoreTimeoutRef.current) {
      window.clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = undefined;
    }
    setIsLoadingMore(false);
    setVisibleCount(Math.min(filteredPosts.length, INITIAL_POST_COUNT));
  }, [activeTag, filteredPosts.length, query]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) window.clearTimeout(loadMoreTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMorePosts || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loadMorePosts();
      },
      { rootMargin: LOAD_MORE_ROOT_MARGIN }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMorePosts, isLoadingMore, loadMorePosts]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const modifierPressed = event.metaKey || event.ctrlKey;
      setModifierDown(modifierPressed);
      if (!modifierPressed) return;
      if (isEditableTarget(event.target)) return;

      const index = getShortcutIndex(event.key);
      const post = visiblePosts[index];
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
  }, [router, visiblePosts]);

  const columns = useMemo(() => {
    const nextColumns = Array.from({ length: columnCount }, () => [] as PostColumnItem[]);
    const columnHeights = Array.from({ length: columnCount }, () => 0);

    visiblePosts.forEach((post, index) => {
      const targetColumn = columnHeights.indexOf(Math.min(...columnHeights));
      nextColumns[targetColumn].push({ post, index });
      columnHeights[targetColumn] += getPostCardWeight(post, index);
    });

    return nextColumns;
  }, [columnCount, visiblePosts]);

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
        {[ALL_TAG_LABEL, ...tags.map((tag) => tag.name)].map((tag) => (
          <button
            key={tag}
            className="chip"
            type="button"
            data-active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
            {tag !== ALL_TAG_LABEL ? <span>{tags.find((item) => item.name === tag)?.count}</span> : null}
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
      {isLoadingMore ? (
        <div className="post-grid post-grid-skeleton" aria-hidden="true">
          {Array.from({ length: Math.min(POSTS_PER_BATCH, filteredPosts.length - visibleCount) }).map((_, index) => (
            <div className="post-card post-card-skeleton" key={`post-skeleton-${visibleCount + index}`}>
              <div className="post-card-body">
                <div className="post-card-top">
                  <span className="skeleton-line short" />
                  <span className="skeleton-line meta" />
                </div>
                <span className="skeleton-line title" />
                <span className="skeleton-line" />
                <span className="skeleton-line narrow" />
                <span className="skeleton-line tiny" />
                <div className="post-card-footer">
                  <span className="skeleton-pill" />
                  <span className="skeleton-pill small" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {hasMorePosts ? <div className="post-feed-sentinel" ref={sentinelRef} aria-hidden="true" /> : null}
    </section>
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function getPostCardWeight(post: PostMeta, index: number) {
  const landscapeWeight =
    index % POST_CARD_WEIGHT.landscape.featuredEvery === POST_CARD_WEIGHT.landscape.featuredRemainder
      ? POST_CARD_WEIGHT.landscape.featured
      : POST_CARD_WEIGHT.landscape.base;
  const portraitWeight =
    index % POST_CARD_WEIGHT.portrait.featuredEvery === POST_CARD_WEIGHT.portrait.featuredRemainder
      ? POST_CARD_WEIGHT.portrait.featured
      : POST_CARD_WEIGHT.portrait.base;
  const mediaWeights = {
    landscape: landscapeWeight,
    portrait: portraitWeight,
    square: POST_CARD_WEIGHT.square,
    none: POST_CARD_WEIGHT.none
  };
  const titleWeight = Math.min(post.title.length / POST_CARD_WEIGHT.titleDivisor, POST_CARD_WEIGHT.titleMax);
  const excerptWeight = Math.min(post.excerpt.length / POST_CARD_WEIGHT.excerptDivisor, POST_CARD_WEIGHT.excerptMax);

  return mediaWeights[post.coverOrientation] + titleWeight + excerptWeight;
}

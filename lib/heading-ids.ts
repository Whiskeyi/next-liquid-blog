export type HeadingIdRegistry = {
  getId: (text: string) => string;
};

export function slugifyHeading(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createHeadingIdRegistry(): HeadingIdRegistry {
  const seen = new Map<string, number>();

  return {
    getId(text) {
      const base = slugifyHeading(text) || "heading";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return count ? `${base}-${count}` : base;
    }
  };
}

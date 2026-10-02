import type { Locale } from "@/lib/i18n";
import type { PostMeta } from "@/lib/posts";

export function localizePost<T extends PostMeta>(post: T, locale: Locale): T {
  const translation = post.translations?.[locale];
  return translation ? { ...post, ...translation } : post;
}

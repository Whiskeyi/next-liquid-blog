"use client";

import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";
import type { PostMeta } from "@/lib/posts";
import { localizePost } from "@/lib/post-localization";
import { siteConfig } from "@/lib/site";

export function LocalizedContent({ variants }: { variants: Record<Locale, ReactNode> }) {
  const { locale } = useI18n();
  return <>{variants[locale]}</>;
}

export function ArticleLanguageNotice({ language }: { language: Locale }) {
  const { locale, t } = useI18n();
  return locale === language ? null : <p className="article-language-notice" role="status">{t("articleFallback")}</p>;
}

export function PostTitle({ post }: { post: PostMeta }) {
  const { locale } = useI18n();
  const localized = localizePost(post, locale);
  return <span lang={localized.language}>{localized.title}</span>;
}

export function ArticlePageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | ${siteConfig.title}`;
  }, [title]);
  return null;
}

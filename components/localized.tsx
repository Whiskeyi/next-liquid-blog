"use client";

import type { HTMLAttributes, AnchorHTMLAttributes } from "react";
import { useEffect } from "react";
import { useI18n } from "@/components/i18n-provider";
import { formatDate, type MessageKey, type MessageValues } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function LocalizedPageTitle({ id, values }: { id: MessageKey; values?: MessageValues }) {
  const { t } = useI18n();
  const title = `${t(id, values)} | ${siteConfig.title}`;
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

export function LocalizedText({ id, values }: { id: MessageKey; values?: MessageValues }) {
  const { t } = useI18n();
  return <>{t(id, values)}</>;
}

export function LocalizedDate({ date }: { date: string }) {
  const { locale } = useI18n();
  return <time dateTime={date}>{formatDate(date, locale)}</time>;
}

export function LocalizedRegion({
  as: Tag, label, values, ...props
}: HTMLAttributes<HTMLElement> & { as: "figure" | "nav"; label: MessageKey; values?: MessageValues }) {
  const { t } = useI18n();
  return <Tag {...props} aria-label={t(label, values)} />;
}

export function HeadingAnchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { t } = useI18n();
  return <a {...props} aria-label={t("headingLink")} />;
}

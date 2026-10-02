"use client";

import { useI18n } from "@/components/i18n-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const nextLocale = locale === "zh-CN" ? "en" : "zh-CN";

  return (
    <button
      className="icon-button language-toggle"
      type="button"
      onClick={() => setLocale(nextLocale)}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      lang={nextLocale}
    >
      {nextLocale === "en" ? "EN" : "中"}
    </button>
  );
}

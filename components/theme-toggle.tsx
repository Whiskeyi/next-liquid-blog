"use client";

import { useI18n } from "@/components/i18n-provider";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  return (
    <button className="icon-button" type="button" onClick={toggleTheme} aria-label={t("switchTheme")}>
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

"use client";

import { useI18n } from "@/components/i18n-provider";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { softGlassStyle } from "@/components/glass-style";

export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId = 0;

    function updateVisibility() {
      frameId = 0;
      setVisible(window.scrollY > 680);
    }

    function requestVisibilityUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateVisibility);
    }

    updateVisibility();
    window.addEventListener("scroll", requestVisibilityUpdate, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestVisibilityUpdate);
    };
  }, []);

  return (
    <button
      className="back-to-top"
      style={softGlassStyle}
      type="button"
      aria-label={t("backToTop")}
      data-visible={visible}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={18} />
    </button>
  );
}

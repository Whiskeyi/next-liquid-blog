"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { softGlassStyle } from "@/components/glass-style";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > 680);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      className="back-to-top"
      style={softGlassStyle}
      type="button"
      aria-label="回到顶部"
      data-visible={visible}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={18} />
    </button>
  );
}

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Busuanzi?: {
      fetch?: () => void;
    };
  }
}

export function ViewCounter() {
  useEffect(() => {
    const existingScript = document.getElementById("busuanzi-script");

    if (existingScript) {
      window.Busuanzi?.fetch?.();
      return;
    }

    const script = document.createElement("script");
    script.id = "busuanzi-script";
    script.async = true;
    script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    document.body.appendChild(script);
  }, []);

  return <span id="busuanzi_value_page_pv">...</span>;
}

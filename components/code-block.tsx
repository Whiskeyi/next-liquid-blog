"use client";

import { useI18n } from "@/components/i18n-provider";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import type { HTMLAttributes } from "react";

const COPIED_FEEDBACK_DURATION_MS = 1400;
const COPY_ICON_SIZE = 15;

type CodeBlockProps = HTMLAttributes<HTMLPreElement>;

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const text = ref.current?.innerText ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_DURATION_MS);
  }

  return (
    <div className="code-frame">
      <button className="code-copy" type="button" onClick={copyCode} aria-label={t(copied ? "copied" : "copyCode")}>
        {copied ? <Check size={COPY_ICON_SIZE} /> : <Copy size={COPY_ICON_SIZE} />}
      </button>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

type CodeBlockProps = React.HTMLAttributes<HTMLPreElement>;

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    const text = ref.current?.innerText ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="code-frame">
      <button className="code-copy" type="button" onClick={copyCode} aria-label="复制代码">
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function CopyField({
  value,
  label = "copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-chalk pl-5 pr-1 py-1">
      <code className="flex-1 truncate font-mono text-xs text-ink/80">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-chalk hover:bg-forest transition-colors"
      >
        {copied ? "copied ✓" : label}
      </button>
    </div>
  );
}

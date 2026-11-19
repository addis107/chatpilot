"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked - user can select manually */
        }
      }}
    >
      {copied ? "✓ Copied" : "Copy snippet"}
    </button>
  );
}

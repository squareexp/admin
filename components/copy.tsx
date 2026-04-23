"use client";

import { useEffect, useState } from "react";
import { glassPillButtonClass } from "@/components/ui/glass";
import { cn } from "@/lib/utils";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
      className={cn(glassPillButtonClass, "h-7 px-2.5 text-[10px] uppercase tracking-[0.2em]")}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

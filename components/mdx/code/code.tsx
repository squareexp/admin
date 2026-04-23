"use client";

import { CopyButton } from "@/components/copy";
import { cn } from "@/lib/utils";

interface CodeProps {
  title?: string;
  language?: string;
  children: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function Code({ title, language, children }: CodeProps) {
  const highlightedCode = `<pre class="shiki github-dark overflow-x-auto whitespace-pre-wrap break-words"><code>${escapeHtml(children)}</code></pre>`;

  return (
    <div className="relative overflow-clip rounded-lg ring-1 ring-slate-300/45 my-4">
      {title && (
        <div className="flex items-center justify-between bg-zinc-900 px-4 py-1 border-b-[1px] border-zinc-700">
          <span className="text-[11px] text-zinc-100">{title}</span>
          <CopyButton code={children} />
        </div>
      )}
      <div
        className={cn(
          "overflow-x-auto p-2  bg-zinc-900  mt-0",
          title ? "" : "",
          language ? "data-language" : ""
        )}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  );
}

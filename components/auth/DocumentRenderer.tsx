import React from "react";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

export function DocumentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let unorderedListBuffer: string[] = [];
  let orderedListBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    const text = paragraphBuffer.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm leading-7 text-white/72">
          {renderInline(text)}
        </p>,
      );
    }
    paragraphBuffer = [];
  };

  const flushUnorderedList = () => {
    if (!unorderedListBuffer.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7 text-white/72">
        {unorderedListBuffer.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    unorderedListBuffer = [];
  };

  const flushOrderedList = () => {
    if (!orderedListBuffer.length) return;
    blocks.push(
      <ol key={`ol-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7 text-white/72">
        {orderedListBuffer.map((item, index) => (
          <li key={`${item}-${index}`} className="list-decimal">
            {renderInline(item)}
          </li>
        ))}
      </ol>,
    );
    orderedListBuffer = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      return;
    }

    if (line === "---") {
      flushAll();
      blocks.push(<hr key={`hr-${blocks.length}`} className="divider-dashed" />);
      return;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      flushOrderedList();
      unorderedListBuffer.push(line.slice(2).trim());
      return;
    }

    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      flushUnorderedList();
      orderedListBuffer.push(line.replace(/^\d+\.\s/, "").trim());
      return;
    }

    if (line.startsWith("# ")) {
      flushAll();
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="text-3xl font-semibold tracking-[-0.04em] text-white">
          {renderInline(line.slice(2).trim())}
        </h1>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      flushAll();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="pt-3 text-xl font-semibold tracking-[-0.03em] text-white">
          {renderInline(line.slice(3).trim())}
        </h2>,
      );
      return;
    }

    if (line.startsWith("### ")) {
      flushAll();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="pt-2 text-base font-semibold uppercase tracking-[0.14em] text-sq-brand-action/80">
          {renderInline(line.slice(4).trim())}
        </h3>,
      );
      return;
    }

    paragraphBuffer.push(line);
  });

  flushAll();

  return <div className="space-y-4">{blocks}</div>;
}

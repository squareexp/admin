"use client";

import React, { Fragment, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, SmilePlus, TerminalSquare } from "lucide-react";
import { CopyButton } from "@/components/copy";
import { glassIconButtonClass } from "@/components/ui/glass";
import type { ThreadMessageReaction } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { parseChatMessage, type ChatMessageSegment } from "./message-format";

const REACTION_CHOICES = ["👍", "🔥", "😂", "🎯", "✅", "👀"];
const INLINE_TOKEN_PATTERN = /(`[^`]+`|https?:\/\/[^\s]+|www\.[^\s]+)/g;

type HighlightPattern = {
  regex: RegExp;
  className: string;
};

const SHARED_CODE_PATTERNS: HighlightPattern[] = [
  { regex: /\/\/.*$/g, className: "text-slate-500" },
  { regex: /#.*$/g, className: "text-slate-500" },
  { regex: /"[^"\n]*"|'[^'\n]*'|`[^`\n]*`/g, className: "text-emerald-300" },
  { regex: /\b\d+(?:\.\d+)?\b/g, className: "text-sky-300" },
];

const JAVASCRIPT_PATTERNS: HighlightPattern[] = [
  ...SHARED_CODE_PATTERNS,
  {
    regex: /\b(import|from|export|const|let|var|function|return|await|async|class|extends|new|if|else|for|while|switch|case|break|continue|throw|try|catch)\b/g,
    className: "text-fuchsia-300",
  },
  { regex: /\b(interface|type|implements|readonly|unknown|Record|Partial)\b/g, className: "text-violet-300" },
  { regex: /\b(true|false|null|undefined)\b/g, className: "text-amber-300" },
];

const BASH_PATTERNS: HighlightPattern[] = [
  { regex: /^\s*(\$|#|>)\s?/g, className: "text-slate-500" },
  { regex: /\b(pnpm|npm|yarn|bun|npx|node|git|cargo|rustc|python|pip|docker|kubectl|ssh|brew|ls|cd|mkdir|rm|cp|mv|cat|curl|wget)\b/g, className: "text-cyan-300" },
  { regex: /--?[a-z0-9-]+/gi, className: "text-amber-300" },
  { regex: /\$[A-Z_][A-Z0-9_]*/gi, className: "text-fuchsia-300" },
  ...SHARED_CODE_PATTERNS,
];

const JSON_PATTERNS: HighlightPattern[] = [
  { regex: /"[^"]+"(?=\s*:)/g, className: "text-sky-300" },
  { regex: /"[^"\n]*"/g, className: "text-emerald-300" },
  { regex: /\b(true|false|null)\b/g, className: "text-amber-300" },
  { regex: /\b\d+(?:\.\d+)?\b/g, className: "text-violet-300" },
];

const HTML_PATTERNS: HighlightPattern[] = [
  { regex: /<\/?[a-z][\w:-]*/gi, className: "text-sky-300" },
  { regex: /\b[\w:-]+(?==)/g, className: "text-amber-300" },
  { regex: /"[^"\n]*"/g, className: "text-emerald-300" },
];

const CSS_PATTERNS: HighlightPattern[] = [
  { regex: /[.#]?[a-z][a-z0-9_-]*(?=\s*\{)/gi, className: "text-sky-300" },
  { regex: /\b[a-z-]+(?=\s*:)/gi, className: "text-amber-300" },
  { regex: /#[0-9a-f]{3,8}\b/gi, className: "text-fuchsia-300" },
  { regex: /\b\d+(?:px|rem|em|%|vh|vw)?\b/gi, className: "text-violet-300" },
];

const SQL_PATTERNS: HighlightPattern[] = [
  {
    regex: /\b(select|insert|update|delete|from|where|order by|group by|join|inner join|left join|limit|values|set|into|as|and|or)\b/gi,
    className: "text-fuchsia-300",
  },
  ...SHARED_CODE_PATTERNS,
  { regex: /"[^"\n]*"|'[^'\n]*'/g, className: "text-emerald-300" },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getPatterns(language: string) {
  switch (language) {
    case "bash":
      return BASH_PATTERNS;
    case "json":
      return JSON_PATTERNS;
    case "html":
      return HTML_PATTERNS;
    case "css":
      return CSS_PATTERNS;
    case "sql":
      return SQL_PATTERNS;
    case "typescript":
    case "javascript":
      return JAVASCRIPT_PATTERNS;
    default:
      return SHARED_CODE_PATTERNS;
  }
}

function highlightCodeLine(line: string, language: string) {
  const patterns = getPatterns(language);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let tokenKey = 0;

  while (cursor < line.length) {
    let bestMatch:
      | {
          start: number;
          end: number;
          value: string;
          className: string;
        }
      | undefined;

    for (const pattern of patterns) {
      pattern.regex.lastIndex = cursor;
      const match = pattern.regex.exec(line);
      if (!match || typeof match.index !== "number") {
        continue;
      }

      const start = match.index;
      const value = match[0] || "";
      if (!value) {
        continue;
      }

      if (!bestMatch || start < bestMatch.start || (start === bestMatch.start && value.length > bestMatch.value.length)) {
        bestMatch = {
          start,
          end: start + value.length,
          value,
          className: pattern.className,
        };
      }
    }

    if (!bestMatch) {
      nodes.push(<Fragment key={`plain-${tokenKey++}`}>{line.slice(cursor)}</Fragment>);
      break;
    }

    if (bestMatch.start > cursor) {
      nodes.push(<Fragment key={`plain-${tokenKey++}`}>{line.slice(cursor, bestMatch.start)}</Fragment>);
    }

    nodes.push(
      <span key={`token-${tokenKey++}`} className={bestMatch.className}>
        {bestMatch.value}
      </span>,
    );
    cursor = bestMatch.end;
  }

  return nodes.length ? nodes : [line];
}

function renderInlineText(text: string) {
  const parts = text.split(INLINE_TOKEN_PATTERN);
  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`inline-code-${index}`}
          className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[0.92em] text-[var(--sq-brand-action)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const normalizedHref = part.startsWith("http") ? part : `https://${part}`;
    if (part.startsWith("http") || part.startsWith("www.")) {
      return (
        <a
          key={`inline-link-${index}`}
          href={normalizedHref}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sky-300 underline decoration-sky-300/30 underline-offset-4 transition-colors hover:text-sky-200"
        >
          {part}
        </a>
      );
    }

    return <Fragment key={`inline-text-${index}`}>{part}</Fragment>;
  });
}

function formatLanguage(language: string, terminal: boolean) {
  if (terminal) {
    return "terminal";
  }
  if (!language || language === "text") {
    return "snippet";
  }
  return language;
}

function CodeSegment({
  segment,
}: {
  segment: Extract<ChatMessageSegment, { type: "code" }>;
}) {
  const icon = segment.terminal ? (
    <TerminalSquare size={14} className="text-[var(--sq-brand-action)]" />
  ) : (
    <Code2 size={14} className="text-[var(--sq-brand-action)]" />
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,18,0.96),rgba(11,16,24,0.98))] shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/48">
          {icon}
          <span>{formatLanguage(segment.language, segment.terminal)}</span>
        </div>
        <CopyButton code={segment.content} />
      </div>

      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-6 text-white/86">
        {segment.content.split("\n").map((line, index) => (
          <div key={`${segment.language}-${index}`} className="min-h-6">
            {highlightCodeLine(line, segment.language)}
          </div>
        ))}
      </pre>
    </motion.div>
  );
}

function TextSegment({
  content,
  isMine,
}: {
  content: string;
  isMine: boolean;
}) {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full rounded-[22px] border px-4 py-3 shadow-[0_18px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl",
        isMine
          ? "border-[rgba(205,255,4,0.18)] bg-[linear-gradient(180deg,rgba(205,255,4,0.16),rgba(205,255,4,0.08))] text-white"
          : "border-white/10 bg-white/5 text-white/82",
      )}
    >
      <div className="space-y-3 text-[13px] leading-7">
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p key={`paragraph-${paragraphIndex}`} className="whitespace-pre-wrap break-words">
            {paragraph.split("\n").map((line, lineIndex) => (
              <Fragment key={`line-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineText(line)}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export function ChatMessageBubble({
  messageId,
  body,
  timestamp,
  senderName,
  senderInitial,
  isMine,
  reactions,
  currentUserId,
  onToggleReaction,
  showAvatar = true,
  className,
}: {
  messageId: string;
  body: string;
  timestamp: string;
  senderName?: string;
  senderInitial?: string;
  isMine: boolean;
  reactions?: ThreadMessageReaction[];
  currentUserId?: string;
  onToggleReaction?: (messageId: string, emoji: string) => void | Promise<void>;
  showAvatar?: boolean;
  className?: string;
}) {
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const segments = useMemo(() => parseChatMessage(body), [body]);
  const groupedReactions = useMemo(() => {
    const grouped = new Map<
      string,
      { emoji: string; count: number; mine: boolean; userNames: string[] }
    >();

    for (const reaction of reactions || []) {
      const existing = grouped.get(reaction.emoji);
      if (existing) {
        existing.count += 1;
        existing.mine = existing.mine || reaction.userId === currentUserId;
        existing.userNames.push(reaction.userName);
        continue;
      }

      grouped.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        mine: reaction.userId === currentUserId,
        userNames: [reaction.userName],
      });
    }

    return [...grouped.values()];
  }, [currentUserId, reactions]);

  const handleReaction = (emoji: string) => {
    setReactionPickerOpen(false);
    onToggleReaction?.(messageId, emoji);
  };

  return (
    <div className={cn("group/message ring flex w-full", isMine ? "justify-end" : "justify-start", className)}>
      <div className={cn("flex w-full max-w-[min(100%,46rem)] items-end gap-3", isMine ? "flex-row-reverse" : "flex-row")}>
        {!isMine ? (
          <div className="w-9 shrink-0">
            {showAvatar ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/76 shadow-[0_18px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                {getInitials(senderInitial || senderName || "T")}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={cn("flex min-w-0 flex-1 flex-col gap-2", isMine ? "items-end" : "items-start")}>
          {segments.map((segment, index) =>
            segment.type === "code" ? (
              <CodeSegment key={`${messageId}-code-${index}`} segment={segment} />
            ) : (
              <TextSegment key={`${messageId}-text-${index}`} content={segment.content} isMine={isMine} />
            ),
          )}

          {groupedReactions.length || onToggleReaction ? (
            <div className={cn("flex flex-wrap items-center gap-2 px-1", isMine ? "justify-end" : "justify-start")}>
              {groupedReactions.map((reaction) => (
                <motion.button
                  key={`${messageId}-${reaction.emoji}`}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => handleReaction(reaction.emoji)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all",
                    reaction.mine
                      ? "border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.12)] text-[var(--sq-brand-action)]"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  title={reaction.userNames.join(", ")}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </motion.button>
              ))}

              {onToggleReaction ? (
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => setReactionPickerOpen((open) => !open)}
                    className={cn(
                      glassIconButtonClass,
                      "h-8 w-8 opacity-0 transition-opacity group-hover/message:opacity-100 data-[open=true]:opacity-100",
                    )}
                    data-open={reactionPickerOpen}
                    aria-label="Add reaction"
                  >
                    <SmilePlus size={14} />
                  </motion.button>

                  <AnimatePresence>
                    {reactionPickerOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className={cn(
                          "absolute z-20 mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.98),rgba(8,12,18,0.98))] px-2 py-1.5 shadow-[0_22px_44px_rgba(0,0,0,0.3)] backdrop-blur-xl",
                          isMine ? "right-0" : "left-0",
                        )}
                      >
                        {REACTION_CHOICES.map((emoji) => (
                          <motion.button
                            key={`${messageId}-${emoji}`}
                            whileHover={{ y: -1, scale: 1.06 }}
                            whileTap={{ scale: 0.92 }}
                            type="button"
                            onClick={() => handleReaction(emoji)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-lg transition-colors hover:bg-white/10"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={cn("flex items-center gap-2 px-1 text-[10px] uppercase tracking-[0.18em] text-white/28", isMine ? "justify-end" : "justify-start")}>
            <span>{new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

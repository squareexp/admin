"use client";

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CloudAdd,
  DirectInbox,
  DocumentText1,
  More,
  NotificationBing,
  Profile2User,
  Send2,
  SidebarLeft,
  SidebarRight,
  SmsEdit,
  Trash,
} from "iconsax-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { MailSnow } from "@/components/icons/icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  ArrowRightLeft,
  Clock3,
  Forward,
  Loader,
  Mail,
  MailMinus,
  MailOpen,
  Pin,
  Reply,
  ReplyAll,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react";
import { ToastItem } from "@/components/Notchjs";

// --- Types & Constants ---

type MailFolder =
  | "inbox"
  | "sent"
  | "draft"
  | "archive"
  | "junk"
  | "trash"
  | "all";

type AdminMailboxAlias = {
  alias: string;
  total: number;
  unread: number;
};

type AdminMailboxMessage = {
  id: string;
  alias: string;
  folder: string;
  remoteUid?: number | null;
  remoteFolder?: string | null;
  from: string;
  to: string;
  cc?: string[];
  replyTo?: string | null;
  listUnsubscribe?: string | null;
  messageIdHeader?: string | null;
  references?: string | null;
  subject: string;
  preview: string;
  body: string;
  bodyHtml?: string | null;
  bodyHtmlRaw?: string | null;
  isStarred?: boolean;
  isPinned?: boolean;
  snoozedUntil?: string | null;
  receivedAt: string;
  seenBy: string[];
  seenForTeam: boolean;
  source: string;
  isSeenByCurrentUser: boolean;
};

type AdminMailboxSnapshot = {
  generatedAt: string;
  selectedAlias: string;
  aliases: AdminMailboxAlias[];
  messages: AdminMailboxMessage[];
  canManageTeamSeen: boolean;
  gatewayConnected: boolean;
};

type ComposeMode = "closed" | "popup" | "side";

type ComposeDraft = {
  fromAlias: string;
  to: string;
  subject: string;
  body: string;
};

type ComposeIntentKind = "compose" | "reply" | "reply_all" | "forward";

type ComposeIntent = {
  kind: ComposeIntentKind;
  messageId?: string;
};

type MailboxSeenResponse = {
  ok: boolean;
  scope: "self" | "team";
  message: AdminMailboxMessage;
  at: string;
};

type AdminMailboxActionResponse = {
  ok: boolean;
  action: string;
  delivered?: boolean | null;
  unsubscribeUrl?: string | null;
  at: string;
  message?: AdminMailboxMessage | null;
};

type ComposePreviewResponse = {
  html: string;
  subject: string;
  fromAlias: string;
  sourceFiles: string[];
};

type MailContextMenuKind = "list" | "preview";

type MailContextMenuState = {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  kind: MailContextMenuKind;
  messageId: string;
};

const POLL_INTERVAL_MS = 30000;
const MUTED_ICON_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";
const MUTED_ICON_BUTTON_ACTIVE_CLASS =
  "border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.12)] text-[var(--sq-brand-action)] hover:bg-[rgba(205,255,4,0.16)] hover:text-[var(--sq-brand-action)]";
const MUTED_PILL_BUTTON_CLASS =
  "inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";
const MUTED_INPUT_CLASS =
  "h-9 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] text-white/60 outline-none transition-all placeholder:text-white/35 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white";
const CONTEXT_MENU_GAP = 4;
const CONTEXT_MENU_VIEWPORT_PADDING = 8;
const MOVE_TARGET_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "inbox", label: "Inbox" },
  { value: "archive", label: "Archive" },
  { value: "junk", label: "Junk" },
  { value: "trash", label: "Trash" },
];

const FOLDERS: Array<{
  key: MailFolder;
  label: string;
  icon: React.ComponentType<{
    size?: number | string;
    color?: string;
    variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
  }>;
}> = [
  { key: "inbox", label: "Inbox", icon: DirectInbox },
  { key: "draft", label: "Drafts", icon: DocumentText1 },
  { key: "sent", label: "Sent", icon: Send2 },
  { key: "archive", label: "Archive", icon: DocumentText1 },
  { key: "junk", label: "Junk", icon: NotificationBing },
  { key: "trash", label: "Trash", icon: Trash },
  { key: "all", label: "All", icon: More },
];

// --- Formatting & Text Utilities ---

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toPlainText(value: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMimeArtifacts(value: string) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return true;
    }

    if (
      /^(content-type|content-transfer-encoding|content-disposition|mime-version|content-id|content-location|x-[a-z0-9-]+)\s*:/i.test(
        trimmed,
      )
    ) {
      return false;
    }

    if (/^--[-_a-z0-9=:+/.]+$/i.test(trimmed)) {
      return false;
    }

    if (/^(boundary|charset|filename|name)\s*=/i.test(trimmed)) {
      return false;
    }

    return true;
  });

  return cleaned
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeMarkdown(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return /(^|\n)\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|__[^_]+__)/m.test(
    trimmed,
  );
}

// --- Markdown & Inline Link Rendering ---

const INLINE_MARKDOWN_PATTERN =
  /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|(https?:\/\/[^\s<>"`]+|mailto:[^\s<>"`]+))/gi;

function renderInlineTextWithLinks(value: string, keyPrefix: string) {
  if (!value) {
    return null;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;
  INLINE_MARKDOWN_PATTERN.lastIndex = 0;
  let match = INLINE_MARKDOWN_PATTERN.exec(value);

  while (match) {
    const [token] = match;
    const markdownLinkLabel = match[2];
    const markdownLinkHref = match[3];
    const boldAsterisk = match[4];
    const boldUnderscore = match[5];
    const inlineCode = match[6];
    const bareLink = match[7];
    const start = match.index;
    const end = start + token.length;

    if (start > cursor) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-text-${tokenIndex}`}>
          {value.slice(cursor, start)}
        </React.Fragment>,
      );
      tokenIndex += 1;
    }

    const resolveSafeHref = (rawHref: string) => {
      if (rawHref.toLowerCase().startsWith("mailto:")) {
        return rawHref;
      }
      try {
        return new URL(rawHref).toString();
      } catch {
        return "";
      }
    };

    if (markdownLinkHref && markdownLinkLabel) {
      const safeHref = resolveSafeHref(markdownLinkHref);
      if (safeHref) {
        nodes.push(
          <a
            key={`${keyPrefix}-md-link-${tokenIndex}`}
            href={safeHref}
            target="_blank"
            rel="noreferrer noopener"
            className="break-all text-[var(--sq-brand-action)] hover:underline"
          >
            {markdownLinkLabel}
          </a>,
        );
      } else {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-md-link-raw-${tokenIndex}`}>
            {markdownLinkLabel}
          </React.Fragment>,
        );
      }
    } else if (boldAsterisk || boldUnderscore) {
      nodes.push(
        <strong
          key={`${keyPrefix}-bold-${tokenIndex}`}
          className="font-semibold text-white/90"
        >
          {boldAsterisk || boldUnderscore}
        </strong>,
      );
    } else if (inlineCode) {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${tokenIndex}`}
          className="rounded bg-white/8 px-1.5 py-0.5 text-[0.9em] text-white/86"
        >
          {inlineCode}
        </code>,
      );
    } else if (bareLink) {
      const safeHref = resolveSafeHref(bareLink);
      if (safeHref) {
        nodes.push(
          <a
            key={`${keyPrefix}-link-${tokenIndex}`}
            href={safeHref}
            target="_blank"
            rel="noreferrer noopener"
            className="break-all text-[var(--sq-brand-action)] hover:underline"
          >
            {bareLink}
          </a>,
        );
      } else {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-raw-link-${tokenIndex}`}>
            {bareLink}
          </React.Fragment>,
        );
      }
    } else {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-token-${tokenIndex}`}>
          {token}
        </React.Fragment>,
      );
    }

    tokenIndex += 1;
    cursor = end;
    match = INLINE_MARKDOWN_PATTERN.exec(value);
  }

  if (cursor < value.length) {
    nodes.push(
      <React.Fragment key={`${keyPrefix}-tail-${tokenIndex}`}>
        {value.slice(cursor)}
      </React.Fragment>,
    );
  }

  return nodes;
}

function renderMarkdownBody(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return (
      <p className="text-[14px] leading-[1.8] text-white/55">Empty body</p>
    );
  }

  const lines = normalized.split("\n");
  const nodes: React.ReactNode[] = [];
  let lineIndex = 0;
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushCodeBlock = () => {
    if (!codeBuffer.length) {
      return;
    }
    nodes.push(
      <pre
        key={`md-code-${lineIndex}`}
        className="overflow-x-auto rounded-[14px] border border-white/10 bg-black/30 px-4 py-3 text-[12px] leading-relaxed text-white/78"
      >
        <code>{codeBuffer.join("\n")}</code>
      </pre>,
    );
    codeBuffer = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      return;
    }

    const commonClass =
      "space-y-1 pl-5 text-[14px] leading-[1.7] text-white/82 marker:text-white/45";
    if (listType === "ul") {
      nodes.push(
        <ul key={`md-list-${lineIndex}`} className={`list-disc ${commonClass}`}>
          {listItems.map((item, itemIndex) => (
            <li key={`md-list-item-${lineIndex}-${itemIndex}`}>
              {renderInlineTextWithLinks(
                item,
                `md-ul-${lineIndex}-${itemIndex}`,
              )}
            </li>
          ))}
        </ul>,
      );
    } else {
      nodes.push(
        <ol
          key={`md-list-${lineIndex}`}
          className={`list-decimal ${commonClass}`}
        >
          {listItems.map((item, itemIndex) => (
            <li key={`md-list-item-${lineIndex}-${itemIndex}`}>
              {renderInlineTextWithLinks(
                item,
                `md-ol-${lineIndex}-${itemIndex}`,
              )}
            </li>
          ))}
        </ol>,
      );
    }

    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      lineIndex += 1;
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      lineIndex += 1;
      continue;
    }

    if (!trimmed) {
      flushList();
      lineIndex += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const depth = Math.min(headingMatch[1].length, 6);
      const text = headingMatch[2];
      const headingClassByDepth: Record<number, string> = {
        1: "text-[24px] font-semibold",
        2: "text-[20px] font-semibold",
        3: "text-[18px] font-semibold",
        4: "text-[16px] font-semibold",
        5: "text-[15px] font-semibold",
        6: "text-[14px] font-semibold",
      };
      nodes.push(
        <p
          key={`md-heading-${lineIndex}`}
          className={`${headingClassByDepth[depth]} tracking-tight text-white/90`}
        >
          {renderInlineTextWithLinks(text, `md-heading-${lineIndex}`)}
        </p>,
      );
      lineIndex += 1;
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (bulletMatch) {
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(bulletMatch[1]);
      lineIndex += 1;
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(orderedMatch[1]);
      lineIndex += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushList();
      nodes.push(
        <blockquote
          key={`md-quote-${lineIndex}`}
          className="border-l-2 border-white/18 pl-4 text-[14px] leading-[1.7] text-white/68"
        >
          {renderInlineTextWithLinks(trimmed.slice(2), `md-quote-${lineIndex}`)}
        </blockquote>,
      );
      lineIndex += 1;
      continue;
    }

    flushList();
    nodes.push(
      <p
        key={`md-paragraph-${lineIndex}`}
        className="text-[14px] leading-[1.8] text-white/82"
      >
        {renderInlineTextWithLinks(trimmed, `md-p-${lineIndex}`)}
      </p>,
    );
    lineIndex += 1;
  }

  flushList();
  if (inCodeBlock) {
    flushCodeBlock();
  }

  return <div className="space-y-3">{nodes}</div>;
}

// --- HTML Preview Logic ---

function looksLikeFullHtmlDocument(bodyHtml: string) {
  return /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(bodyHtml);
}

function ensureBaseTarget(documentHtml: string) {
  if (/<base[\s>]/i.test(documentHtml)) {
    return documentHtml;
  }

  if (/<head[\s>]/i.test(documentHtml)) {
    return documentHtml.replace(
      /<head([^>]*)>/i,
      `<head$1><base target="_blank" />`,
    );
  }

  if (/<body[\s>]/i.test(documentHtml)) {
    return documentHtml.replace(
      /<body([^>]*)>/i,
      `<head><base target="_blank" /></head><body$1>`,
    );
  }

  return documentHtml;
}

function buildHtmlPreviewDocument(bodyHtml: string) {
  if (looksLikeFullHtmlDocument(bodyHtml)) {
    return ensureBaseTarget(bodyHtml);
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base target="_blank" />
  </head>
  <body>${bodyHtml}</body>
</html>`;
}

function resolvePreviewHtml(message: AdminMailboxMessage) {
  if (message.bodyHtmlRaw && looksLikeFullHtmlDocument(message.bodyHtmlRaw)) {
    return message.bodyHtmlRaw;
  }

  return message.bodyHtml || message.bodyHtmlRaw || null;
}

function splitRecipients(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function prefixSubject(prefix: string, subject: string) {
  const trimmedSubject = subject.trim();
  if (!trimmedSubject) {
    return prefix.replace(":", "");
  }

  return trimmedSubject.toLowerCase().startsWith(prefix.toLowerCase())
    ? trimmedSubject
    : `${prefix} ${trimmedSubject}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toComposeHtml(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "<p></p>";
  }

  return normalized
    .split(/\n{2,}/)
    .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function resolveContextMenuPosition(
  anchorX: number,
  anchorY: number,
  menuWidth: number,
  menuHeight: number,
) {
  if (typeof window === "undefined") {
    return {
      x: anchorX + CONTEXT_MENU_GAP,
      y: anchorY + CONTEXT_MENU_GAP,
    };
  }

  let x = anchorX + CONTEXT_MENU_GAP;
  let y = anchorY + CONTEXT_MENU_GAP;

  const maxX = window.innerWidth - menuWidth - CONTEXT_MENU_VIEWPORT_PADDING;
  const maxY = window.innerHeight - menuHeight - CONTEXT_MENU_VIEWPORT_PADDING;

  if (x > maxX) {
    x = anchorX - menuWidth - CONTEXT_MENU_GAP;
  }

  if (y > maxY) {
    y = anchorY - menuHeight - CONTEXT_MENU_GAP;
  }

  return {
    x: Math.max(CONTEXT_MENU_VIEWPORT_PADDING, x),
    y: Math.max(CONTEXT_MENU_VIEWPORT_PADDING, y),
  };
}

// --- Mailbox Logic Helpers ---

function resolveApiError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  return fallback;
}

function folderMatches(message: AdminMailboxMessage, folder: MailFolder) {
  if (folder === "all") {
    return true;
  }

  return message.folder.toLowerCase() === folder;
}

function computeFolderCount(
  messages: AdminMailboxMessage[],
  folder: MailFolder,
) {
  return messages.filter((message) => folderMatches(message, folder)).length;
}

function computeFolderUnread(
  messages: AdminMailboxMessage[],
  folder: MailFolder,
) {
  return messages.filter(
    (message) => folderMatches(message, folder) && !message.isSeenByCurrentUser,
  ).length;
}

// --- Main Workspace Component ---

export function MailWorkspace({
  currentUser,
  isActive = true,
}: {
  currentUser: UserProfile | null;
  isActive?: boolean;
}) {
  // - State Persistence -
  const [snapshot, setSnapshot] = useState<AdminMailboxSnapshot | null>(null);
  const [selectedAlias, setSelectedAlias] = useState<string>("");
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [activeFolder, setActiveFolder] = useState<MailFolder>("inbox");

  // - Lifecycle & UI State -
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isComposeSending, setIsComposeSending] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<ComposeMode>("closed");
  const [composeIntent, setComposeIntent] = useState<ComposeIntent>({
    kind: "compose",
  });
  const [isCompactTiles, setIsCompactTiles] = useState(true);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [moveTarget, setMoveTarget] = useState("archive");
  const [contextMenu, setContextMenu] = useState<MailContextMenuState | null>(
    null,
  );
  const [composeDraft, setComposeDraft] = useState<ComposeDraft>({
    fromAlias: "",
    to: "",
    subject: "",
    body: "",
  });
  const [composePreviewHtml, setComposePreviewHtml] = useState("");
  const [composeTemplateFiles, setComposeTemplateFiles] = useState<string[]>(
    [],
  );
  const [composePreviewError, setComposePreviewError] = useState<string | null>(
    null,
  );
  const [isComposePreviewLoading, setIsComposePreviewLoading] = useState(false);

  // - Selection Refs -
  const selectedAliasRef = useRef<string>("");
  const hasLoadedRef = useRef(false);
  const hasRequestedInitialRef = useRef(false);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const deferredComposeSubject = useDeferredValue(composeDraft.subject);
  const deferredComposeBody = useDeferredValue(composeDraft.body);
  const deferredComposeFromAlias = useDeferredValue(composeDraft.fromAlias);

  useEffect(() => {
    selectedAliasRef.current = selectedAlias;
  }, [selectedAlias]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        event.target instanceof Node &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };

    const closeMenu = () => setContextMenu(null);

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (!contextMenu || !contextMenuRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const menuNode = contextMenuRef.current;
      if (!menuNode) {
        return;
      }

      const rect = menuNode.getBoundingClientRect();
      const nextPosition = resolveContextMenuPosition(
        contextMenu.anchorX,
        contextMenu.anchorY,
        rect.width,
        rect.height,
      );

      if (
        nextPosition.x === contextMenu.x &&
        nextPosition.y === contextMenu.y
      ) {
        return;
      }

      setContextMenu((current) => {
        if (
          !current ||
          current.messageId !== contextMenu.messageId ||
          current.kind !== contextMenu.kind ||
          current.anchorX !== contextMenu.anchorX ||
          current.anchorY !== contextMenu.anchorY
        ) {
          return current;
        }

        return {
          ...current,
          x: nextPosition.x,
          y: nextPosition.y,
        };
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [contextMenu]);

  // - API Handlers (Snapshots & Sync) -

  const applySnapshotState = useCallback(
    (data: AdminMailboxSnapshot, fallbackAlias?: string) => {
      const nextAlias = data.selectedAlias || fallbackAlias || "";
      setSnapshot(data);
      setSelectedAlias(nextAlias);
      selectedAliasRef.current = nextAlias;
      setSelectedMessageId((current) => {
        const currentVisible = data.messages.find(
          (message) =>
            message.id === current && folderMatches(message, activeFolder),
        );
        if (currentVisible) {
          return currentVisible.id;
        }

        const firstVisible = data.messages.find((message) =>
          folderMatches(message, activeFolder),
        );
        return firstVisible?.id || data.messages[0]?.id || "";
      });
      setError(null);
      setIsLoading(false);
      hasLoadedRef.current = true;
    },
    [activeFolder],
  );

  const patchMessageLocally = useCallback(
    (
      messageId: string,
      updater: (message: AdminMailboxMessage) => AdminMailboxMessage,
    ) => {
      setSnapshot((current) => {
        if (!current) {
          return current;
        }

        const messageIndex = current.messages.findIndex(
          (message) => message.id === messageId,
        );
        if (messageIndex === -1) {
          return current;
        }

        const previousMessage = current.messages[messageIndex];
        const nextMessage = updater({ ...previousMessage });
        const nextMessages = [...current.messages];
        nextMessages[messageIndex] = nextMessage;

        const unreadDelta =
          previousMessage.isSeenByCurrentUser ===
          nextMessage.isSeenByCurrentUser
            ? 0
            : nextMessage.isSeenByCurrentUser
              ? -1
              : 1;

        return {
          ...current,
          messages: nextMessages,
          aliases:
            unreadDelta === 0
              ? current.aliases
              : current.aliases.map((aliasItem) =>
                  aliasItem.alias === nextMessage?.alias
                    ? {
                        ...aliasItem,
                        unread: Math.max(0, aliasItem.unread + unreadDelta),
                      }
                    : aliasItem,
                ),
        };
      });
    },
    [],
  );

  const mergeServerMessage = useCallback(
    (message: AdminMailboxMessage | null | undefined) => {
      if (!message) {
        return;
      }

      patchMessageLocally(message.id, () => message);
    },
    [patchMessageLocally],
  );

  const openContextMenuAt = useCallback(
    (x: number, y: number, kind: MailContextMenuKind, messageId: string) => {
      const nextPosition = resolveContextMenuPosition(x, y, 240, 320);
      setContextMenu({
        anchorX: x,
        anchorY: y,
        x: nextPosition.x,
        y: nextPosition.y,
        kind,
        messageId,
      });
    },
    [],
  );

  const loadSnapshot = useCallback(
    async ({ alias, sync }: { alias?: string; sync?: boolean } = {}) => {
      const targetAlias = alias || selectedAliasRef.current || undefined;
      const query = new URLSearchParams();
      if (targetAlias) {
        query.set("alias", targetAlias);
      }
      query.set("limit", "120");
      if (sync) {
        query.set("sync", "1");
      }

      const isInitialLoad = !hasRequestedInitialRef.current;
      if (isInitialLoad) {
        setIsLoading(true);
        hasRequestedInitialRef.current = true;
      }

      const response = await fetch(`/api/admin/mailbox?${query.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Failed to load mailbox" }));
        throw new Error(resolveApiError(payload, "Failed to load mailbox"));
      }

      const data = (await response.json()) as AdminMailboxSnapshot;
      applySnapshotState(data, targetAlias);
      return data;
    },
    [applySnapshotState],
  );

  useEffect(() => {
    if (!isActive) {
      setContextMenu(null);
      return;
    }

    const shouldWarmSync = !hasLoadedRef.current;

    void loadSnapshot({
      alias: selectedAliasRef.current || undefined,
      sync: shouldWarmSync,
    }).catch((loadError) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load mailbox",
      );
      setIsLoading(false);
    });
  }, [isActive, loadSnapshot]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadSnapshot({ alias: selectedAlias || undefined }).catch(() => {
        // keep previous data visible when a background poll fails
        setIsLoading(false);
      });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isActive, loadSnapshot, selectedAlias]);

  // - Derived State (Filtering) -

  useEffect(() => {
    if (composeDraft.fromAlias) {
      return;
    }

    const fallbackAlias =
      selectedAlias || snapshot?.selectedAlias || currentUser?.email || "";

    if (!fallbackAlias) {
      return;
    }

    setComposeDraft((current) => ({
      ...current,
      fromAlias: fallbackAlias,
    }));
  }, [
    composeDraft.fromAlias,
    currentUser?.email,
    selectedAlias,
    snapshot?.selectedAlias,
  ]);

  const scopedMessages = useMemo(() => {
    const entries = snapshot?.messages || [];
    return entries.filter((message) => folderMatches(message, activeFolder));
  }, [activeFolder, snapshot]);

  const filteredMessages = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return scopedMessages;
    }

    return scopedMessages.filter((message) => {
      return (
        message.subject.toLowerCase().includes(keyword) ||
        message.from.toLowerCase().includes(keyword) ||
        message.preview.toLowerCase().includes(keyword)
      );
    });
  }, [scopedMessages, search]);

  const selectedMessage = useMemo(() => {
    const entries = snapshot?.messages || [];
    return entries.find((message) => message.id === selectedMessageId) || null;
  }, [snapshot, selectedMessageId]);

  const contextMenuMessage = useMemo(() => {
    if (!contextMenu) {
      return null;
    }

    const entries = snapshot?.messages || [];
    return (
      entries.find((message) => message.id === contextMenu.messageId) || null
    );
  }, [contextMenu, snapshot]);

  useEffect(() => {
    if (contextMenu && !contextMenuMessage) {
      setContextMenu(null);
    }
  }, [contextMenu, contextMenuMessage]);

  useEffect(() => {
    if (!filteredMessages.length) {
      setSelectedMessageId("");
      return;
    }

    if (!filteredMessages.some((message) => message.id === selectedMessageId)) {
      setSelectedMessageId(filteredMessages[0]?.id || "");
    }
  }, [filteredMessages, selectedMessageId]);

  const composeTitle = useMemo(() => {
    switch (composeIntent.kind) {
      case "reply":
        return "Reply";
      case "reply_all":
        return "Reply all";
      case "forward":
        return "Forward";
      default:
        return "Compose mail";
    }
  }, [composeIntent.kind]);

  const composeRecipientsLocked =
    composeIntent.kind === "reply" || composeIntent.kind === "reply_all";
  const isComposePreviewMode = composeIntent.kind === "compose";
  const composePreviewDocument = useMemo(() => {
    if (!composePreviewHtml) {
      return "";
    }

    return buildHtmlPreviewDocument(composePreviewHtml);
  }, [composePreviewHtml]);

  // - Compose & Draft Methods -

  function openCompose(nextMode: Exclude<ComposeMode, "closed"> = "popup") {
    const fallbackAlias =
      composeDraft.fromAlias ||
      selectedAlias ||
      snapshot?.selectedAlias ||
      currentUser?.email ||
      "";

    setComposeDraft((current) => ({
      ...current,
      fromAlias: fallbackAlias || current.fromAlias,
    }));
    setComposeIntent({ kind: "compose" });
    setComposeError(null);
    setComposeMode(nextMode);
  }

  function openComposeForMessage(
    kind: Exclude<ComposeIntentKind, "compose">,
    nextMode: Exclude<ComposeMode, "closed"> = "side",
    messageOverride?: AdminMailboxMessage | null,
  ) {
    const baseMessage = messageOverride || selectedMessage;
    if (!baseMessage) {
      return;
    }

    const fallbackAlias =
      composeDraft.fromAlias ||
      selectedAlias ||
      snapshot?.selectedAlias ||
      currentUser?.email ||
      "";

    const fallbackRecipients =
      kind === "forward"
        ? ""
        : [
            baseMessage.replyTo || baseMessage.from,
            ...(kind === "reply_all"
              ? [baseMessage.to, ...(baseMessage.cc || [])]
              : []),
          ]
            .flatMap((entry) => splitRecipients(entry || ""))
            .filter((entry, index, array) => array.indexOf(entry) === index)
            .filter(
              (entry) => entry.toLowerCase() !== fallbackAlias.toLowerCase(),
            )
            .join(", ");

    setComposeDraft((current) => ({
      ...current,
      fromAlias: fallbackAlias,
      to: fallbackRecipients,
      subject:
        kind === "forward"
          ? prefixSubject("Fwd:", baseMessage.subject)
          : prefixSubject("Re:", baseMessage.subject),
      body: "",
    }));
    setComposeIntent({
      kind,
      messageId: baseMessage.id,
    });
    setComposeError(null);
    setContextMenu(null);
    setComposeMode(nextMode);
  }

  function closeCompose() {
    setComposeMode("closed");
    setComposeIntent({ kind: "compose" });
    setComposeError(null);
    setComposePreviewHtml("");
    setComposeTemplateFiles([]);
    setComposePreviewError(null);
    setComposeDraft((current) => ({
      ...current,
      to: "",
      subject: "",
      body: "",
    }));
  }

  function updateComposeDraft<K extends keyof ComposeDraft>(
    key: K,
    value: ComposeDraft[K],
  ) {
    setComposeDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  useEffect(() => {
    if (composeMode === "closed" || composeIntent.kind !== "compose") {
      setComposePreviewHtml("");
      setComposeTemplateFiles([]);
      setComposePreviewError(null);
      setIsComposePreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setComposePreviewError(null);
      setIsComposePreviewLoading(true);

      try {
        const response = await fetch("/api/admin/mailbox/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAlias: deferredComposeFromAlias,
            subject: deferredComposeSubject,
            body: deferredComposeBody,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response
            .json()
            .catch(() => ({ error: "Failed to preview email" }));
          throw new Error(resolveApiError(payload, "Failed to preview email"));
        }

        const payload = (await response.json()) as ComposePreviewResponse;
        setComposePreviewHtml(payload.html || "");
        setComposeTemplateFiles(payload.sourceFiles || []);
      } catch (previewError) {
        if (controller.signal.aborted) {
          return;
        }

        setComposePreviewHtml("");
        setComposeTemplateFiles([]);
        setComposePreviewError(
          previewError instanceof Error
            ? previewError.message
            : "Failed to preview email",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsComposePreviewLoading(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    composeMode,
    composeIntent.kind,
    deferredComposeBody,
    deferredComposeFromAlias,
    deferredComposeSubject,
  ]);

  async function sendCompose() {
    if (isComposeSending) {
      return;
    }

    setComposeError(null);
    setIsComposeSending(true);

    try {
      const isComposeAction =
        composeIntent.kind !== "compose" && composeIntent.messageId;
      const response = await fetch(
        isComposeAction
          ? `/api/admin/mailbox/messages/${composeIntent.messageId}/actions`
          : "/api/admin/mailbox/compose",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isComposeAction
              ? {
                  alias: composeDraft.fromAlias,
                  action: composeIntent.kind,
                  to: splitRecipients(composeDraft.to),
                  subject: composeDraft.subject,
                  html: toComposeHtml(composeDraft.body),
                }
              : {
                  fromAlias: composeDraft.fromAlias,
                  to: composeDraft.to,
                  subject: composeDraft.subject,
                  body: composeDraft.body,
                },
          ),
        },
      );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Failed to send email" }));
        throw new Error(resolveApiError(payload, "Failed to send email"));
      }

      if (isComposeAction) {
        await response.json().catch(() => null);
      }
      closeCompose();
      void loadSnapshot({
        alias: selectedAlias || undefined,
        sync: !isComposeAction,
      });
    } catch (sendError) {
      setComposeError(
        sendError instanceof Error ? sendError.message : "Failed to send email",
      );
    } finally {
      setIsComposeSending(false);
    }
  }

  async function applyMailboxAction(
    action: string,
    payload: Record<string, unknown> = {},
    messageOverride?: AdminMailboxMessage | null,
  ) {
    const baseMessage = messageOverride || selectedMessage;
    if (!baseMessage || isMutating) {
      return;
    }

    setIsMutating(true);
    setContextMenu(null);

    if (action === "pin") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isPinned: true,
      }));
    } else if (action === "unpin") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isPinned: false,
      }));
    } else if (action === "star") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isStarred: true,
      }));
    } else if (action === "unstar") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isStarred: false,
      }));
    } else if (action === "mark_read") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isSeenByCurrentUser: true,
        seenBy: Array.from(
          new Set([...(message.seenBy || []), selectedAlias || message.alias]),
        ),
      }));
    } else if (action === "mark_unread") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        isSeenByCurrentUser: false,
        seenBy: (message.seenBy || []).filter(
          (viewer) =>
            viewer.toLowerCase() !==
            (selectedAlias || message.alias).toLowerCase(),
        ),
      }));
    } else if (action === "archive" || action === "done") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        folder: "archive",
      }));
    } else if (action === "spam") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        folder: "junk",
      }));
    } else if (action === "trash") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        folder: "trash",
      }));
    } else if (action === "move" && typeof payload.targetFolder === "string") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        folder: String(payload.targetFolder),
      }));
    } else if (action === "snooze") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        snoozedUntil:
          typeof payload.snoozeUntil === "string"
            ? payload.snoozeUntil
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));
    } else if (action === "unsnooze") {
      patchMessageLocally(baseMessage.id, (message) => ({
        ...message,
        snoozedUntil: null,
      }));
    }

    try {
      const response = await fetch(
        `/api/admin/mailbox/messages/${baseMessage.id}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alias: selectedAlias,
            action,
            ...payload,
          }),
        },
      );

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: "Failed to apply mail action" }));
        throw new Error(resolveApiError(result, "Failed to apply mail action"));
      }

      const data = (await response.json()) as AdminMailboxActionResponse;
      mergeServerMessage(data.message);

      if (data.unsubscribeUrl) {
        window.open(data.unsubscribeUrl, "_blank", "noopener,noreferrer");
      }
    } catch (actionError) {
      void loadSnapshot({ alias: selectedAlias || undefined, sync: false });
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to apply mail action",
      );
    } finally {
      setIsMutating(false);
    }
  }

  // - Workspace Interaction -

  async function handleAliasChange(alias: string) {
    setSelectedAlias(alias);
    setComposeDraft((current) => ({
      ...current,
      fromAlias: alias || current.fromAlias,
    }));
    try {
      await loadSnapshot({ alias, sync: true });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to switch alias",
      );
    }
  }

  async function handleSync() {
    if (isSyncing) {
      return;
    }

    setIsSyncing(true);
    try {
      await loadSnapshot({ alias: selectedAlias || undefined, sync: true });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Mailbox sync failed",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function markSeen(scope: "self" | "team") {
    if (!selectedMessage || isMutating) {
      return;
    }

    setIsMutating(true);
    if (scope === "self") {
      patchMessageLocally(selectedMessage.id, (message) => ({
        ...message,
        isSeenByCurrentUser: true,
        seenBy: Array.from(
          new Set([...(message.seenBy || []), selectedAlias || message.alias]),
        ),
      }));
    } else {
      patchMessageLocally(selectedMessage.id, (message) => ({
        ...message,
        seenForTeam: true,
      }));
    }

    try {
      const response = await fetch(
        `/api/admin/mailbox/messages/${selectedMessage.id}/seen`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alias: selectedAlias,
            scope,
          }),
        },
      );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Failed to mark as seen" }));
        throw new Error(resolveApiError(payload, "Failed to mark as seen"));
      }

      const data = (await response.json()) as MailboxSeenResponse;
      mergeServerMessage(data.message);
    } catch (markError) {
      void loadSnapshot({ alias: selectedAlias || undefined, sync: false });
      setError(
        markError instanceof Error
          ? markError.message
          : "Failed to mark as seen",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const handleMessageContextMenu = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      kind: MailContextMenuKind,
      message: AdminMailboxMessage,
    ) => {
      event.preventDefault();
      setSelectedMessageId(message.id);
      openContextMenuAt(event.clientX, event.clientY, kind, message.id);
    },
    [openContextMenuAt],
  );

  const handlePreviewFrameLoad = useCallback(() => {
    const iframe = previewFrameRef.current;
    const message = selectedMessage;
    if (!iframe || !message) {
      return;
    }

    try {
      const frameWindow = iframe.contentWindow;
      const frameDocument = frameWindow?.document;
      if (!frameWindow || !frameDocument) {
        return;
      }

      const handler = (event: MouseEvent) => {
        event.preventDefault();
        const rect = iframe.getBoundingClientRect();
        openContextMenuAt(
          rect.left + event.clientX,
          rect.top + event.clientY,
          "preview",
          message.id,
        );
      };

      frameDocument.oncontextmenu = handler;
    } catch {
      // keep native behavior if iframe document is not accessible
    }
  }, [openContextMenuAt, selectedMessage]);

  // --- Render Blocks ---

  if (isLoading) {
    return (
      <div className="h-full min-h-0 p-3">
        <div className="flex h-full min-h-[620px] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,11,17,0.96),rgba(5,8,14,0.96))]">
          <div className="flex w-[60px] flex-col border-r border-white/10 bg-[rgba(7,10,15,0.98)] p-2">
            <div className="mb-4 flex h-10 items-center justify-center">
              <Skeleton className="h-8 w-8 rounded-[12px] bg-white/10" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
              <Skeleton className="h-8 w-full rounded-md bg-white/5" />
            </div>
            <div className="mt-auto pb-1">
              <Skeleton className="h-10 w-full rounded-[12px] bg-white/5" />
            </div>
          </div>

          <div className="hidden flex-1 flex-col border-r border-white/10 bg-[rgba(8,11,17,0.98)] md:flex">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-6 w-12 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-8 w-full rounded-[12px] bg-white/5" />
              <Skeleton className="h-8 w-full rounded-[12px] bg-white/5" />
            </div>
            <div className="flex flex-col">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 border-b border-white/5 p-3"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-2 w-2 rounded-full bg-white/5" />
                  </div>
                  <Skeleton className="h-3 w-24 bg-white/5" />
                  <Skeleton className="h-3 w-48 bg-white/5" />
                  <Skeleton className="h-2 w-12 bg-white/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col bg-[rgba(9,12,18,0.9)]">
            <header className="flex h-[60px] items-center justify-between border-b border-white/10 px-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-4 w-32 bg-white/10" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full bg-white/10" />
            </header>
            <div className="flex flex-col gap-4 p-4">
              <div className="space-y-3 rounded-[16px] border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/3 bg-white/10" />
                  <Skeleton className="h-4 w-12 rounded-full bg-white/5" />
                </div>
                <Skeleton className="h-3 w-32 bg-white/5" />
                <Skeleton className="h-3 w-40 bg-white/5" />
                <Skeleton className="h-2 w-20 bg-white/5" />
              </div>

              <div className="space-y-3 rounded-[16px] border border-white/10 bg-white/5 p-4">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-5/6 bg-white/5" />
                </div>
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 p-3">
      <div className="relative flex h-full min-h-[620px] w-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,11,17,0.96),rgba(5,8,14,0.96))]">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Folder Sidebar */}
          <aside className="hidden w-[72px] shrink-0 border-r border-white/10 bg-[rgba(7,10,15,0.98)] md:flex md:flex-col">
            <div className="flex flex-col items-center gap-2 px-2 py-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.1)] ">
                <MailSnow size={18} color="currentColor" />
              </div>
              <hr className="divider-dashed w-full" />
              {FOLDERS.map((item, index) => {
                const Icon = item.icon;
                const folderCount = computeFolderCount(
                  snapshot?.messages || [],
                  item.key,
                );
                const folderUnread = computeFolderUnread(
                  snapshot?.messages || [],
                  item.key,
                );

                return (
                  <>
                    {index >= 1 ? (
                      <hr className="divider-dashed w-full my-2 opacity-50" />
                    ) : null}
                    <button
                      key={item.key}
                      type="button"
                      title={`${item.label} · ${folderCount}`}
                      onClick={() => setActiveFolder(item.key)}
                      className={cn(
                        MUTED_ICON_BUTTON_CLASS,
                        "relative",
                        activeFolder === item.key
                          ? MUTED_ICON_BUTTON_ACTIVE_CLASS
                          : "",
                      )}
                    >
                      <Icon variant="Bulk" size={16} color="currentColor" />
                      {folderUnread ? (
                        <span className="absolute -right-1 -top-1 rounded-full border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.16)] px-1 text-[8px] font-semibold text-sq-brand-action">
                          {folderUnread}
                        </span>
                      ) : null}
                    </button>
                  </>
                );
              })}
            </div>

            <div className="mt-auto border-t border-white/10 p-3">
              <div className={cn(MUTED_ICON_BUTTON_CLASS, "mx-auto")}>
                <Profile2User variant="Bulk" size={16} color="currentColor" />
              </div>
            </div>
          </aside>

          {/* Message List Section */}
          {!isPreviewExpanded ? (
            <section className="flex min-h-[260px] w-full flex-col border-b border-white/10 bg-[rgba(8,11,17,0.98)] md:min-h-0 md:w-[390px] md:shrink-0 md:border-b-0 md:border-r xl:w-[430px]">
              <div className="shrink-0 border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">
                      {activeFolder}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-white/76">
                      {filteredMessages.length} messages
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompactTiles((current) => !current);
                    }}
                    className={MUTED_PILL_BUTTON_CLASS}
                  >
                    {isCompactTiles ? "Expand" : "Compact"}
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <Select
                    value={selectedAlias}
                    onValueChange={(value) => {
                      void handleAliasChange(value);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-full border border-white/10 bg-white/5 px-3 text-[11px] text-white/70">
                      <SelectValue placeholder="Select alias" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#090d14] text-white">
                      <SelectGroup>
                        {(snapshot?.aliases || []).map((aliasItem) => (
                          <SelectItem
                            key={aliasItem.alias}
                            value={aliasItem.alias}
                          >
                            {aliasItem.alias} · unread {aliasItem.unread}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredMessages.length ? (
                  filteredMessages.map((message) => {
                    const isSelected = selectedMessageId === message.id;
                    const isUnread = !message.isSeenByCurrentUser;

                    return (
                      <button
                        key={message.id}
                        type="button"
                        title={`${message.subject} • ${message.from}`}
                        onClick={() => setSelectedMessageId(message.id)}
                        onContextMenu={(event) =>
                          handleMessageContextMenu(event, "list", message)
                        }
                        className={cn(
                          "flex w-full flex-col items-start border-b border-white/5 px-4 text-left transition-all",
                          isCompactTiles ? "gap-1 py-2.5" : "gap-1.5 py-3.5",
                          isSelected
                            ? "border-l-2 border-l-[var(--sq-brand-action)] bg-[rgba(205,255,4,0.06)]"
                            : "hover:bg-white/4",
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span
                              className={cn(
                                "line-clamp-1 flex-1 font-medium text-white/90",
                                isCompactTiles ? "text-[11px]" : "text-[12px]",
                              )}
                            >
                              {message.subject}
                            </span>
                            {message.isPinned ? (
                              <Pin
                                size={12}
                                className="shrink-0 text-white/45"
                              />
                            ) : null}
                            {message.isStarred ? (
                              <Star
                                size={12}
                                className="shrink-0 fill-current text-[var(--sq-brand-action)]"
                              />
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            {message.snoozedUntil ? (
                              <Clock3
                                size={12}
                                className="shrink-0 text-white/40"
                              />
                            ) : null}
                            {isUnread ? (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--sq-brand-action)] shadow-[0_0_8px_var(--sq-brand-action)]" />
                            ) : null}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "line-clamp-1 w-full text-white/60",
                            isCompactTiles ? "text-[10px]" : "text-[11px]",
                          )}
                        >
                          {message.from}
                        </span>
                        <span
                          className={cn(
                            "w-full text-[10px] leading-relaxed text-white/40",
                            isCompactTiles
                              ? "mt-0.5 line-clamp-1"
                              : "mt-1 line-clamp-2 text-[11px]",
                          )}
                        >
                          {message.preview ||
                            toPlainText(stripMimeArtifacts(message.body))}
                        </span>
                        <span
                          className={cn(
                            "uppercase tracking-wider text-white/30",
                            isCompactTiles
                              ? "mt-1 text-[8px]"
                              : "mt-2 text-[9px]",
                          )}
                        >
                          {formatTime(message.receivedAt)}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-[11px] text-white/45">
                    No messages in this folder.
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* Message Preview Section */}
          <section className="flex min-w-0 flex-1 flex-col bg-[rgba(9,12,18,0.9)]">
            <div className="shrink-0 border-b border-white/10 px-5 py-3">
              <div className="flex items-center justify-between gap-3 ">
                <div className="min-w-0">
                  <p className="mt-1 truncate text-[20px] font-semibold text-white/78">
                    {selectedMessage?.subject ||
                      selectedAlias ||
                      "Select a message"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="rounded-full border border-white/12 bg-white/3 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/62">
                    {selectedAlias || "No alias selected"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openCompose("side");
                    }}
                    className={MUTED_ICON_BUTTON_CLASS}
                  >
                    <SmsEdit size={16} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewExpanded((current) => !current);
                    }}
                    className={cn(
                      MUTED_ICON_BUTTON_CLASS,
                      isPreviewExpanded ? MUTED_ICON_BUTTON_ACTIVE_CLASS : "",
                    )}
                  >
                    {isPreviewExpanded ? (
                      <SidebarLeft size={16} color="currentColor" />
                    ) : (
                      <SidebarRight size={16} color="currentColor" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSync()}
                    disabled={isSyncing}
                    className={cn(
                      MUTED_ICON_BUTTON_CLASS,
                      isSyncing ? "opacity-60" : "",
                    )}
                  >
                    {isSyncing ? (
                      <Loader className="h-4 w-4 animate-spin opacity-60" />
                    ) : (
                      <CloudAdd size={16} color="currentColor" />
                    )}
                  </button>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className={cn(MUTED_INPUT_CLASS, "w-[200px]")}
                    placeholder="Search messages"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
              {selectedMessage ? (
                <div
                  className="mx-auto flex max-w-4xl flex-col gap-6"
                  onContextMenu={(event) =>
                    handleMessageContextMenu(event, "preview", selectedMessage)
                  }
                >
                  <div className="flex flex-col gap-6 rounded-[24px] border border-white/5 bg-white/[0.02] p-6 shadow-sm backdrop-blur-md lg:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                        {selectedMessage.folder}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          title="Reply"
                          onClick={() => openComposeForMessage("reply")}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <Reply size={15} />
                        </button>
                        <button
                          type="button"
                          title="Reply all"
                          onClick={() => openComposeForMessage("reply_all")}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <ReplyAll size={15} />
                        </button>
                        <button
                          type="button"
                          title="Forward"
                          onClick={() => openComposeForMessage("forward")}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <Forward size={15} />
                        </button>
                        <button
                          type="button"
                          title={selectedMessage.isStarred ? "Unstar" : "Star"}
                          onClick={() =>
                            void applyMailboxAction(
                              selectedMessage.isStarred ? "unstar" : "star",
                            )
                          }
                          disabled={isMutating}
                          className={cn(
                            MUTED_ICON_BUTTON_CLASS,
                            selectedMessage.isStarred
                              ? MUTED_ICON_BUTTON_ACTIVE_CLASS
                              : "",
                          )}
                        >
                          <Star
                            size={15}
                            className={
                              selectedMessage.isStarred ? "fill-current" : ""
                            }
                          />
                        </button>
                        <button
                          type="button"
                          title={selectedMessage.isPinned ? "Unpin" : "Pin"}
                          onClick={() =>
                            void applyMailboxAction(
                              selectedMessage.isPinned ? "unpin" : "pin",
                            )
                          }
                          disabled={isMutating}
                          className={cn(
                            MUTED_ICON_BUTTON_CLASS,
                            selectedMessage.isPinned
                              ? MUTED_ICON_BUTTON_ACTIVE_CLASS
                              : "",
                          )}
                        >
                          <Pin size={15} />
                        </button>
                        <button
                          type="button"
                          title={
                            selectedMessage.isSeenByCurrentUser
                              ? "Mark unread"
                              : "Mark read"
                          }
                          onClick={() =>
                            void applyMailboxAction(
                              selectedMessage.isSeenByCurrentUser
                                ? "mark_unread"
                                : "mark_read",
                            )
                          }
                          disabled={isMutating}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          {selectedMessage.isSeenByCurrentUser ? (
                            <Mail size={15} />
                          ) : (
                            <MailOpen size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          title="Archive"
                          onClick={() => void applyMailboxAction("archive")}
                          disabled={isMutating}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          type="button"
                          title="Mark spam"
                          onClick={() => void applyMailboxAction("spam")}
                          disabled={isMutating}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <ShieldAlert size={15} />
                        </button>
                        <button
                          type="button"
                          title="Move to trash"
                          onClick={() => void applyMailboxAction("trash")}
                          disabled={isMutating}
                          className={MUTED_ICON_BUTTON_CLASS}
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          type="button"
                          title={
                            selectedMessage.snoozedUntil
                              ? "Unsnooze"
                              : "Snooze 1 day"
                          }
                          onClick={() =>
                            void applyMailboxAction(
                              selectedMessage.snoozedUntil
                                ? "unsnooze"
                                : "snooze",
                              selectedMessage.snoozedUntil
                                ? {}
                                : {
                                    snoozeUntil: new Date(
                                      Date.now() + 24 * 60 * 60 * 1000,
                                    ).toISOString(),
                                  },
                            )
                          }
                          disabled={isMutating}
                          className={cn(
                            MUTED_ICON_BUTTON_CLASS,
                            selectedMessage.snoozedUntil
                              ? MUTED_ICON_BUTTON_ACTIVE_CLASS
                              : "",
                          )}
                        >
                          <Clock3 size={15} />
                        </button>
                        {selectedMessage.listUnsubscribe ? (
                          <button
                            type="button"
                            title="Unsubscribe"
                            onClick={() =>
                              void applyMailboxAction("unsubscribe", {
                                allowExternal: true,
                              })
                            }
                            disabled={isMutating}
                            className={MUTED_ICON_BUTTON_CLASS}
                          >
                            <MailMinus size={15} />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 border-t border-white/5 pt-6 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                          From
                        </span>
                        <span className="text-[13px] text-white/80">
                          {selectedMessage.from}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                          To
                        </span>
                        <span className="text-[13px] text-white/60">
                          {selectedMessage.to}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                          Date
                        </span>
                        <span className="text-[12px] text-white/50">
                          {formatTime(selectedMessage.receivedAt)}
                        </span>
                      </div>
                      {selectedMessage.replyTo ? (
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                            Reply-To
                          </span>
                          <span className="text-[12px] text-white/56">
                            {selectedMessage.replyTo}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-5">
                      <select
                        value={moveTarget}
                        onChange={(event) => setMoveTarget(event.target.value)}
                        className={cn(
                          MUTED_INPUT_CLASS,
                          "w-[130px] text-[10px] uppercase tracking-[0.16em]",
                        )}
                      >
                        {MOVE_TARGET_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#0a0d14]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          void applyMailboxAction("move", {
                            targetFolder: moveTarget,
                          })
                        }
                        disabled={isMutating}
                        className={MUTED_PILL_BUTTON_CLASS}
                      >
                        <ArrowRightLeft size={14} />
                        Move
                      </button>
                    </div>
                  </div>

                  <div className=" bg-white rounded-3xl p-6 shadow-sm backdrop-blur-md lg:p-8">
                    {resolvePreviewHtml(selectedMessage) ? (
                      <div className="overflow-auto border border-white/6 bg-transparent">
                        <iframe
                          ref={previewFrameRef}
                          title={`Mail preview: ${selectedMessage.subject || "message"}`}
                          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                          onLoad={handlePreviewFrameLoad}
                          className="h-[76vh] max-h-[900px] min-h-[460px] w-full border-0"
                          srcDoc={buildHtmlPreviewDocument(
                            resolvePreviewHtml(selectedMessage)!,
                          )}
                        />
                      </div>
                    ) : looksLikeMarkdown(
                        stripMimeArtifacts(selectedMessage.body),
                      ) ? (
                      <div className="border border-white/6 bg-white/1.5 p-5">
                        {renderMarkdownBody(
                          stripMimeArtifacts(selectedMessage.body),
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap wrap-break-word text-[14px] leading-[1.8] text-white/80">
                        {renderInlineTextWithLinks(
                          toPlainText(
                            stripMimeArtifacts(selectedMessage.body),
                          ) ||
                            selectedMessage.preview ||
                            "Empty body",
                          "mail-text",
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md lg:px-6">
                    <button
                      type="button"
                      onClick={() => void markSeen("self")}
                      disabled={
                        isMutating || selectedMessage.isSeenByCurrentUser
                      }
                      className={cn(
                        MUTED_PILL_BUTTON_CLASS,
                        selectedMessage.isSeenByCurrentUser
                          ? "border-white/5 bg-white/5 text-white/30"
                          : MUTED_ICON_BUTTON_ACTIVE_CLASS,
                      )}
                    >
                      {selectedMessage.isSeenByCurrentUser
                        ? "Seen"
                        : "Mark seen"}
                    </button>

                    {snapshot?.canManageTeamSeen ? (
                      <button
                        type="button"
                        onClick={() => void markSeen("team")}
                        disabled={isMutating || selectedMessage.seenForTeam}
                        className={cn(
                          MUTED_PILL_BUTTON_CLASS,
                          selectedMessage.seenForTeam
                            ? "border-white/5 bg-white/5 text-white/30"
                            : "",
                        )}
                      >
                        {selectedMessage.seenForTeam
                          ? "Seen by team"
                          : "Mark seen for team"}
                      </button>
                    ) : null}
                  </div>

                  <div className="rounded-[16px] px-2 py-1 text-[11px] text-white/40">
                    <span className="font-medium text-white/50">
                      Viewed by:
                    </span>{" "}
                    {selectedMessage.seenBy.length
                      ? selectedMessage.seenBy.join(", ")
                      : "No one yet"}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-white/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/5 bg-white/[0.02]">
                      <DirectInbox
                        variant="Bulk"
                        size={32}
                        className="text-white/20"
                        color="currentColor"
                      />
                    </div>
                    <p className="text-[13px] font-medium tracking-wide">
                      Select a message to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {contextMenu && contextMenuMessage && typeof document !== "undefined"
          ? createPortal(
              <div className="pointer-events-none fixed inset-0 z-[90]">
                <div
                  ref={contextMenuRef}
                  className="pointer-events-auto fixed w-[240px] overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,24,0.98),rgba(8,12,18,0.98))] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                  <div className="border-b border-white/8 px-2 pb-2 pt-1">
                    <p className="line-clamp-1 text-[11px] font-medium text-white/82">
                      {contextMenuMessage.subject}
                    </p>
                    <p className="line-clamp-1 text-[10px] text-white/40">
                      {contextMenu.kind === "list"
                        ? "Mail item actions"
                        : "Preview quick actions"}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() =>
                        openComposeForMessage(
                          "reply",
                          "side",
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Reply size={14} /> Reply
                      </span>
                      <span className="text-[10px] text-white/30">R</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openComposeForMessage(
                          "reply_all",
                          "side",
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ReplyAll size={14} /> Reply all
                      </span>
                      <span className="text-[10px] text-white/30">A</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openComposeForMessage(
                          "forward",
                          "side",
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Forward size={14} /> Forward
                      </span>
                      <span className="text-[10px] text-white/30">F</span>
                    </button>
                    <div className="my-1 border-t border-white/8" />
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction(
                          contextMenuMessage.isSeenByCurrentUser
                            ? "mark_unread"
                            : "mark_read",
                          {},
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        {contextMenuMessage.isSeenByCurrentUser ? (
                          <Mail size={14} />
                        ) : (
                          <MailOpen size={14} />
                        )}
                        {contextMenuMessage.isSeenByCurrentUser
                          ? "Mark unread"
                          : "Mark read"}
                      </span>
                      <span className="text-[10px] text-white/30">M</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction(
                          contextMenuMessage.isStarred ? "unstar" : "star",
                          {},
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Star
                          size={14}
                          className={
                            contextMenuMessage.isStarred ? "fill-current" : ""
                          }
                        />
                        {contextMenuMessage.isStarred ? "Remove star" : "Star"}
                      </span>
                      <span className="text-[10px] text-white/30">S</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction(
                          contextMenuMessage.isPinned ? "unpin" : "pin",
                          {},
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Pin size={14} />{" "}
                        {contextMenuMessage.isPinned ? "Unpin" : "Pin"}
                      </span>
                      <span className="text-[10px] text-white/30">P</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction(
                          contextMenuMessage.snoozedUntil
                            ? "unsnooze"
                            : "snooze",
                          contextMenuMessage.snoozedUntil
                            ? {}
                            : {
                                snoozeUntil: new Date(
                                  Date.now() + 24 * 60 * 60 * 1000,
                                ).toISOString(),
                              },
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={14} />{" "}
                        {contextMenuMessage.snoozedUntil
                          ? "Unsnooze"
                          : "Snooze 1 day"}
                      </span>
                      <span className="text-[10px] text-white/30">Z</span>
                    </button>
                    <div className="my-1 border-t border-white/8" />
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction(
                          "archive",
                          {},
                          contextMenuMessage,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Archive size={14} /> Archive
                      </span>
                      <span className="text-[10px] text-white/30">E</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction("spam", {}, contextMenuMessage)
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShieldAlert size={14} /> Mark spam
                      </span>
                      <span className="text-[10px] text-white/30">J</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void applyMailboxAction("trash", {}, contextMenuMessage)
                      }
                      className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-[#ffb4a3] transition hover:bg-[#ff8a65]/10 hover:text-[#ffd0c3]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 size={14} /> Move to trash
                      </span>
                      <span className="text-[10px] text-[#ff9e86]/40">Del</span>
                    </button>
                    {contextMenu.kind === "preview" &&
                    contextMenuMessage.listUnsubscribe ? (
                      <button
                        type="button"
                        onClick={() =>
                          void applyMailboxAction(
                            "unsubscribe",
                            { allowExternal: true },
                            contextMenuMessage,
                          )
                        }
                        className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[12px] text-white/72 transition hover:bg-white/8 hover:text-white"
                      >
                        <span className="inline-flex items-center gap-2">
                          <MailMinus size={14} /> Unsubscribe
                        </span>
                        <span className="text-[10px] text-white/30">U</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}

        {/* Error Toast — bottom-right of workspace */}
        {error ? (
          <div className="pointer-events-none absolute inset-0 z-40">
            <div className="pointer-events-auto absolute bottom-5 right-5">
              <ToastItem
                toast={{
                  id: "mailbox-error",
                  type: "error",
                  message: error,
                  duration: 8000,
                }}
                onDismiss={() => setError(null)}
              />
            </div>
          </div>
        ) : null}

        {/* Compose Experience (Popups / Side Panels) */}
        {composeMode !== "closed" ? (
          <div className="pointer-events-none absolute inset-0 z-30">
            {composeMode === "popup" ? (
              <div className="pointer-events-auto absolute bottom-5 right-5 w-[360px] overflow-hidden rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,16,24,0.98),rgba(8,12,18,0.98))] shadow-[0_26px_70px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
                    {composeTitle}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setComposeMode("side")}
                      className={cn(
                        MUTED_PILL_BUTTON_CLASS,
                        "h-8 px-2.5 text-[9px]",
                      )}
                    >
                      Expand
                    </button>
                    <button
                      type="button"
                      onClick={closeCompose}
                      className={cn(
                        MUTED_PILL_BUTTON_CLASS,
                        "h-8 px-2.5 text-[9px]",
                      )}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="space-y-2.5 p-3">
                  <select
                    value={composeDraft.fromAlias}
                    onChange={(event) =>
                      updateComposeDraft("fromAlias", event.target.value)
                    }
                    className="h-8 w-full rounded-full border border-white/10 bg-white/5 px-2.5 text-[11px] text-white/70 outline-none"
                  >
                    {(snapshot?.aliases || []).map((aliasItem) => (
                      <option
                        key={aliasItem.alias}
                        value={aliasItem.alias}
                        className="bg-[#0a0d14]"
                      >
                        From {aliasItem.alias}
                      </option>
                    ))}
                  </select>
                  <input
                    value={composeDraft.to}
                    onChange={(event) =>
                      updateComposeDraft("to", event.target.value)
                    }
                    placeholder={
                      composeRecipientsLocked
                        ? "Recipients resolved from thread"
                        : "To"
                    }
                    readOnly={composeRecipientsLocked}
                    className={cn(
                      "h-8 w-full rounded-full border border-white/10 bg-white/5 px-2.5 text-[11px] text-white/70 placeholder:text-white/35 outline-none",
                      composeRecipientsLocked
                        ? "cursor-not-allowed opacity-70"
                        : "",
                    )}
                  />
                  <input
                    value={composeDraft.subject}
                    onChange={(event) =>
                      updateComposeDraft("subject", event.target.value)
                    }
                    placeholder="Subject"
                    className="h-8 w-full rounded-full border border-white/10 bg-white/5 px-2.5 text-[11px] text-white/70 placeholder:text-white/35 outline-none"
                  />
                  {isComposePreviewMode ? (
                    <p className="rounded-[12px] border border-white/8 bg-white/3 px-3 py-2 text-[10px] leading-[1.6] text-white/45">
                      This composer uses the official Square company template.
                      Expand to view the live preview and editable template file
                      paths.
                    </p>
                  ) : null}
                  <textarea
                    value={composeDraft.body}
                    onChange={(event) =>
                      updateComposeDraft("body", event.target.value)
                    }
                    placeholder="Write your message"
                    className="h-28 w-full resize-none rounded-[18px] border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-white/80 placeholder:text-white/35 outline-none"
                  />
                  {composeError ? (
                    <p className="rounded-[10px] border border-[#ff8a65]/24 bg-[#ff8a65]/10 px-2.5 py-1.5 text-[10px] text-[#ffb49d]">
                      {composeError}
                    </p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void sendCompose()}
                      disabled={isComposeSending}
                      className={cn(
                        MUTED_PILL_BUTTON_CLASS,
                        MUTED_ICON_BUTTON_ACTIVE_CLASS,
                      )}
                    >
                      <Send2 size={12} color="currentColor" />
                      {isComposeSending ? "Sending" : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {composeMode === "side" ? (
              <>
                <div
                  className="pointer-events-auto absolute inset-0 bg-black/40 backdrop-blur-[1.5px]"
                  onClick={closeCompose}
                />
                <aside className="pointer-events-auto absolute inset-5 flex overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,15,22,0.98),rgba(7,10,16,0.98))] shadow-[0_32px_90px_rgba(0,0,0,0.48)]">
                  <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                    <div className="flex w-full max-w-[430px] flex-col border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">
                            Mail action
                          </p>
                          <p className="mt-1 text-[14px] font-semibold text-white">
                            {composeTitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setComposeMode("popup")}
                            className={MUTED_PILL_BUTTON_CLASS}
                          >
                            Minimize
                          </button>
                          <button
                            type="button"
                            onClick={closeCompose}
                            className={MUTED_PILL_BUTTON_CLASS}
                          >
                            Close
                          </button>
                        </div>
                      </header>

                      <div className="flex-1 space-y-4 overflow-y-auto p-5">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                            From
                          </p>
                          <select
                            value={composeDraft.fromAlias}
                            onChange={(event) =>
                              updateComposeDraft(
                                "fromAlias",
                                event.target.value,
                              )
                            }
                            className="h-9 w-full rounded-full border border-white/10 bg-white/5 px-3 text-[12px] text-white/70 outline-none"
                          >
                            {(snapshot?.aliases || []).map((aliasItem) => (
                              <option
                                key={aliasItem.alias}
                                value={aliasItem.alias}
                                className="bg-[#0a0d14]"
                              >
                                {aliasItem.alias}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                            To
                          </p>
                          <input
                            value={composeDraft.to}
                            onChange={(event) =>
                              updateComposeDraft("to", event.target.value)
                            }
                            placeholder={
                              composeRecipientsLocked
                                ? "Recipients resolved from thread"
                                : "client@company.com"
                            }
                            readOnly={composeRecipientsLocked}
                            className={cn(
                              "h-9 w-full rounded-full border border-white/10 bg-white/5 px-3 text-[12px] text-white/70 placeholder:text-white/35 outline-none",
                              composeRecipientsLocked
                                ? "cursor-not-allowed opacity-70"
                                : "",
                            )}
                          />
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                            Subject
                          </p>
                          <input
                            value={composeDraft.subject}
                            onChange={(event) =>
                              updateComposeDraft("subject", event.target.value)
                            }
                            placeholder="Subject"
                            className="h-9 w-full rounded-full border border-white/10 bg-white/5 px-3 text-[12px] text-white/70 placeholder:text-white/35 outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                              Message
                            </p>
                          </div>
                          <textarea
                            value={composeDraft.body}
                            onChange={(event) =>
                              updateComposeDraft("body", event.target.value)
                            }
                            placeholder="Write your message"
                            className="min-h-[320px] w-full resize-none rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-[13px] leading-[1.8] text-white/86 placeholder:text-white/30 outline-none"
                          />
                        </div>

                        {composeError ? (
                          <p className="rounded-[10px] border border-[#ff8a65]/24 bg-[#ff8a65]/10 px-3 py-2 text-[11px] text-[#ffb49d]">
                            {composeError}
                          </p>
                        ) : null}
                      </div>

                      <footer className="border-t border-white/10 px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={closeCompose}
                            className={MUTED_PILL_BUTTON_CLASS}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void sendCompose()}
                            disabled={isComposeSending}
                            className={cn(
                              MUTED_PILL_BUTTON_CLASS,
                              MUTED_ICON_BUTTON_ACTIVE_CLASS,
                            )}
                          >
                            <Send2 size={12} color="currentColor" />
                            {isComposeSending
                              ? "Sending"
                              : composeIntent.kind === "compose"
                                ? "Send email"
                                : "Send reply"}
                          </button>
                        </div>
                      </footer>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top,rgba(205,255,4,0.08),transparent_32%),rgba(6,9,14,0.82)]">
                      <div className="min-h-0 flex-1 overflow-auto p-5">
                        {isComposePreviewMode ? (
                          composePreviewDocument ? (
                            <div className="mx-auto max-w-[900px] overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
                              <iframe
                                title="Compose preview"
                                className="min-h-[820px] w-full border-0 bg-white"
                                srcDoc={composePreviewDocument}
                              />
                            </div>
                          ) : (
                            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                              <div className="max-w-[420px]">
                                <p className="text-[14px] font-semibold text-white/72">
                                  {composePreviewError
                                    ? "Preview unavailable right now"
                                    : isComposePreviewLoading
                                      ? "Rendering template preview..."
                                      : "Start writing to preview your company template."}
                                </p>
                                <p className="mt-2 text-[12px] leading-[1.7] text-white/42">
                                  {composePreviewError ||
                                    "Your subject and message body will appear inside the official Square template here."}
                                </p>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex h-full min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
                            <div className="max-w-[420px]">
                              <p className="text-[14px] font-semibold text-white/72">
                                Thread replies keep the native mailbox flow
                              </p>
                              <p className="mt-2 text-[12px] leading-[1.7] text-white/42">
                                The official Square preview is shown for new
                                outbound mails, while reply and forward actions
                                continue to respect the original email thread.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

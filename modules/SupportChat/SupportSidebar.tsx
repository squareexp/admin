"use client";

import React from "react";
import { Search, User } from "lucide-react";
import { Headphone } from "iconsax-react";
import { glassInputClass, glassPillButtonClass } from "@/components/ui/glass";
import { cn } from "@/lib/utils";

interface ChatSession {
  sessionId: string;
  name?: string;
  email?: string;
  lastSeenAt: string;
  connected: boolean;
  unseenCount?: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  from: "client" | "admin";
  text: string;
  timestamp: string;
  adminName?: string;
}

interface SupportSidebarProps {
  isSupportConnected: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredSessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  supportMessages: Record<string, ChatMessage[]>;
}

function formatSessionTimestamp(value: string) {
  const date = new Date(value);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export const SupportSidebar: React.FC<SupportSidebarProps> = ({
  isSupportConnected,
  searchQuery,
  setSearchQuery,
  filteredSessions,
  activeSessionId,
  setActiveSessionId,
  supportMessages,
}) => {
  return (
    <div
      className={cn(
        "flex min-h-0 w-[280px] shrink-0 flex-col border-r border-white/10 bg-black/25",
        activeSessionId ? "hidden md:flex" : "flex",
      )}
    >
      <div className="border-b border-dashed border-white/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Headphone variant="Bulk" className="text-sq-brand-action" size={18} />
            Client Support
          </h1>
          <div className={cn(glassPillButtonClass, "h-8 px-2.5 text-[10px] uppercase tracking-[0.18em]")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", isSupportConnected ? "bg-emerald-400" : "bg-rose-400")} />
            {isSupportConnected ? "Live" : "Offline"}
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
          <input
            type="text"
            placeholder="Search visitors..."
            className={cn(glassInputClass, "h-11 pl-9 pr-3 text-[12px]")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-[11px] text-white/36">
            No active sessions
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => {
              const sessionMessages = supportMessages[session.sessionId] || [];
              const lastMessage = sessionMessages[sessionMessages.length - 1];
              const isUnanswered = lastMessage?.from === "client";
              const isActive = activeSessionId === session.sessionId;

              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setActiveSessionId(session.sessionId)}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-[22px] border px-3 py-3 text-left transition-all",
                    isActive
                      ? "border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.08)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                      : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]",
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                      {session.name ? session.name.charAt(0).toUpperCase() : <User size={12} />}
                    </div>
                    {session.connected ? (
                      <span className="absolute -right-0.5 top-0 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className={cn("truncate text-[13px]", isActive ? "font-semibold text-white" : "font-medium text-white/84")}>
                        {session.name || "Visitor"}
                      </p>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/28">
                        {formatSessionTimestamp(session.lastSeenAt)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-white/30">
                      {session.email || `Visitor ${session.sessionId.slice(0, 6)}`}
                    </p>

                    <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/42">
                      {lastMessage?.text || "Conversation waiting for the first message."}
                    </p>
                  </div>

                  {isUnanswered ? (
                    <div className="absolute right-3 top-3 rounded-full bg-[rgba(205,255,4,0.16)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--sq-brand-action)]">
                      Waiting
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

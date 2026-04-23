"use client";

import React, { useState, useRef, useEffect } from "react";
import { NotificationBing } from "iconsax-react";
import { cn } from "@/lib/utils";
import type { AdminNotification } from "@/lib/admin-types";

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const typeIcons: Record<string, string> = {
  TASK_ASSIGNED: "\u{1F4CB}",
  TASK_STARTED: "\u{1F680}",
  TASK_COMPLETED: "\u2705",
  TASK_COMMENT: "\u{1F4AC}",
  TASK_PROGRESS_UPDATE: "\u{1F4CA}",
  BILLING_REMINDER: "\u{1F4B3}",
  TEAM_PROGRESS_REQUEST: "\u{1F4E8}",
  CHAT_MESSAGE: "\u{1F5E8}",
  DIRECT_MESSAGE: "\u{1F4E9}",
  SUPPORT_MESSAGE: "\u{1F6DF}",
};

export function NotificationBell({
  unreadCount,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onFetch,
}: {
  unreadCount: number;
  notifications: AdminNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onFetch: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) onFetch();
        }}
        className="relative rounded-[12px] border border-white/10 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
      >
        <NotificationBing size={18} color="currentColor" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--sq-brand-action)] px-1 text-[9px] font-bold text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] max-h-[480px] overflow-hidden rounded-[16px] border border-white/10 bg-[#0c0f18] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-[13px] font-semibold text-white">Notifications</p>
            {unreadCount > 0 ? (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-[var(--sq-brand-action)] transition hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-white/40">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) onMarkRead(n.id);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-white/8 px-4 py-3 text-left transition hover:bg-white/[0.03]",
                    !n.isRead ? "bg-[rgba(205,255,4,0.03)]" : "",
                  )}
                >
                  <span className="mt-0.5 text-[16px]">{typeIcons[n.type] || "\u{1F514}"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[12px] leading-snug",
                      !n.isRead ? "font-semibold text-white" : "text-white/70",
                    )}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/50 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-white/30">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--sq-brand-action)]" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

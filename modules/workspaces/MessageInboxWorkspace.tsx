"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, DirectInbox, More, Send2 } from "iconsax-react";
import { AnimatePresence } from "framer-motion";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import {
  glassIconButtonClass,
  glassInputClass,
  glassPillAccentButtonClass,
  glassPillButtonClass,
} from "@/components/ui/glass";
import { SurfaceCard, WorkspaceStateCard } from "@/components/dashboard";
import type {
  AdminMessage,
  AdminThreadSnapshot,
  ThreadTypingParticipant,
  UserProfile,
} from "@/lib/admin-types";
import { cn } from "@/lib/utils";

function formatThreadTimestamp(value: string) {
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

export function MessageInboxWorkspace({
  snapshot,
  isLoading,
  currentUser,
  activeThreadId,
  setActiveThreadId,
  messages,
  setThreadMessages,
  typingParticipants = [],
  sendThreadMessage,
  sendThreadTyping,
  toggleThreadReaction,
  markThreadRead,
}: {
  snapshot: AdminThreadSnapshot | null;
  isLoading?: boolean;
  currentUser: UserProfile | null;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  messages: AdminMessage[];
  setThreadMessages: (msgs: AdminMessage[]) => void;
  typingParticipants?: ThreadTypingParticipant[];
  sendThreadMessage: (threadId: string, body: string) => void | Promise<unknown>;
  sendThreadTyping?: (threadId: string, typing: boolean) => void;
  toggleThreadReaction?: (messageId: string, emoji: string) => void | Promise<void>;
  markThreadRead: (threadId: string) => void | Promise<unknown>;
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopTyping = useCallback(() => {
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    if (activeThreadId && sendThreadTyping) {
      sendThreadTyping(activeThreadId, false);
    }
  }, [activeThreadId, sendThreadTyping]);

  const openThread = (threadId: string) => {
    stopTyping();
    setInputValue("");
    setActiveThreadId(threadId);
  };

  const closeThread = () => {
    stopTyping();
    setInputValue("");
    setActiveThreadId(null);
  };

  useEffect(() => {
    if (activeThreadId && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeThreadId, typingParticipants.length]);

  useEffect(() => {
    if (!activeThreadId) return;

    void markThreadRead(activeThreadId);

    if (messages.length === 0) {
      fetch(`/api/admin/threads/${activeThreadId}/messages`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setThreadMessages(data);
        })
        .catch(() => undefined);
    }
  }, [activeThreadId, markThreadRead, messages.length, setThreadMessages]);

  useEffect(() => {
    stopTyping();
    return () => {
      stopTyping();
    };
  }, [activeThreadId, stopTyping]);

  const activeThread = useMemo(
    () => snapshot?.threads.find((thread) => thread.id === activeThreadId) || null,
    [activeThreadId, snapshot],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);

    if (!activeThreadId || !sendThreadTyping) {
      return;
    }

    if (!nextValue.trim()) {
      stopTyping();
      return;
    }

    sendThreadTyping(activeThreadId, true);
    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }
    typingStopTimeoutRef.current = setTimeout(() => {
      sendThreadTyping(activeThreadId, false);
      typingStopTimeoutRef.current = null;
    }, 1500);
  };

  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!activeThreadId || !inputValue.trim()) return;

    const body = inputValue.trim();
    stopTyping();
    setInputValue("");
    await sendThreadMessage(activeThreadId, body);
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  if (!snapshot || !currentUser || isLoading) {
    return (
      <WorkspaceStateCard
        title="Loading private inbox"
        description="Fetching your threads and secure connections."
      />
    );
  }

  return (
    <div className="grid h-full gap-3 p-3 xl:grid-cols-[320px_1fr]">
      <SurfaceCard
        eyebrow="Inbox"
        title="Private Threads"
        className={cn("min-h-0", activeThreadId ? "hidden xl:block" : "block")}
      >
        <div className="mt-3 flex h-full min-h-0 flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              Recent conversations
            </p>
            <span className={cn(glassPillButtonClass, "h-8 text-[10px] uppercase tracking-[0.2em]")}>
              {snapshot.threads.length} threads
            </span>
          </div>

          <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
            {snapshot.threads.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-[12px] text-white/36">
                No private threads yet.
              </div>
            ) : (
              snapshot.threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread.id)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-[22px] border px-3 py-3 text-left transition-all",
                    activeThreadId === thread.id
                      ? "border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.08)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                      : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]",
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                      {(thread.otherUser?.name || "T").charAt(0).toUpperCase()}
                    </div>
                    {thread.unread ? (
                      <span className="absolute -right-0.5 top-0 h-2.5 w-2.5 rounded-full bg-[var(--sq-brand-action)] shadow-[0_0_18px_rgba(205,255,4,0.72)]" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "truncate text-[13px]",
                          thread.unread ? "font-semibold text-white" : "font-medium text-white/84",
                        )}
                      >
                        {thread.otherUser?.name || "Unknown teammate"}
                      </p>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/28">
                        {formatThreadTimestamp(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-white/30">
                      {thread.otherUser?.role || "Team member"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/42">
                      {thread.lastMessage || "No messages yet. Start the conversation here."}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </SurfaceCard>

      {activeThreadId ? (
        <SurfaceCard
          title={(activeThread?.otherUser?.name as string) || "Private Thread"}
          eyebrow={(activeThread?.otherUser?.role as string) || "Individual Inbox"}
          className="flex min-h-0 flex-col overflow-hidden"
        >
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-dashed border-white/10 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={closeThread}
                className={cn(glassIconButtonClass, "xl:hidden")}
                aria-label="Back to inbox"
              >
                <ArrowLeft size={16} color="currentColor" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[12px] font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                {(activeThread?.otherUser?.name || "T").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-white">
                  {activeThread?.otherUser?.name || "Private Thread"}
                </p>
                <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-white/34">
                  {activeThread?.otherUser?.role || "Team member"}
                </p>
              </div>
            </div>

            <button type="button" className={glassIconButtonClass} aria-label="More conversation actions">
              <More size={18} color="currentColor" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-1 py-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-white/34">
                This is the beginning of your private thread with{" "}
                {activeThread?.otherUser?.name || "this teammate"}.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isMine = message.senderId === currentUser.id;
                  const nextMessage = messages[index + 1];
                  const showAvatar = !isMine && nextMessage?.senderId !== message.senderId;

                  return (
                    <ChatMessageBubble
                      key={message.id}
                      messageId={message.id}
                      body={message.body}
                      timestamp={message.createdAt}
                      senderName={message.sender.name}
                      senderInitial={message.sender.name}
                      isMine={isMine}
                      showAvatar={showAvatar}
                      reactions={message.reactions}
                      currentUserId={currentUser.id}
                      onToggleReaction={toggleThreadReaction}
                    />
                  );
                })}

                <AnimatePresence>
                  {typingParticipants.length ? (
                    <ChatTypingIndicator
                      participants={typingParticipants}
                      className="ml-12"
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-3 border-t border-dashed border-white/10 pt-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
              <div className="flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Write a message, paste code, or drop a terminal snippet..."
                  rows={1}
                  className={cn(
                    glassInputClass,
                    "min-h-[52px] flex-1 resize-none border-transparent bg-transparent px-3 py-3 leading-6 shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent",
                  )}
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={cn(glassPillAccentButtonClass, "h-11 shrink-0 px-4")}
                >
                  <Send2 variant="Bold" size={16} color="currentColor" />
                  <span className="text-[11px] uppercase tracking-[0.2em]">Send</span>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 px-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/26">
                  Enter to send, Shift+Enter for a new line
                </p>
                <div className={cn(glassPillButtonClass, "h-7 px-2.5 text-[10px] uppercase tracking-[0.18em]")}>
                  Code-aware composer
                </div>
              </div>
            </div>
          </form>
        </SurfaceCard>
      ) : (
        <SurfaceCard
          title="Your Private Inbox"
          eyebrow="Communications"
          className="hidden h-full flex-col items-center justify-center bg-black/40 p-8 text-center xl:flex"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--sq-brand-action)] shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <DirectInbox variant="Bulk" size={34} color="currentColor" />
          </div>
          <p className="mt-6 max-w-md text-[13px] leading-7 text-white/46">
            Select a thread from the left to open a private conversation with your team, share code
            snippets cleanly, and react in realtime without leaving the workspace.
          </p>
        </SurfaceCard>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { ChevronLeft, Mail, MoreVertical, Paperclip, Send, Smile } from "lucide-react";
import { Message } from "iconsax-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { AnimatePresence } from "framer-motion";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatTypingIndicator } from "@/components/chat/ChatTypingIndicator";
import {
  glassIconButtonClass,
  glassInputClass,
  glassPillAccentButtonClass,
  glassPillButtonClass,
} from "@/components/ui/glass";
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

interface SupportContentProps {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  activeSession: ChatSession | undefined;
  currentSupportMessages: ChatMessage[];
  isClientTyping: boolean;
  supportInputValue: string;
  setSupportInputValue: (val: string) => void;
  handleSupportInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  handleSendSupportMessage: (e: React.FormEvent) => void;
  handleRequestDetails: () => void;
  supportMessagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const SupportContent: React.FC<SupportContentProps> = ({
  activeSessionId,
  setActiveSessionId,
  activeSession,
  currentSupportMessages,
  isClientTyping,
  supportInputValue,
  setSupportInputValue,
  handleSupportInputChange,
  showEmojiPicker,
  setShowEmojiPicker,
  handleSendSupportMessage,
  handleRequestDetails,
  supportMessagesEndRef,
}) => {
  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  if (!activeSessionId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-white/30">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/10 bg-white/[0.03]">
          <Message size={32} className="text-white/20" variant="Bulk" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-white/60">Select Conversation</h3>
        <p className="max-w-[220px] text-center text-[11px] leading-6 text-white/34">
          Choose a visitor to open the thread and reply with the same polished composer.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-sq-brand-black">
      <div className="z-10 flex items-center justify-between gap-3 border-b border-dashed border-white/10 px-3 pb-3 pt-1">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setActiveSessionId(null)}
            className={cn(glassIconButtonClass, "md:hidden")}
            aria-label="Back to support sessions"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[12px] font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
            {activeSession?.name?.[0]?.toUpperCase() || "V"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-white">
              {activeSession?.name || "Visitor"}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/32">
              {activeSession?.connected ? (
                <span className="text-[var(--sq-brand-action)]">Online</span>
              ) : (
                <span>{new Date(activeSession?.lastSeenAt || "").toLocaleDateString()}</span>
              )}
              <span className="text-white/12">•</span>
              <span className="truncate">{activeSession?.email || "No email"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRequestDetails}
            title="Request contact details"
            className={glassIconButtonClass}
          >
            <Mail size={16} />
          </button>
          <button type="button" className={glassIconButtonClass} title="Conversation tools">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 no-scrollbar">
        <div className="space-y-4">
          {currentSupportMessages.map((message, index) => {
            const isMine = message.from === "admin";
            const nextMessage = currentSupportMessages[index + 1];
            const showAvatar = !isMine && nextMessage?.from !== message.from;

            return (
              <ChatMessageBubble
                key={message.id}
                messageId={message.id}
                body={message.text}
                timestamp={message.timestamp}
                senderName={isMine ? message.adminName || "Support" : activeSession?.name || "Visitor"}
                senderInitial={isMine ? "S" : activeSession?.name || "V"}
                isMine={isMine}
                showAvatar={showAvatar}
              />
            );
          })}

          <AnimatePresence>
            {isClientTyping ? (
              <ChatTypingIndicator
                participants={[
                  {
                    userId: activeSessionId,
                    userName: activeSession?.name || "Visitor",
                    at: new Date().toISOString(),
                  },
                ]}
                className="ml-12"
              />
            ) : null}
          </AnimatePresence>
        </div>
        <div ref={supportMessagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 border-t border-dashed border-white/10 bg-sq-brand-black/95 p-2 backdrop-blur">
        <form
          onSubmit={handleSendSupportMessage}
          className="rounded-[24px] border border-white/10 bg-white/[0.05] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl"
        >
          <div className="flex items-end gap-2">
            <button
              type="button"
              className={glassIconButtonClass}
              title="Attach"
            >
              <Paperclip size={16} />
            </button>

            <div className="relative flex-1">
              <textarea
                value={supportInputValue}
                onChange={handleSupportInputChange}
                onKeyDown={handleComposerKeyDown}
                placeholder="Reply with text, code, or a terminal snippet..."
                rows={1}
                className={cn(
                  glassInputClass,
                  "min-h-[52px] resize-none border-transparent bg-transparent px-3 py-3 leading-6 shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent",
                )}
              />

              {showEmojiPicker ? (
                <div className="absolute bottom-14 right-0 z-50 overflow-hidden rounded-[22px] border border-white/10 shadow-[0_28px_60px_rgba(0,0,0,0.35)]">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emojiData) => {
                      setSupportInputValue(`${supportInputValue}${emojiData.emoji}`);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(glassIconButtonClass, showEmojiPicker && "text-[var(--sq-brand-action)]")}
              title="Emoji"
            >
              <Smile size={16} />
            </button>

            <button
              type="submit"
              disabled={!supportInputValue.trim()}
              className={cn(glassPillAccentButtonClass, "h-11 px-4")}
            >
              <Send size={16} />
              <span className="text-[11px] uppercase tracking-[0.2em]">Send</span>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 px-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/26">
              Enter to send, Shift+Enter for a new line
            </p>
            <div className={cn(glassPillButtonClass, "h-7 px-2.5 text-[10px] uppercase tracking-[0.18em]")}>
              Live support
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

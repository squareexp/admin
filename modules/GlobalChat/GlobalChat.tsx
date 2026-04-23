"use client";
import React from "react";
import { Call, Video, SidebarRight } from "iconsax-react";
import { cn } from "@/lib/utils";
import { glassIconButtonClass } from "@/components/ui/glass";
import { GlobalSidebar } from "./GlobalSidebar";
import { GlobalMessages } from "./GlobalMessages";
import { GlobalInput } from "./GlobalInput";

interface GlobalMessage {
  id: string;
  sender: "me" | "server" | "other";
  text: string;
  timestamp: string;
  senderName?: string;
  userId?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

interface GlobalChatProps {
  isConnected: boolean;
  transport: string;
  messages: GlobalMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  isMembersPanelOpen: boolean;
  setIsMembersPanelOpen: (open: boolean) => void;
  isMobile: boolean;
  currentUser: UserProfile | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (e: React.FormEvent) => void;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({
  isConnected,
  transport,
  messages,
  inputValue,
  setInputValue,
  showEmojiPicker,
  setShowEmojiPicker,
  isMembersPanelOpen,
  setIsMembersPanelOpen,
  isMobile,
  currentUser,
  messagesEndRef,
  handleSendMessage,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-1">
      <GlobalSidebar isMembersPanelOpen={isMembersPanelOpen} isMobile={isMobile} />

      <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-white/10 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[var(--sq-brand-action)]/10 text-[12px] font-semibold text-[var(--sq-brand-action)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
              C
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                 <p className="truncate text-[15px] font-semibold text-white">Cosim</p>
                 {isConnected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]" />}
              </div>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-white/34">
                Public operations room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className={glassIconButtonClass}>
              <Call size={18} color="currentColor" />
            </button>
            <button type="button" className={glassIconButtonClass}>
              <Video size={18} color="currentColor" />
            </button>
            <div className="mx-1 h-5 w-px bg-white/10" />
            <button
              onClick={() => setIsMembersPanelOpen(!isMembersPanelOpen)}
              className={cn(
                glassIconButtonClass,
                isMembersPanelOpen ? "text-[var(--sq-brand-action)]" : ""
              )}
            >
              <SidebarRight size={18} color="currentColor" />
            </button>
          </div>
        </div>

        <GlobalMessages messages={messages} messagesEndRef={messagesEndRef} />

        <GlobalInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          isConnected={isConnected}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
        />
      </div>
    </div>
  );
};

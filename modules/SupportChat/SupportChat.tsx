"use client";
import React from "react";
import { SupportSidebar } from "./SupportSidebar";
import { SupportContent } from "./SupportContent";

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

interface SupportChatProps {
  isSupportConnected: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filteredSessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  supportMessages: Record<string, ChatMessage[]>;
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

export const SupportChat: React.FC<SupportChatProps> = ({
  isSupportConnected,
  searchQuery,
  setSearchQuery,
  filteredSessions,
  activeSessionId,
  setActiveSessionId,
  supportMessages,
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
  return (
    <div className="flex h-full min-h-0 flex-1">
      <SupportSidebar
        isSupportConnected={isSupportConnected}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredSessions={filteredSessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        supportMessages={supportMessages}
      />

      <SupportContent
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        activeSession={activeSession}
        currentSupportMessages={currentSupportMessages}
        isClientTyping={isClientTyping}
        supportInputValue={supportInputValue}
        setSupportInputValue={setSupportInputValue}
        handleSupportInputChange={handleSupportInputChange}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        handleSendSupportMessage={handleSendSupportMessage}
        handleRequestDetails={handleRequestDetails}
        supportMessagesEndRef={supportMessagesEndRef}
      />
    </div>
  );
};

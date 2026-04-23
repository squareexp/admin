"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send2, ArrowLeft, Profile2User } from "iconsax-react";
import { SurfaceCard, WorkspaceStateCard } from "@/components/dashboard";
import type { AdminMessage, UserProfile, AdminWorkspaceSnapshot } from "@/lib/admin-types";

interface DirectWorkspaceProps {
  snapshot: AdminWorkspaceSnapshot | null;
  isLoading: boolean;
  activeDirectId: string | null;
  setActiveDirectId: (id: string | null) => void;
  messages: AdminMessage[];
  sendMessage: (receiverId: string, body: string) => Promise<unknown>;
  markRead: (senderId: string) => Promise<unknown>;
  currentUser: UserProfile | null;
}

export function DirectWorkspace({
  snapshot,
  isLoading,
  activeDirectId,
  setActiveDirectId,
  messages,
  sendMessage,
  markRead,
  currentUser,
}: DirectWorkspaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeDirectId) return;
    void markRead(activeDirectId);
  }, [activeDirectId, markRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDirectId || !inputValue.trim()) return;
    
    await sendMessage(activeDirectId, inputValue);
    setInputValue("");
  };

  if (isLoading && !snapshot) {
    return (
      <WorkspaceStateCard
        title="Loading team messages"
        description="Connecting to secure communication channels..."
      />
    );
  }

  const teamMembers = snapshot?.team ?? [];
  const activeContact = teamMembers.find((member) => member.id === activeDirectId);

  return (
    <div className="grid h-full gap-3 p-3 lg:grid-cols-[280px_1fr]">
      {/* Contact List */}
      <SurfaceCard eyebrow="Team" title="Direct Contacts" className={`${activeDirectId ? "hidden lg:block" : "block"}`}>
        <div className="mt-2 space-y-1">
          {teamMembers.filter((member) => member.id !== currentUser?.id).map((member) => (
            <button
              key={member.id}
              onClick={() => setActiveDirectId(member.id)}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                activeDirectId === member.id
                  ? "bg-[rgba(205,255,4,0.06)] ring-1 ring-[rgba(205,255,4,0.22)]"
                  : "hover:bg-white/4"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/5 text-sq-brand-action">
                <Profile2User variant="Bulk" size={16} color="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white/90">{member.name}</p>
                <p className="truncate text-[11px] text-white/40">{member.role}</p>
              </div>
            </button>
          ))}
        </div>
      </SurfaceCard>

      {/* Chat Area */}
      {activeDirectId ? (
        <SurfaceCard
          title={activeContact?.name || "Direct Message"}
          eyebrow={activeContact?.role || "Team Member"}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <button
              onClick={() => setActiveDirectId(null)}
              className="lg:hidden flex items-center gap-2 text-[12px] text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} color="currentColor" />
              <span>Back to Directory</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sq-brand-action shadow-[0_0_8px_rgba(205,255,4,0.6)]" />
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[13px] text-white/30 italic">
                Start your conversation with {activeContact?.name || "this member"}.
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${
                      isMine
                        ? "bg-sq-brand-action text-black"
                        : "bg-white/6 text-white border border-white/5"
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="mt-auto flex items-center gap-2 border-t border-white/5 pt-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-[10px] bg-white/3 border border-white/5 px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[rgba(205,255,4,0.3)]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sq-brand-action text-black transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Send2 variant="Bold" size={18} color="currentColor" />
            </button>
          </form>
        </SurfaceCard>
      ) : (
        <SurfaceCard
          title="Direct Workspace"
          eyebrow="Messaging"
          className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 bg-black/40"
        >
          <div className="rounded-full bg-[rgba(205,255,4,0.05)] p-4 text-sq-brand-action ring-1 ring-[rgba(205,255,4,0.2)]">
            <Profile2User variant="Bulk" size={32} color="currentColor" />
          </div>
          <p className="mt-6 text-[13px] text-white/50 max-w-sm">
            Select a team member from the directory to start a secure direct conversation.
          </p>
        </SurfaceCard>
      )}
    </div>
  );
}

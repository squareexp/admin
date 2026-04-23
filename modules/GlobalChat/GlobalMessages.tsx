"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface GlobalMessage {
  id: string;
  sender: "me" | "server" | "other";
  text: string;
  timestamp: string;
  senderName?: string;
  userId?: string;
}

interface GlobalMessagesProps {
  messages: GlobalMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const GlobalMessages: React.FC<GlobalMessagesProps> = ({
  messages,
  messagesEndRef,
}) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3 no-scrollbar">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center px-4 text-center text-[13px] text-white/34">
          <p>This is the beginning of the global chat.</p>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg, index) => {
          const isMine = msg.sender === "me";
          const nextMsg = messages[index + 1];
          const showAvatar = !isMine && nextMsg?.sender !== msg.sender;

          return (
            <div
              key={msg.id}
              className={cn("group/message  flex w-full", isMine ? "justify-end" : "justify-start")}
            >
              <div className={cn("flex w-full max-w-[min(100%,46rem)] items-end gap-3", isMine ? "flex-row-reverse" : "flex-row")}>
                {!isMine ? (
                  <div className="w-9 shrink-0">
                    {showAvatar || index === messages.length - 1 ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/76 shadow-[0_18px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                        {msg.senderName?.[0]?.toUpperCase() || "U"}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={cn("flex min-w-0 flex-1 flex-col gap-2", isMine ? "items-end" : "items-start")}>
                  {msg.sender !== "me" && (
                    <div className="px-1 text-[11px] font-bold text-white">
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    className={cn(
                      "w-full rounded-[22px] border px-4 py-3 shadow-[0_18px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl",
                      isMine
                        ? "border-[rgba(205,255,4,0.18)] bg-[linear-gradient(180deg,rgba(205,255,4,0.16),rgba(205,255,4,0.08))] text-white"
                        : "border-white/10 bg-white/5 text-white/82"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-[13px] leading-7">{msg.text}</p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-1 text-[10px] uppercase tracking-[0.18em] text-white/28",
                      isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

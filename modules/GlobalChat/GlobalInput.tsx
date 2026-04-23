"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Smile, Send } from "lucide-react";
import { Send2 } from "iconsax-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { glassInputClass, glassPillAccentButtonClass } from "@/components/ui/glass";

interface GlobalInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isConnected: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

export const GlobalInput: React.FC<GlobalInputProps> = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  isConnected,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {
  return (
    <div className="sticky bottom-0 z-10 border-t border-dashed border-white/10 bg-black/40 p-3 backdrop-blur-xl">
      <form onSubmit={handleSendMessage}>
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Paperclip size={18} />
            </button>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Write a message in global chat..."
              className={cn(
                glassInputClass,
                "flex-1 border-transparent bg-transparent px-2 py-3 text-[13px] leading-6 shadow-none placeholder:text-white/25 hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent"
              )}
            />

            <div className="flex shrink-0 items-center gap-1.5 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-[20px] overflow-hidden border border-white/10">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emojiData) => {
                      setInputValue(inputValue + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  showEmojiPicker ? "text-[var(--sq-brand-action)] bg-white/5" : "text-white/40 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <Smile size={18} />
              </button>
              
              <button
                type="submit"
                disabled={!isConnected || !inputValue.trim()}
                className={cn(glassPillAccentButtonClass, "h-11 px-4 ml-1")}
              >
                <Send2 variant="Bold" size={16} color="currentColor" />
                <span className="text-[11px] uppercase tracking-[0.2em] hidden sm:inline-block">Send</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ThreadTypingParticipant } from "@/lib/admin-types";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function describeParticipants(participants: ThreadTypingParticipant[]) {
  if (participants.length === 0) {
    return "";
  }

  if (participants.length === 1) {
    return `${participants[0]?.userName || "Someone"} is typing`;
  }

  if (participants.length === 2) {
    return `${participants[0]?.userName || "Someone"} and ${participants[1]?.userName || "someone"} are typing`;
  }

  return `${participants[0]?.userName || "Someone"} and ${participants.length - 1} others are typing`;
}

export function ChatTypingIndicator({
  participants,
  className,
}: {
  participants: ThreadTypingParticipant[];
  className?: string;
}) {
  if (!participants.length) {
    return null;
  }

  const visibleParticipants = participants.slice(0, 2);
  const overflowCount = participants.length - visibleParticipants.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center -space-x-1.5">
        {visibleParticipants.map((participant) => (
          <div
            key={participant.userId}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[10px] font-semibold text-white/78 shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
            )}
          >
            {getInitials(participant.userName || "T")}
          </div>
        ))}
        {overflowCount > 0 ? (
          <div className="flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-black/30 px-2 text-[10px] font-semibold text-white/70">
            +{overflowCount}
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-[var(--sq-brand-action)]"
            animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 0.9,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <span className="truncate">{describeParticipants(participants)}</span>
    </motion.div>
  );
}

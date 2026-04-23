"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

interface GlobalInfoPanelProps {
  isMembersPanelOpen: boolean;
  currentUser: UserProfile | null;
  isConnected: boolean;
  transport: string;
  logs: LogEntry[];
  logsEndRef: React.RefObject<HTMLDivElement | null>;
}

export const GlobalInfoPanel: React.FC<GlobalInfoPanelProps> = ({
  isMembersPanelOpen,
  currentUser,
  isConnected,
  transport,
  logs,
  logsEndRef,
}) => {
  if (!isMembersPanelOpen) return null;

  return (
    <div className="w-[280px] min-h-0 border-l border-white/10 bg-black/25 flex flex-col overflow-hidden shrink-0">
      <div className="p-4 border-b border-dashed border-white/10">
        <h3 className="text-sm font-bold text-white mb-3">Members</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.08)] text-[12px] font-semibold text-[var(--sq-brand-action)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
              {currentUser?.username?.[0]?.toUpperCase() || "Y"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-medium text-white max-w-[140px]">
                {currentUser ? `${currentUser.username} (You)` : "Loading..."}
              </span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-400">Online</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-dashed border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/40">Status</span>
                <span className={cn("text-[9px] uppercase tracking-[0.18em] px-2 py-1 rounded-full", isConnected ? "bg-[rgba(52,211,153,0.12)] text-emerald-400" : "bg-red-500/10 text-red-400")}>
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/40">Transport</span>
                <span className="text-[10px] font-mono text-white/80 bg-white/5 px-2 py-1 rounded">{transport}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <h3 className="text-xs uppercase tracking-[0.16em] font-semibold text-white/60 flex items-center gap-1.5 mb-3">
          <FileText size={14} /> Socket Logs
        </h3>
        <div className="space-y-2 font-mono text-[10px]">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/5 p-2.5 rounded-lg border border-white/10">
              <div className="flex justify-between text-white/40 mb-1">
                <span className={cn(
                  "uppercase tracking-[0.16em]",
                  log.type === "success" ? "text-emerald-400" : 
                  log.type === "error" ? "text-rose-400" : "text-sky-400"
                )}>{log.type}</span>
                <span>{log.timestamp}</span>
              </div>
              <p className="text-white/70 break-all leading-relaxed whitespace-pre-wrap">{log.message}</p>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

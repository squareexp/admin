"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Global } from "iconsax-react";
import { glassInputClass } from "@/components/ui/glass";

interface GlobalSidebarProps {
  isMembersPanelOpen: boolean;
  isMobile: boolean;
}

export const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
  isMembersPanelOpen,
  isMobile,
}) => {
  if (isMembersPanelOpen && isMobile) return null;

  return (
    <div className="flex w-[280px] min-h-0 shrink-0 flex-col border-r border-white/10 bg-black/25">
      <div className="border-b border-dashed border-white/10 p-3">
        <h1 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Global variant="Bulk" className="text-[var(--sq-brand-action)]" size={18} />
          Global Chat
        </h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
          <input
            type="text"
            placeholder="Search channels..."
            className={cn(glassInputClass, "h-11 pl-9 pr-3 text-[12px]")}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
        <div className="space-y-2">
          <button className="group relative flex w-full items-start gap-3 rounded-[22px] border border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.08)] px-3 py-3 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all">
            <div className="relative mt-0.5 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
                <Global variant="Bulk" size={20} className="text-[var(--sq-brand-action)]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[13px] font-semibold text-white">
                  Cosim
                </p>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/28">
                  Active
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-white/30">
                Public operations room
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

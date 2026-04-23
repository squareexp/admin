"use client";

import React from "react";
import { Airdrop, CloudChange, CloudSnow, CloudSunny } from "iconsax-react";
import { cn } from "@/lib/utils";
import { compactPillButtonClassName } from "../ui/global.css";

interface GlobalSnapshotLoaderProps {
  isLoading: boolean;
}

export function GlobalSnapshotLoader({ isLoading }: GlobalSnapshotLoaderProps) {
  return (
    <div className={cn(compactPillButtonClassName, "flex select-none items-center gap-3 h-12")}>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
     
       {isLoading ?<Airdrop className="animate-pulse duration-1000" variant="Bulk" color="currentColor" size={16} />:<CloudChange variant="Bulk" color="currentColor" size={16} />}
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            !isLoading ? "bg-sq-brand-action shadow-[0_0_8px_rgba(205,255,4,0.4)]" : "bg-white/20"
          }`}
        />
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40")}>
          {isLoading ? <CloudSnow variant="Broken" color="currentColor" className="animate-pulse duration-1000 " size={16} /> : <CloudSunny variant="Bulk" color="currentColor" size={16} />}
        </span>
      </div>
    </div>
  );
}

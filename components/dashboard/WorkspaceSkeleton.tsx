"use client";

import React from "react";
import { cn } from "@/lib/utils";

type WorkspaceSkeletonVariant =
  | "dashboard"
  | "analytics"
  | "report"
  | "invoice"
  | "tasks"
  | "billings"
  | "settings";

export function WorkspaceSkeleton({
  variant = "dashboard",
}: {
  variant?: WorkspaceSkeletonVariant;
}) {
  const mainColumns =
    variant === "settings"
      ? "xl:grid-cols-[1.15fr_0.85fr]"
      : variant === "dashboard"
        ? "xl:grid-cols-[1.5fr_0.9fr]"
        : "xl:grid-cols-[1.15fr_0.85fr]";

  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="h-9 w-72 rounded-2xl bg-white/10" />
          <div className="h-3 w-[78%] rounded-full bg-white/10" />
        </div>
      </div>

      <div className={cn("grid gap-3", mainColumns)}>
        <div className="space-y-3">
          <SkeletonPanel />
          <SkeletonPanel />
          {variant !== "report" ? <SkeletonPanel /> : null}
        </div>
        <div className="space-y-3">
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      </div>
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-2.5 w-24 rounded-full bg-white/10" />
        <div className="h-6 w-2/3 rounded-xl bg-white/10" />
        <div className="h-3 w-full rounded-full bg-white/10" />
        <div className="h-3 w-[86%] rounded-full bg-white/10" />
        <div className="h-3 w-[74%] rounded-full bg-white/10" />
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface DashboardSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function DashboardSectionHeader({
  eyebrow,
  title,
  description,
  children,
}: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--sq-brand-action)]/72">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 text-[1.55rem] font-semibold tracking-[-0.04em] text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] text-white/55">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  );
}

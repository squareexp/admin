"use client";

import React from "react";

type IconsaxIcon = React.ComponentType<{
  color?: string;
  size?: number | string;
  variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
}>;

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: IconsaxIcon;
}) {
  return (
    <div className="rounded-[16px] border border-dashed border-white/10 bg-black/20 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(205,255,4,0.16)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]">
          <Icon variant="Bulk" size={18} color="currentColor" />
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-white/50">{note}</p>
    </div>
  );
}

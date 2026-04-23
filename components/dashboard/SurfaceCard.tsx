"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function SurfaceCard({
  title,
  eyebrow,
  children,
  className,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4",
        className,
      )}
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="mb-4">
        <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--sq-brand-action)]/70">
          {eyebrow}
        </p>
        <h3 className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

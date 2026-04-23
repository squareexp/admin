"use client";

import React from "react";

export function WorkspaceStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-xl rounded-[32px] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--sq-brand-action)]/75">
          Workspace state
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{description}</p>
      </div>
    </div>
  );
}

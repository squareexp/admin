"use client";

import React from "react";
import { Activity, ClipboardTick, Danger, Profile2User } from "iconsax-react";
import type { AdminTaskPriority, AdminWorkspaceSnapshot } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

type ReportItem = AdminWorkspaceSnapshot["reports"][number];

function mapReportPriorityToTask(priority: ReportItem["priority"]): AdminTaskPriority {
  if (priority === "CRITICAL") {
    return "urgent";
  }

  if (priority === "HIGH") {
    return "high";
  }

  if (priority === "LOW") {
    return "low";
  }

  return "medium";
}

function getPriorityTone(priority: ReportItem["priority"]) {
  if (priority === "CRITICAL") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }

  if (priority === "HIGH") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }

  if (priority === "LOW") {
    return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  }

  return "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]";
}

function getStatusTone(status: ReportItem["status"]) {
  if (status === "RESOLVED") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "IN_PROGRESS") {
    return "border-sky-400/25 bg-sky-400/10 text-sky-200";
  }

  if (status === "ACKNOWLEDGED") {
    return "border-white/12 bg-white/5 text-white/70";
  }

  return "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]";
}

export function ReportListTile({
  report,
  onPushToTasks,
}: {
  report: ReportItem;
  onPushToTasks: (input: {
    title: string;
    description: string;
    priority: AdminTaskPriority;
    source: "report";
    tags: string[];
  }) => void;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{report.subject || "Untitled report"}</p>
          <p className="mt-1 text-sm text-white/55">
            {report.firstName} {report.lastName} · {report.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]",
              getPriorityTone(report.priority),
            )}
          >
            {report.priority}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]",
              getStatusTone(report.status),
            )}
          >
            {report.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-dashed border-white/15 pt-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Type and source</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <Activity variant="Bulk" size={16} color="currentColor" />
            {report.type} · {report.source}
          </p>
        </div>
        <div className="rounded-[18px] border border-white/8 bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Client context</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <Profile2User variant="Bulk" size={16} color="currentColor" />
            {report.clientCompany || "Independent account"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/65">{report.message}</p>

      {report.techIssue ? (
        <div className="mt-3 rounded-[18px] border border-dashed border-white/15 bg-black/20 px-3 py-2 text-sm text-white/60">
          <span className="mr-2 inline-flex items-center align-middle">
            <Danger variant="Bulk" size={16} color="currentColor" />
          </span>
          {report.techIssue}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-white/15 pt-4">
        <p className="text-xs text-white/35">
          Created {new Date(report.createdAt).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <button
          onClick={() =>
            onPushToTasks({
              title: report.subject || `Follow up ${report.type.toLowerCase()} report`,
              description: `${report.message}\n\nReporter: ${report.firstName} ${report.lastName} (${report.email})`,
              priority: mapReportPriorityToTask(report.priority),
              source: "report",
              tags: [report.type.toLowerCase(), "reports"],
            })
          }
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(205,255,4,0.22)] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[var(--sq-brand-action)]"
        >
          <ClipboardTick variant="Bulk" size={16} color="currentColor" />
          Push to tasks
        </button>
      </div>
    </article>
  );
}

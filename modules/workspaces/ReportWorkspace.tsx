"use client";

import {
  DocumentText1,
  MessageQuestion,
  StatusUp,
} from "iconsax-react";
import {
  MetricCard,
  ReportListTile,
  SurfaceCard,
  WorkspaceStateCard,
} from "@/components/dashboard";
import type {
  AdminWorkspaceSnapshot,
  CreateAdminTaskInput,
} from "@/lib/admin-types";
import { formatCompactNumber } from "./workspace-utils";

export function ReportWorkspace({
  data,
  onCreateTaskFromReport,
}: {
  data: AdminWorkspaceSnapshot | null;
  onCreateTaskFromReport: (payload: CreateAdminTaskInput) => Promise<unknown>;
}) {
  if (!data) {
    return (
      <WorkspaceStateCard
        title="Loading reports"
        description="Issue reports and client product cases render here from the workspace feed."
      />
    );
  }

  return (
    <div className="grid gap-3 overflow-y-auto p-3 xl:grid-cols-[1.15fr_0.85fr]">
      <SurfaceCard eyebrow="Reports" title="Issue and client product reports">
        <div className="space-y-2.5">
          {data.reports.length ? (
            data.reports.map((report) => (
              <ReportListTile
                key={report.id}
                report={report}
                onPushToTasks={(payload) => {
                  void onCreateTaskFromReport(payload);
                }}
              />
            ))
          ) : (
            <div className="rounded-[12px] border border-dashed border-white/12 bg-black/20 p-4 text-[12px] text-white/55">
              No reports yet. New case, contact, and product reports will appear here automatically.
            </div>
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Summary" title="Report posture">
        <div className="grid gap-2.5">
          <MetricCard
            label="Issue reports"
            value={formatCompactNumber(data.metrics.reports.total)}
            note="All issue, product, and contact reports routed from backend."
            icon={MessageQuestion}
          />
          <MetricCard
            label="Contact requests"
            value={formatCompactNumber(data.metrics.reports.contacts)}
            note="Commercial and support intake remains visible for triage."
            icon={DocumentText1}
          />
          <MetricCard
            label="Product issues"
            value={formatCompactNumber(data.metrics.reports.products)}
            note={`${data.metrics.reports.open} reports currently active in triage.`}
            icon={StatusUp}
          />
        </div>
      </SurfaceCard>
    </div>
  );
}

"use client";

import {
  DirectInbox,
  Profile2User,
  ShieldTick,
  StatusUp,
} from "iconsax-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  MetricCard,
  SurfaceCard,
  WorkspaceStateCard,
} from "@/components/dashboard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type {
  AdminSystemSnapshot,
  AdminTaskSnapshot,
  AdminTaskStatus,
  AdminWorkspaceSnapshot,
} from "@/lib/admin-types";
import {
  formatCompactNumber,
  formatDateLabel,
  taskStatusChartConfig,
  taskStatusLabels,
  taskThroughputChartConfig,
  trendChartConfig,
} from "./workspace-utils";

export function AnalyticsWorkspace({
  data,
  system,
  tasks,
}: {
  data: AdminWorkspaceSnapshot | null;
  system: AdminSystemSnapshot | null;
  tasks: AdminTaskSnapshot | null;
}) {
  if (!data) {
    return (
      <WorkspaceStateCard
        title="Loading analytics"
        description="Visitor, report, and booking analytics are syncing from the backend snapshot."
      />
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <div className="grid gap-3 xl:grid-cols-[1.3fr_0.7fr]">
        <SurfaceCard eyebrow="Performance" title="Deep analytical signals">
          <ChartContainer config={trendChartConfig} className="h-[260px] w-full">
            <BarChart data={data.charts.activity}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDateLabel} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="visitors" fill="var(--color-visitors)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="reports" fill="var(--color-reports)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SurfaceCard>

        <SurfaceCard eyebrow="Backends" title="Connected systems">
          <div className="space-y-2.5">
            <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Nest API</p>
              <p className="mt-1.5 text-lg font-semibold text-white">{system?.nest.ok ? "Connected" : "Offline"}</p>
              <p className="mt-1 text-[12px] text-white/50">{system?.nest.url}</p>
            </div>
            <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Go core</p>
              <p className="mt-1.5 text-lg font-semibold text-white">{system?.core.ok ? system?.core.service || "Healthy" : "Unavailable"}</p>
              <p className="mt-1 text-[12px] text-white/50">{system?.core.url || system?.core.error || "No response"}</p>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-4">
        <MetricCard
          label="Customers"
          value={formatCompactNumber(data.metrics.customers.total)}
          note="Active customer account base from the current backend."
          icon={Profile2User}
        />
        <MetricCard
          label="Reviews"
          value={formatCompactNumber(data.metrics.customers.reviews)}
          note="Customer feedback count connected to the contact stack."
          icon={ShieldTick}
        />
        <MetricCard
          label="Support"
          value={formatCompactNumber(data.metrics.support.totalSessions)}
          note="Tracked support sessions flowing through the live chat backend."
          icon={DirectInbox}
        />
        <MetricCard
          label="Reports"
          value={formatCompactNumber(data.metrics.reports.total)}
          note="Issue-specific intake tracked for deeper quality reporting."
          icon={StatusUp}
        />
      </div>

      {tasks ? (
        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard eyebrow="Execution" title="Task throughput">
            <ChartContainer config={taskThroughputChartConfig} className="h-[220px] w-full">
              <LineChart data={tasks.charts.throughput}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDateLabel} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="var(--color-created)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-completed)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="touched"
                  stroke="var(--color-touched)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </SurfaceCard>

          <SurfaceCard eyebrow="Execution" title="Status balance">
            <ChartContainer config={taskStatusChartConfig} className="h-[220px] w-full">
              <BarChart data={tasks.charts.status} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  width={84}
                  tickFormatter={(value: AdminTaskStatus) => taskStatusLabels[value]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [value, "Tasks"]}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ChartContainer>
          </SurfaceCard>
        </div>
      ) : null}
    </div>
  );
}

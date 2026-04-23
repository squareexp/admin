"use client";

import {
  Activity,
  ReceiptSquare,
  StatusUp,
} from "iconsax-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  AdminWorkspaceSnapshot,
  UserProfile,
} from "@/lib/admin-types";
import {
  formatCompactNumber,
  formatDateLabel,
  formatDateTime,
  geoChartConfig,
  intakeChartConfig,
  pieColors,
  trendChartConfig,
} from "./workspace-utils";

export function DashboardWorkspace({
  data,
  system,
  currentUser,
  tasks,
  isTasksConnected,
}: {
  data: AdminWorkspaceSnapshot | null;
  system: AdminSystemSnapshot | null;
  currentUser: UserProfile | null;
  tasks: AdminTaskSnapshot | null;
  isTasksConnected: boolean;
}) {
  if (!data) {
    return (
      <WorkspaceStateCard
        title="Loading dashboard workspace"
        description="We are syncing the latest admin overview from the backend so the control center opens with real operating context."
      />
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <SurfaceCard
        eyebrow="Overview"
        title={`Welcome back, ${currentUser?.username || "team"}`}
        className="overflow-hidden"
      >
        <div className="grid gap-3 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(135deg,rgba(205,255,4,0.12),rgba(255,255,255,0.03)_45%,rgba(255,255,255,0.02))] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.28em] text-white/50">
                  Daily command deck
                </p>
                <h2 className="mt-1.5 max-w-xl text-xl font-semibold leading-tight tracking-[-0.04em] text-white">
                  Clean operational visibility across support, reports, visitors, bookings, and team load.
                </h2>
              </div>
              <div className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/55">
                Updated {formatDateTime(data.generatedAt)}
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 md:grid-cols-3">
              <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">Mailbox</p>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {data.metrics.support.unresolved} unresolved threads
                </p>
                <p className="mt-1 text-[12px] text-white/50">
                  Support, team chat, and report intake stay visible from one dashboard.
                </p>
              </div>
              <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">Billing desk</p>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  Invoice engine staged
                </p>
                <p className="mt-1 text-[12px] text-white/50">
                  Core backend health is {system?.core.ok ? "live" : "syncing"} for future pricing and invoice hooks.
                </p>
              </div>
              <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/45">Team desk</p>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {data.metrics.team.activeAdmins} active operators
                </p>
                <p className="mt-1 text-[12px] text-white/50">
                  Role management, assignment prompts, and escalation controls are ready for expansion.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
            <MetricCard
              label="Visitors"
              value={formatCompactNumber(data.metrics.visitors.total)}
              note={`${data.metrics.visitors.last14Days} visitor records in the last 14 days.`}
              icon={Activity}
            />
            <MetricCard
              label="Bookings"
              value={formatCompactNumber(data.metrics.bookings.total)}
              note={`${data.metrics.bookings.last30Days} booking records tracked this month.`}
              icon={ReceiptSquare}
            />
            <MetricCard
              label="Tasks"
              value={formatCompactNumber(tasks?.metrics.total || 0)}
              note={
                tasks
                  ? `${tasks.metrics.inProgress + tasks.metrics.review} active tasks with ${tasks.metrics.completionRate}% completion rate.`
                  : "Realtime execution board is syncing."
              }
              icon={StatusUp}
            />
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_0.9fr]">
        <SurfaceCard eyebrow="Traffic" title="Operational movement">
          <ChartContainer config={trendChartConfig} className="h-[260px] w-full">
            <AreaChart data={data.charts.activity}>
              <defs>
                <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CDFF04" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#CDFF04" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#57C7FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#57C7FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDateLabel}
              />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                fill="url(#visitorsFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="var(--color-bookings)"
                fill="url(#bookingsFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reports"
                stroke="var(--color-reports)"
                fillOpacity={0}
                strokeWidth={2}
                strokeDasharray="6 6"
              />
            </AreaChart>
          </ChartContainer>
        </SurfaceCard>

        <SurfaceCard eyebrow="Activity" title="Live signals">
          <div className="space-y-2.5">
            {data.activity.map((item) => (
              <div key={item.id} className="rounded-[12px] border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-white">{item.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-white/50">{item.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-white/50">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-white/30">{formatDateTime(item.timestamp)}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_1fr_0.95fr]">
        <SurfaceCard eyebrow="Analytics" title="Intake mix">
          <ChartContainer config={intakeChartConfig} className="h-[220px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" hideIndicator />} />
              <Pie data={data.charts.intakeMix} dataKey="value" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={4}>
                {data.charts.intakeMix.map((entry, index) => (
                  <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </SurfaceCard>

        <SurfaceCard eyebrow="Geo" title="Top visitor countries">
          <ChartContainer config={geoChartConfig} className="h-[220px] w-full">
            <BarChart data={data.charts.countries} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="country"
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ChartContainer>
        </SurfaceCard>

        <SurfaceCard eyebrow="Support" title="Mailbox and shortcuts">
          <div className="space-y-2.5">
            <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Live mailbox</p>
              <p className="mt-1.5 text-xl font-semibold text-white">
                {data.metrics.support.activeSessions} live sessions
              </p>
              <p className="mt-1 text-[12px] text-white/50">
                {data.metrics.support.unresolved} need a reply right now.
              </p>
            </div>
            <div className="rounded-[12px] border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Execution board</p>
              <p className="mt-1.5 text-xl font-semibold text-white">
                {tasks ? `${tasks.metrics.todo + tasks.metrics.inProgress + tasks.metrics.review + tasks.metrics.blocked} open tasks` : "Syncing"}
              </p>
              <p className="mt-1 text-[12px] text-white/50">
                {isTasksConnected ? "Realtime task sync is active across admin sessions." : "Task socket is reconnecting."}
              </p>
            </div>
            <div className="rounded-[12px] border border-dashed border-white/12 px-3 py-3">
              <p className="text-[13px] font-medium text-white">Shortcuts in this dashboard</p>
              <div className="mt-2 space-y-1.5 text-[12px] text-white/50">
                <p>Billings updates and renewals</p>
                <p>Daily report signals</p>
                <p>Quick path into support inbox and team view</p>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

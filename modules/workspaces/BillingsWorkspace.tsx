"use client";

import { useMemo, useState } from "react";
import {
  Calendar1,
  DocumentText1,
  NotificationBing,
  ReceiptSquare,
  WalletMoney,
} from "iconsax-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  MetricCard,
  SurfaceCard,
  WorkspaceStateCard,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  glassInputClass,
  glassPillAccentButtonClass,
  glassPillButtonClass,
} from "@/components/ui/glass";
import type {
  AdminBillingKind,
  AdminBillingSnapshot,
  AdminBillingStatus,
  AdminBillingWorkflow,
  CreateAdminBillingInput,
  UpdateAdminBillingInput,
} from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import {
  billingKindLabels,
  billingRevenueChartConfig,
  billingRenewalChartConfig,
  billingStatusLabels,
  billingWorkflowLabels,
  formatCompactNumber,
  formatCurrency,
  formatDateLabel,
  formatDateTime,
  getBillingKindTone,
  getBillingStatusTone,
} from "./workspace-utils";

const defaultBillingForm = () => {
  const renewal = new Date();
  renewal.setDate(renewal.getDate() + 10);

  return {
    clientName: "",
    clientCompany: "",
    email: "",
    internalOwnerEmail: "info@squareexp.com",
    kind: "recurring" as AdminBillingKind,
    workflow: "post_confirmation" as AdminBillingWorkflow,
    serviceCategory: "Managed hosting",
    planName: "Managed hosting",
    amount: "120",
    currency: "USD",
    interval: "monthly",
    renewalDate: renewal.toISOString().slice(0, 10),
    reminderLeadDays: "10",
    notes: "",
  };
};

export function BillingsWorkspace({
  canView,
  data,
  billingError,
  activeBillingId,
  onSendReminder,
  onUpdateSubscription,
  onCreateSubscription,
  onIssueInvoice,
  onRunAutomationSweep,
}: {
  canView: boolean;
  data: AdminBillingSnapshot | null;
  billingError: string | null;
  activeBillingId: string | null;
  onSendReminder: (subscriptionId: string) => Promise<unknown>;
  onUpdateSubscription: (
    subscriptionId: string,
    payload: UpdateAdminBillingInput,
  ) => Promise<unknown>;
  onCreateSubscription: (payload: CreateAdminBillingInput) => Promise<unknown>;
  onIssueInvoice: (subscriptionId: string) => Promise<unknown>;
  onRunAutomationSweep: () => Promise<unknown>;
}) {
  const [activeFilter, setActiveFilter] = useState<"all" | AdminBillingStatus>("all");
  const [activeKind, setActiveKind] = useState<"all" | AdminBillingKind>("all");
  const [form, setForm] = useState(defaultBillingForm);

  const visibleSubscriptions = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.subscriptions.filter((subscription) => {
      const matchesStatus = activeFilter === "all" || subscription.status === activeFilter;
      const matchesKind = activeKind === "all" || subscription.kind === activeKind;
      return matchesStatus && matchesKind;
    });
  }, [activeFilter, activeKind, data]);

  if (!canView) {
    return (
      <WorkspaceStateCard
        title="Billings is role gated"
        description="This workspace is reserved for super admin and accountant roles."
      />
    );
  }

  if (!data) {
    return (
      <WorkspaceStateCard
        title={billingError ? "Billing desk unavailable" : "Loading billing desk"}
        description={
          billingError ||
          "Client renewals, one-time requests, invoice handoff, and finance signals are syncing from the backend."
        }
      />
    );
  }

  const isCreating = activeBillingId === "new";
  const isAutomationRunning = activeBillingId === "automation";

  const handleCreate = async () => {
    const renewalDate = new Date(`${form.renewalDate}T09:00:00`).toISOString();
    await onCreateSubscription({
      clientName: form.clientName,
      clientCompany: form.clientCompany || undefined,
      email: form.email,
      internalOwnerEmail: form.internalOwnerEmail || undefined,
      kind: form.kind,
      workflow: form.workflow,
      serviceCategory: form.serviceCategory || undefined,
      planName: form.planName,
      amount: Number(form.amount || 0),
      currency: form.currency || undefined,
      interval: form.kind === "recurring" ? (form.interval as CreateAdminBillingInput["interval"]) : "one_time",
      renewalDate,
      reminderLeadDays: Number(form.reminderLeadDays || 10),
      notes: form.notes || undefined,
    });
    setForm(defaultBillingForm());
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          label="Tracked accounts"
          value={formatCompactNumber(data.metrics.total)}
          note="Recurring retainers, milestones, and one-time service requests."
          icon={WalletMoney}
        />
        <MetricCard
          label="Projected monthly"
          value={formatCurrency(data.metrics.projectedMonthlyRevenue)}
          note={`${formatCurrency(data.metrics.recurringValue)} recurring + ${formatCurrency(data.metrics.oneTimeValue)} one-time pipeline.`}
          icon={ReceiptSquare}
        />
        <MetricCard
          label="Collected this month"
          value={formatCurrency(data.metrics.collectedThisMonth)}
          note={`${data.metrics.paidRecently} records marked paid in the last 30 days.`}
          icon={Calendar1}
        />
        <MetricCard
          label="Due soon"
          value={formatCompactNumber(data.metrics.dueSoon)}
          note={`${data.automation.dueSoonQueue} records are inside the active reminder window.`}
          icon={NotificationBing}
        />
        <MetricCard
          label="Overdue exposure"
          value={formatCurrency(data.metrics.overdueValue)}
          note={`${formatCompactNumber(data.metrics.overdue)} records already past billing date.`}
          icon={DocumentText1}
        />
        <MetricCard
          label="Risk at stake"
          value={formatCurrency(data.metrics.lossRiskValue)}
          note="Due + overdue value that needs finance follow-up now."
          icon={WalletMoney}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <SurfaceCard eyebrow="Desk" title="Billing operations board">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "due", "overdue", "paid", "snoozed"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "h-9 text-xs",
                    activeFilter === filter ? glassPillAccentButtonClass : glassPillButtonClass,
                  )}
                >
                  {filter === "all" ? "All statuses" : billingStatusLabels[filter]}
                </button>
              ))}
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
              {visibleSubscriptions.length} visible
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "recurring", "one_time", "milestone"] as const).map((kind) => (
              <button
                key={kind}
                onClick={() => setActiveKind(kind)}
                className={cn(
                  "h-9 text-xs",
                  activeKind === kind ? glassPillAccentButtonClass : glassPillButtonClass,
                )}
              >
                {kind === "all" ? "All billing types" : billingKindLabels[kind]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleSubscriptions.map((subscription) => {
              const isPending = activeBillingId === subscription.id;

              return (
                <div key={subscription.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-white">{subscription.clientName}</p>
                        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]", getBillingStatusTone(subscription.status))}>
                          {billingStatusLabels[subscription.status]}
                        </span>
                        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]", getBillingKindTone(subscription.kind))}>
                          {billingKindLabels[subscription.kind]}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
                          {billingWorkflowLabels[subscription.workflow]}
                        </span>
                      </div>
                      <p className="text-sm text-white/65">
                        {subscription.planName} · {subscription.serviceCategory}
                      </p>
                      <p className="text-sm text-white/45">
                        {subscription.email}
                        {subscription.clientCompany ? ` · ${subscription.clientCompany}` : ""}
                        {subscription.internalOwnerEmail ? ` · owner ${subscription.internalOwnerEmail}` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
                        {subscription.interval.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Billing date</p>
                      <p className="mt-2 text-sm font-medium text-white">{formatDateTime(subscription.renewalDate)}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Reminder rule</p>
                      <p className="mt-2 text-sm font-medium text-white">{subscription.reminderLeadDays} days before due</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Last reminder</p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {subscription.lastReminderSentAt ? formatDateTime(subscription.lastReminderSentAt) : "Not sent yet"}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Invoice link</p>
                      <p className="mt-2 text-sm font-medium text-white">
                        {subscription.invoiceNumber ? `${subscription.invoiceNumber} · ${subscription.invoiceStatus || "linked"}` : "Not issued yet"}
                      </p>
                    </div>
                  </div>

                  {subscription.notes ? (
                    <p className="mt-4 text-sm leading-relaxed text-white/55">{subscription.notes}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isPending}
                      onClick={() => void onSendReminder(subscription.id)}
                    >
                      {isPending ? "Working..." : "Send reminder"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => void onIssueInvoice(subscription.id)}
                    >
                      Issue invoice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => void onUpdateSubscription(subscription.id, { status: "paid" })}
                    >
                      Mark paid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => void onUpdateSubscription(subscription.id, { snoozeDays: 3 })}
                    >
                      Snooze 3d
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard eyebrow="Autonomous" title="Reminder automation">
            {billingError ? (
              <div className="rounded-[18px] border border-rose-400/18 bg-rose-400/10 px-3.5 py-3 text-sm text-rose-100">
                {billingError}
              </div>
            ) : null}

            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Current automation state</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Last run</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {data.automation.lastRunAt ? formatDateTime(data.automation.lastRunAt) : "Not run yet"}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Queues</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {data.automation.dueSoonQueue} due soon · {data.automation.overdueQueue} overdue
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                {data.automation.lastRunSummary || "Automation sends client reminders inside the configured lead window and escalates overdue accounts to finance + info@squareexp.com."}
              </p>
              <Button
                className="mt-4"
                variant="default"
                size="sm"
                disabled={isAutomationRunning}
                onClick={() => void onRunAutomationSweep()}
              >
                {isAutomationRunning ? "Sweeping..." : "Run automation sweep"}
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Forecast" title="Revenue signal">
            <ChartContainer config={billingRevenueChartConfig} className="h-[220px] w-full">
              <BarChart data={data.charts.revenueTrend}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDateLabel} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="expected" fill="var(--color-expected)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="collected" fill="var(--color-collected)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outstanding" fill="var(--color-outstanding)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </SurfaceCard>

          <SurfaceCard eyebrow="Reminder windows" title="Billing trend">
            <ChartContainer config={billingRenewalChartConfig} className="h-[220px] w-full">
              <BarChart data={data.charts.renewals}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDateLabel} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="due" fill="var(--color-due)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="reminded" fill="var(--color-reminded)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="paid" fill="var(--color-paid)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </SurfaceCard>

          <SurfaceCard eyebrow="Create" title="New billing record">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.clientName}
                onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                placeholder="Client name"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.clientCompany}
                onChange={(event) => setForm((current) => ({ ...current, clientCompany: event.target.value }))}
                placeholder="Client company"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="billing@client.com"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.internalOwnerEmail}
                onChange={(event) => setForm((current) => ({ ...current, internalOwnerEmail: event.target.value }))}
                placeholder="info@squareexp.com"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.planName}
                onChange={(event) => setForm((current) => ({ ...current, planName: event.target.value }))}
                placeholder="Service name"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.serviceCategory}
                onChange={(event) => setForm((current) => ({ ...current, serviceCategory: event.target.value }))}
                placeholder="Service category"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="Amount"
                inputMode="decimal"
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                placeholder="USD"
                className={cn(glassInputClass, "h-10 uppercase")}
              />
              <select
                value={form.kind}
                onChange={(event) => {
                  const nextKind = event.target.value as AdminBillingKind;
                  setForm((current) => ({
                    ...current,
                    kind: nextKind,
                    interval: nextKind === "recurring" ? current.interval : "one_time",
                    workflow: nextKind === "recurring" ? current.workflow : "pre_service",
                  }));
                }}
                className={cn(glassInputClass, "h-10")}
              >
                <option value="recurring">Recurring</option>
                <option value="one_time">One-time</option>
                <option value="milestone">Milestone</option>
              </select>
              <select
                value={form.workflow}
                onChange={(event) => setForm((current) => ({ ...current, workflow: event.target.value as AdminBillingWorkflow }))}
                className={cn(glassInputClass, "h-10")}
              >
                <option value="pre_service">Pre-service</option>
                <option value="post_confirmation">Post-confirmation</option>
                <option value="post_delivery">Post-delivery</option>
              </select>
              <select
                value={form.interval}
                onChange={(event) => setForm((current) => ({ ...current, interval: event.target.value }))}
                className={cn(glassInputClass, "h-10")}
                disabled={form.kind !== "recurring"}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="one_time">One-time</option>
              </select>
              <input
                type="date"
                value={form.renewalDate}
                onChange={(event) => setForm((current) => ({ ...current, renewalDate: event.target.value }))}
                className={cn(glassInputClass, "h-10")}
              />
              <input
                value={form.reminderLeadDays}
                onChange={(event) => setForm((current) => ({ ...current, reminderLeadDays: event.target.value }))}
                placeholder="Reminder lead days"
                inputMode="numeric"
                className={cn(glassInputClass, "h-10")}
              />
            </div>

            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Contract context, hosting scope, confirmation notes, or what should happen before/after payment."
              className={cn(glassInputClass, "mt-3 min-h-[120px] py-3")}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                disabled={isCreating || !form.clientName || !form.email || !form.planName}
                onClick={() => void handleCreate()}
              >
                {isCreating ? "Creating..." : "Create billing record"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForm(defaultBillingForm())}
              >
                Reset form
              </Button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

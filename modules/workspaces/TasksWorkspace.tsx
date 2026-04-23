"use client";

import React, { useEffect, useRef, useState } from "react";
import { StatusUp, Activity, ShieldTick, NotificationBing, ArrowLeft, Trash } from "iconsax-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  AdminTask,
  AdminTaskPriority,
  AdminTaskBinSnapshot,
  AdminTaskSnapshot,
  AdminTaskStatus,
  AdminWorkspaceSnapshot,
  CreateAdminTaskInput,
  UpdateAdminTaskInput,
  UserProfile,
} from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import {
  formatCompactNumber,
  formatDateLabel,
  formatDateTime,
  formatDueDate,
  getTaskPriorityTone,
  getTaskStatusTone,
  taskPriorityLabels,
  taskSignals,
  taskStatusChartConfig,
  taskStatusLabels,
  taskThroughputChartConfig,
} from "./workspace-utils";

export function TasksWorkspace({
  data,
  tasks,
  currentUser,
  taskError,
  isRealtimeConnected,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onStartTask,
  onAddComment,
  onAddChecklistItem,
  onToggleChecklistItem,
  onLoadTaskBin,
  onRestoreTask,
  onMarkTaskSeen,
  onMarkTaskSeenRealtime,
  onJoinTaskRoom,
  onLeaveTaskRoom,
  onTaskTyping,
  taskTypingByTask,
  taskPulseByTask,
  taskEventVersion,
}: {
  data: AdminWorkspaceSnapshot | null;
  tasks: AdminTaskSnapshot | null;
  currentUser: UserProfile | null;
  taskError: string | null;
  isRealtimeConnected: boolean;
  onCreateTask: (payload: CreateAdminTaskInput) => Promise<unknown>;
  onUpdateTask: (taskId: string, payload: UpdateAdminTaskInput) => Promise<unknown>;
  onDeleteTask?: (taskId: string) => Promise<unknown>;
  onStartTask?: (taskId: string) => Promise<unknown>;
  onAddComment?: (taskId: string, body: string) => Promise<unknown>;
  onAddChecklistItem?: (taskId: string, label: string) => Promise<unknown>;
  onToggleChecklistItem?: (taskId: string, itemId: string) => Promise<unknown>;
  onLoadTaskBin?: () => Promise<AdminTaskBinSnapshot>;
  onRestoreTask?: (taskId: string) => Promise<unknown>;
  onMarkTaskSeen?: (taskId: string, commentId?: string) => Promise<unknown>;
  onMarkTaskSeenRealtime?: (taskId: string, commentId?: string) => void;
  onJoinTaskRoom?: (taskId: string) => void;
  onLeaveTaskRoom?: (taskId: string) => void;
  onTaskTyping?: (taskId: string, typing: boolean) => void;
  taskTypingByTask?: Record<string, { typing: boolean; userId: string; userName: string; at: string }>;
  taskPulseByTask?: Record<string, number>;
  taskEventVersion?: number;
}) {
  const [activeFilter, setActiveFilter] = useState<"all" | AdminTaskStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [checklistDraft, setChecklistDraft] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftPriority, setDraftPriority] = useState<AdminTaskPriority>("medium");
  const [draftAssignee, setDraftAssignee] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [draftIsPrivate, setDraftIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [taskBin, setTaskBin] = useState<AdminTaskBinSnapshot | null>(null);
  const [isBinLoading, setIsBinLoading] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const assigneeOptions =
    data?.team.map((member) => ({
      value: member.id,
      id: member.id,
      name: member.name,
      role: member.role,
    })) ||
    (currentUser
      ? [
          {
            value: currentUser.id,
            id: currentUser.id,
            name: currentUser.username,
            role: currentUser.role || "ADMIN",
          },
        ]
      : []);

  const statusFilteredTasks =
    activeFilter === "all"
      ? tasks?.tasks || []
      : (tasks?.tasks || []).filter((task) => task.status === activeFilter);

  const visibleTasks = searchQuery.trim()
    ? statusFilteredTasks.filter((task) => {
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          (task.assigneeName || "").toLowerCase().includes(q) ||
          task.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : statusFilteredTasks;

  const selectedTask = selectedTaskId
    ? (tasks?.tasks || []).find((t) => t.id === selectedTaskId) || null
    : null;
  const selectedTaskTyping = selectedTaskId ? taskTypingByTask?.[selectedTaskId] : undefined;
  const isCurrentUserAssignee = (task: AdminTask | null | undefined) =>
    !!task?.assigneeId && !!currentUser?.id && task.assigneeId === currentUser.id;
  const isCurrentUserAssigner = (task: AdminTask | null | undefined) =>
    !!task?.createdById && !!currentUser?.id && task.createdById === currentUser.id;
  const canManageSettings = (task: AdminTask | null | undefined) =>
    !!task && (task.canManageSettings ?? isCurrentUserAssignee(task));
  const canBoostTask = (task: AdminTask | null | undefined) =>
    !!task && (task.canBoost ?? isCurrentUserAssignee(task));
  const canReassignTask = (task: AdminTask | null | undefined) =>
    !!task && (task.canReassign ?? isCurrentUserAssigner(task));

  const loadTaskBin = async () => {
    if (!onLoadTaskBin) return;
    setIsBinLoading(true);
    try {
      const snapshot = await onLoadTaskBin();
      setTaskBin(snapshot);
    } finally {
      setIsBinLoading(false);
    }
  };

  useEffect(() => {
    void loadTaskBin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onLoadTaskBin, taskEventVersion]);

  useEffect(() => {
    if (!selectedTaskId) return;
    onJoinTaskRoom?.(selectedTaskId);
    void onMarkTaskSeen?.(selectedTaskId);
    onMarkTaskSeenRealtime?.(selectedTaskId);
    return () => {
      onLeaveTaskRoom?.(selectedTaskId);
      onTaskTyping?.(selectedTaskId, false);
    };
  }, [
    selectedTaskId,
    onJoinTaskRoom,
    onLeaveTaskRoom,
    onMarkTaskSeen,
    onMarkTaskSeenRealtime,
    onTaskTyping,
  ]);

  useEffect(() => {
    if (!selectedTask) return;
    setDraftIsPrivate(!!selectedTask.isPrivate);
  }, [selectedTask?.id, selectedTask?.isPrivate]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const signalSeeds = [
    ...(data?.reports.slice(0, 2).map((report) => ({
      key: `report-${report.id}`,
      label: report.type === "PRODUCT" ? "Product issue" : "Issue report",
      title: report.subject || "Client issue follow-up",
      description: `${report.message}\n\nReporter: ${report.firstName} ${report.lastName} · ${report.email}`,
      priority:
        report.priority === "CRITICAL"
          ? ("urgent" as AdminTaskPriority)
          : report.priority === "HIGH"
            ? ("high" as AdminTaskPriority)
            : report.priority === "LOW"
              ? ("low" as AdminTaskPriority)
              : ("medium" as AdminTaskPriority),
      source: "report" as const,
      tags: ["reports", report.type.toLowerCase()],
    })) || []),
    ...(data?.support.slice(0, 2).map((session) => ({
      key: `support-${session.sessionId}`,
      label: "Support session",
      title: `Follow up ${session.name || session.email || "support visitor"}`,
      description: session.preview,
      priority: session.unanswered ? ("high" as AdminTaskPriority) : ("medium" as AdminTaskPriority),
      source: "support" as const,
      tags: ["support", session.unanswered ? "urgent" : "follow-up"],
    })) || []),
    ...(data?.bookings.slice(0, 1).map((booking) => ({
      key: `booking-${booking.id}`,
      label: "Booking",
      title: `Prepare ${booking.bookingType || "booking"} handoff`,
      description: `${booking.customerName} booked a new slot for ${formatDateTime(booking.bookingDate)}.`,
      priority: "medium" as AdminTaskPriority,
      source: "booking" as const,
      tags: ["booking", "handoff"],
    })) || []),
  ];

  if (!tasks) {
    return (
      <WorkspaceStateCard
        title="Loading realtime tasks"
        description="The admin execution board is syncing from the backend so create, assignment, and progress controls can come online."
      />
    );
  }

  const resolveAssignee = (value: string) => assigneeOptions.find((item) => item.value === value);

  const createTask = async (payload: CreateAdminTaskInput) => {
    setIsSubmitting(true);
    try {
      await onCreateTask(payload);
      setDraftTitle("");
      setDraftDescription("");
      setDraftDueDate("");
      setDraftPriority("medium");
      setDraftAssignee("");
      setDraftIsPrivate(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draftTitle.trim()) {
      return;
    }

    const assignee = resolveAssignee(draftAssignee);
    await createTask({
      title: draftTitle.trim(),
      description: draftDescription.trim() || undefined,
      priority: draftPriority,
      source: "manual",
      isPrivate: draftIsPrivate,
      assigneeId: assignee?.id,
      assigneeName: assignee?.name,
      dueDate: draftDueDate ? new Date(draftDueDate).toISOString() : undefined,
      tags: ["tasks", "manual"],
    });
  };

  const mutateTask = async (taskId: string, payload: UpdateAdminTaskInput) => {
    setPendingTaskId(taskId);
    try {
      await onUpdateTask(taskId, payload);
    } finally {
      setPendingTaskId(null);
    }
  };

  const handleCommentInputChange = (nextValue: string) => {
    setCommentDraft(nextValue);
    if (!selectedTaskId || !onTaskTyping) return;
    onTaskTyping(selectedTaskId, true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTaskTyping(selectedTaskId, false);
    }, 1200);
  };

  const submitComment = () => {
    if (!selectedTask || !commentDraft.trim() || !onAddComment) return;
    const body = commentDraft.trim();
    onTaskTyping?.(selectedTask.id, false);
    void onAddComment(selectedTask.id, body);
    setCommentDraft("");
    void onMarkTaskSeen?.(selectedTask.id);
    onMarkTaskSeenRealtime?.(selectedTask.id);
  };

  const closeTaskModal = () => {
    if (selectedTaskId) {
      onTaskTyping?.(selectedTaskId, false);
      onLeaveTaskRoom?.(selectedTaskId);
    }
    setSelectedTaskId(null);
    setCommentDraft("");
    setChecklistDraft("");
  };

  return (
    <div className="space-y-3 overflow-y-auto p-3">
      <div className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard eyebrow="Tasks" title="Task Board | Accross all workspaces">
          <div className="grid gap-2.5 md:grid-cols-4">
            <MetricCard
              label="Total"
              value={formatCompactNumber(tasks.metrics.total)}
              note="Tracked tasks flowing through the admin board."
              icon={Activity}
            />
            <MetricCard
              label="In flight"
              value={formatCompactNumber(tasks.metrics.inProgress + tasks.metrics.review)}
              note="Tasks moving through execution and review."
              icon={StatusUp}
            />
            <MetricCard
              label="Blocked"
              value={formatCompactNumber(tasks.metrics.blocked)}
              note="Items currently waiting on a decision or dependency."
              icon={ShieldTick}
            />
            <MetricCard
              label="Done"
              value={`${tasks.metrics.completionRate}%`}
              note="Completion rate across the current task board."
              icon={NotificationBing}
            />
          </div>

          <div className="mt-4 rounded-[14px] border border-white/10 bg-black/20 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-white/40">Realtime feed</p>
                <p className="mt-1.5 text-[15px] font-semibold text-white">
                  Task throughput over the last 7 days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.18em]",
                    isRealtimeConnected
                      ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-sq-brand-action"
                      : "border-white/10 text-white/50",
                  )}
                >
                  {isRealtimeConnected ? "Live sync" : "Polling"}
                </span>
                {taskError ? (
                  <span className="rounded-full border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[#ffb49d]">
                    {taskError}
                  </span>
                ) : null}
              </div>
            </div>

            <ChartContainer config={taskThroughputChartConfig} className="h-[220px] w-full">
              <LineChart data={tasks.charts.throughput}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={formatDateLabel} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="created" stroke="var(--color-created)" strokeWidth={2} dot={false} />
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
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Create" title="Create and assign work">
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Task title</label>
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Prepare invoice renewal follow-up"
                className="mt-1.5 w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-[rgba(205,255,4,0.3)]"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Description</label>
              <textarea
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder="Add the next concrete action, expected outcome, and context from support, reports, or ops."
                className="mt-1.5 min-h-[100px] w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5 text-[13px] text-white outline-none transition focus:border-[rgba(205,255,4,0.3)]"
              />
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div>
                <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Priority</label>
                <select
                  value={draftPriority}
                  onChange={(event) => setDraftPriority(event.target.value as AdminTaskPriority)}
                  className="mt-1.5 w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5 text-[13px] text-white outline-none"
                >
                  {Object.entries(taskPriorityLabels).map(([priority, label]) => (
                    <option key={priority} value={priority} className="bg-[#0a0d14]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Assignee</label>
                <select
                  value={draftAssignee}
                  onChange={(event) => setDraftAssignee(event.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5 text-[13px] text-white outline-none"
                >
                  <option value="" className="bg-[#0a0d14]">
                    Unassigned
                  </option>
                  {assigneeOptions.map((assignee) => (
                    <option key={assignee.value} value={assignee.value} className="bg-[#0a0d14]">
                      {assignee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Due date</label>
                <input
                  type="date"
                  value={draftDueDate}
                  onChange={(event) => setDraftDueDate(event.target.value)}
                  className="mt-1.5 w-full rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5 text-[13px] text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5">
              <div>
                <p className="text-[12px] text-white/80">Private task</p>
                <p className="text-[10px] text-white/40">Only visible to you and the assignee</p>
              </div>
              <Switch
                checked={draftIsPrivate}
                onCheckedChange={(val) => setDraftIsPrivate(val)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !draftTitle.trim()}
              className="w-full rounded-[12px] border border-[rgba(205,255,4,0.28)] bg-[rgba(205,255,4,0.12)] px-4 py-2.5 text-[13px] font-medium text-[var(--sq-brand-action)] transition hover:bg-[rgba(205,255,4,0.18)] disabled:opacity-50"
            >
              {isSubmitting ? "Creating task..." : "Create task"}
            </button>
          </form>
        </SurfaceCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard eyebrow="Board" title="Live task board">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-48 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 pl-7 text-[11px] text-white outline-none transition focus:border-[rgba(205,255,4,0.3)]"
                />
                <svg className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {(["all", "assigned", "todo", "in_progress", "review", "blocked", "done"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                    activeFilter === filter
                      ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-sq-brand-action"
                      : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/75",
                  )}
                >
                  {filter === "all" ? "All tasks" : taskStatusLabels[filter]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/50">
                {showBin ? (taskBin?.total || 0) : visibleTasks.length} visible
              </span>
              <button
                onClick={() => setShowBin((prev) => !prev)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                  showBin
                    ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-sq-brand-action"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/75",
                )}
              >
                {showBin ? <div className="flex items-center gap-2 p-1"> <ArrowLeft color="currentColor" size={15} /> </div> : <div className="flex items-center gap-2 p-1"><Trash color="currentColor" size={15} /> Bin</div>}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {showBin ? (
              isBinLoading ? (
                <div className="rounded-[14px] border border-dashed border-white/12 px-4 py-5 text-[12px] text-white/50">
                  Loading task bin...
                </div>
              ) : taskBin?.tasks.length ? (
                taskBin.tasks.map((task) => (
                  <div key={task.id} className="rounded-[14px] border border-white/10 bg-black/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-white">{task.title}</p>
                        <p className="mt-1 text-[11px] text-white/45">
                          Deleted {formatDateTime(task.deletedAt || task.updatedAt)} · Auto purge{" "}
                          {task.restoreUntil ? formatDateTime(task.restoreUntil) : "soon"}
                        </p>
                      </div>
                      {onRestoreTask && currentUser?.role === "SUPER_ADMIN" ? (
                        <button
                          onClick={() =>
                            void onRestoreTask(task.id).then(() => {
                              void loadTaskBin();
                            })
                          }
                          className="rounded-full border border-[rgba(205,255,4,0.28)] bg-[rgba(205,255,4,0.1)] px-3 py-1.5 text-[11px] text-[var(--sq-brand-action)]"
                        >
                          Restore
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-white/12 px-4 py-5 text-[12px] text-white/50">
                  Bin is empty.
                </div>
              )
            ) : visibleTasks.length ? (
              visibleTasks.map((task) => {
                const selectedAssignee = task.assigneeId || task.assigneeName || "";
                const hasSelectedAssigneeOption = assigneeOptions.some(
                  (assignee) => assignee.value === selectedAssignee,
                );
                const isPending = pendingTaskId === task.id;
                const taskTyping = taskTypingByTask?.[task.id];
                const isPulsing = !!taskPulseByTask?.[task.id];
                const canEditTaskSettings = canManageSettings(task);
                const canReassignAssignee = canReassignTask(task);
                const canBoost = canBoostTask(task);

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded-[14px] border border-white/10 bg-black/20 p-3 transition-all",
                      isPulsing &&
                        "border-[rgba(205,255,4,0.32)] shadow-[0_0_0_1px_rgba(205,255,4,0.18),0_0_24px_rgba(205,255,4,0.16)]",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-white hover:text-[var(--sq-brand-action)] transition-colors">{task.title}</p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]",
                              getTaskStatusTone(task.status),
                            )}
                          >
                            {taskStatusLabels[task.status]}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]",
                              getTaskPriorityTone(task.priority),
                            )}
                          >
                            {taskPriorityLabels[task.priority]}
                          </span>
                          {task.isPrivate ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-amber-400">
                              Private
                            </span>
                          ) : null}
                          {taskTyping?.typing ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.08)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--sq-brand-action)]">
                              <span className="flex items-center gap-1">
                                <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                                <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                                <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                              </span>
                              {taskTyping.userName} typing
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 max-w-3xl text-[12px] leading-relaxed text-white/50">
                          {task.description || "No description"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-white/50">
                        {task.progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 rounded-full bg-white/8">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          task.status === "done"
                            ? "bg-sky-400"
                            : task.status === "blocked"
                              ? "bg-rose-400"
                              : "bg-[var(--sq-brand-action)]",
                        )}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>

                    <div className="mt-3 grid gap-2.5 lg:grid-cols-[0.8fr_0.7fr_0.5fr]">
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Status</label>
                        <select
                          value={task.status}
                          disabled={isPending || !canEditTaskSettings}
                          onChange={(event) =>
                            canEditTaskSettings
                              ? void mutateTask(task.id, {
                                  status: event.target.value as AdminTaskStatus,
                                  progress: event.target.value === "done" ? 100 : task.progress,
                                })
                              : undefined
                          }
                          className="mt-1.5 w-full rounded-[10px] border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-white outline-none disabled:opacity-50"
                        >
                          {Object.entries(taskStatusLabels).map(([status, label]) => (
                            <option key={status} value={status} className="bg-[#0a0d14]">
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">Assignee</label>
                        <select
                          value={selectedAssignee}
                          disabled={isPending || !canReassignAssignee}
                          onChange={(event) => {
                            if (!canReassignAssignee) return;
                            const assignee = resolveAssignee(event.target.value);
                            void mutateTask(task.id, {
                              assigneeId: assignee?.id,
                              assigneeName: assignee?.name,
                            });
                          }}
                          className="mt-1.5 w-full rounded-[10px] border border-white/10 bg-black/20 px-3 py-2 text-[12px] text-white outline-none disabled:opacity-50"
                        >
                          <option value="" className="bg-[#0a0d14]">
                            Unassigned
                          </option>
                          {selectedAssignee && !hasSelectedAssigneeOption ? (
                            <option value={selectedAssignee} className="bg-[#0a0d14]">
                              {task.assigneeName || selectedAssignee}
                            </option>
                          ) : null}
                          {assigneeOptions.map((assignee) => (
                            <option key={assignee.value} value={assignee.value} className="bg-[#0a0d14]">
                              {assignee.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-[0.22em] text-white/40">
                          {task.status === "assigned" ? "Action" : "Boost"}
                        </label>
                        {task.status === "assigned" && onStartTask && canBoost ? (
                          <button
                            disabled={isPending}
                            onClick={() => void onStartTask(task.id)}
                            className="mt-1.5 w-full rounded-[10px] border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[12px] font-medium text-sky-400 disabled:opacity-50"
                          >
                            {isPending ? "Starting..." : "Start Task"}
                          </button>
                        ) : canBoost ? (
                          <button
                            disabled={isPending}
                            onClick={() =>
                              void mutateTask(task.id, {
                                progress: Math.min(100, task.progress + 10),
                                status: task.status === "todo" ? "in_progress" : task.status,
                              })
                            }
                            className="mt-1.5 w-full rounded-[10px] border border-[rgba(205,255,4,0.22)] px-3 py-2 text-[12px] text-[var(--sq-brand-action)] disabled:opacity-50"
                          >
                            {isPending ? "Updating..." : "+10% progress"}
                          </button>
                        ) : (
                          <div className="mt-1.5 rounded-[10px] border border-white/8 bg-black/20 px-3 py-2 text-[11px] text-white/35">
                            View only
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/35">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span>Source: {task.source}</span>
                        <span>Due: {formatDueDate(task.dueDate)}</span>
                        <span>Updated {formatDateTime(task.updatedAt)}</span>
                      </div>
                      {task.tags.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/40"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {task.activity.slice(0, 2).map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-[10px] border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] text-white/50"
                        >
                          <p>{entry.message}</p>
                          <p className="mt-0.5 text-[10px] text-white/30">
                            {entry.actorName} · {formatDateTime(entry.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[14px] border border-dashed border-white/12 px-4 py-5 text-[12px] text-white/50">
                No tasks match the current filter yet.
              </div>
            )}
          </div>
        </SurfaceCard>

        <div className="space-y-3">
          <SurfaceCard eyebrow="Seeds" title="Convert live signals into tasks">
            <div className="space-y-2.5">
              {signalSeeds.length ? (
                signalSeeds.map((seed) => (
                  <div key={seed.key} className="rounded-[12px] border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.22em] text-white/35">{seed.label}</p>
                        <p className="mt-1.5 text-[13px] font-medium text-white">{seed.title}</p>
                      </div>
                      <button
                        onClick={() =>
                          void createTask({
                            title: seed.title,
                            description: seed.description,
                            priority: seed.priority,
                            source: seed.source,
                            tags: seed.tags,
                          })
                        }
                        className="rounded-full border border-[rgba(205,255,4,0.22)] px-2.5 py-1 text-[11px] text-[var(--sq-brand-action)]"
                      >
                        Create
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/50">{seed.description}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[12px] border border-dashed border-white/12 px-3.5 py-3 text-[12px] text-white/50">
                  Support, reports, and booking signals render here as live task seeds.
                </div>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Distribution" title="Workload mix">
            <ChartContainer config={taskStatusChartConfig} className="h-[200px] w-full">
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ChartContainer>

            <div className="mt-3 space-y-2">
              {taskSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-[12px] border border-dashed border-white/12 px-3.5 py-2 text-[12px] leading-relaxed text-white/55"
                >
                  {signal}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>

      {selectedTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeTaskModal}>
          <div className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[18px] border border-white/10 bg-[#0c0f18] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-white/40">Task detail</p>
                <h3 className="mt-1 text-[17px] font-semibold text-white">{selectedTask.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {onDeleteTask && selectedTask.canDelete ? (
                  <button
                    onClick={() =>
                      void onDeleteTask(selectedTask.id).then(() => {
                        void loadTaskBin();
                        closeTaskModal();
                      })
                    }
                    className="rounded-full border border-rose-500/20 px-2.5 py-1 text-[11px] text-rose-400 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                ) : null}
                <button
                  onClick={closeTaskModal}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/50 transition hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em]", getTaskStatusTone(selectedTask.status))}>
                {taskStatusLabels[selectedTask.status]}
              </span>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.14em]", getTaskPriorityTone(selectedTask.priority))}>
                {taskPriorityLabels[selectedTask.priority]}
              </span>
              <span className="text-[11px] text-white/40">{selectedTask.progress}% · {selectedTask.source}</span>
              {selectedTask.assigneeName ? <span className="text-[11px] text-white/50">Assigned: {selectedTask.assigneeName}</span> : null}
              <span className="text-[11px] text-white/40">Due: {formatDueDate(selectedTask.dueDate)}</span>
            </div>

            {selectedTaskTyping?.typing ? (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--sq-brand-action)]">
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                </span>
                {selectedTaskTyping.userName} is typing
              </div>
            ) : null}

            <p className="mb-4 text-[13px] leading-relaxed text-white/60">{selectedTask.description}</p>

            {selectedTask.tags.length ? (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {selectedTask.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/40">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mb-4 h-1.5 rounded-full bg-white/8">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  selectedTask.status === "done" ? "bg-sky-400" : selectedTask.status === "blocked" ? "bg-rose-400" : "bg-[var(--sq-brand-action)]",
                )}
                style={{ width: `${selectedTask.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[12px] border border-white/10 bg-black/20 px-3 py-2.5">
              <div>
                <p className="text-[12px] text-white/80">Private task</p>
                <p className="text-[10px] text-white/40">Only visible to you and the assignee</p>
              </div>
              <Switch
                checked={draftIsPrivate}
                disabled={!canManageSettings(selectedTask)}
                onCheckedChange={(val) => {
                  setDraftIsPrivate(val);
                  if (!selectedTask || !canManageSettings(selectedTask)) return;
                  void mutateTask(selectedTask.id, { isPrivate: val });
                }}
              />
            </div>

            {selectedTask.checklist.length > 0 || onAddChecklistItem ? (
              <div className="mb-4 rounded-[12px] border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[9px] uppercase tracking-[0.22em] text-white/40 mb-2">Checklist</p>
                <div className="space-y-1.5">
                  {selectedTask.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={item.isDone}
                        disabled={!canManageSettings(selectedTask)}
                        onCheckedChange={() => {
                          if (!canManageSettings(selectedTask)) return;
                          onToggleChecklistItem?.(selectedTask.id, item.id);
                        }}
                      />
                      <span className={cn("text-[12px] transition-all", item.isDone ? "text-white/40 line-through" : "text-white/70")}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                {onAddChecklistItem ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={checklistDraft}
                      disabled={!canManageSettings(selectedTask)}
                      onChange={(e) => setChecklistDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && checklistDraft.trim() && canManageSettings(selectedTask)) {
                          onAddChecklistItem(selectedTask.id, checklistDraft.trim());
                          setChecklistDraft("");
                        }
                      }}
                      placeholder="Add checklist item..."
                      className="flex-1 rounded-[10px] border border-white/10 bg-black/20 px-3 py-1.5 text-[12px] text-white outline-none"
                    />
                    <button
                      disabled={!canManageSettings(selectedTask)}
                      onClick={() => {
                        if (checklistDraft.trim() && canManageSettings(selectedTask)) {
                          onAddChecklistItem(selectedTask.id, checklistDraft.trim());
                          setChecklistDraft("");
                        }
                      }}
                      className="rounded-[10px] border border-[rgba(205,255,4,0.22)] px-3 py-1.5 text-[11px] text-[var(--sq-brand-action)] disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mb-4 rounded-[12px] border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/40 mb-2">Comments</p>
              {selectedTask.comments.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment.id} className="rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
                      <p className="text-[12px] text-white/70">{comment.body}</p>
                      <p className="mt-0.5 text-[10px] text-white/30">
                        {comment.authorName} · {formatDateTime(comment.createdAt)}
                      </p>
                      {comment.seenBy?.length ? (
                        <p className="mt-0.5 text-[10px] text-white/35">
                          Seen by{" "}
                          {comment.seenBy
                            .map((seen) => seen.userName)
                            .filter((name, index, all) => all.indexOf(name) === index)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-[12px] text-white/30">No comments yet.</p>
              )}
              {onAddComment ? (
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => handleCommentInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentDraft.trim()) {
                        submitComment();
                      }
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-[10px] border border-white/10 bg-black/20 px-3 py-1.5 text-[12px] text-white outline-none"
                  />
                  <button
                    onClick={submitComment}
                    className="rounded-[10px] border border-[rgba(205,255,4,0.22)] px-3 py-1.5 text-[11px] text-[var(--sq-brand-action)]"
                  >
                    Send
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-[12px] border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/40 mb-2">Activity timeline</p>
              <div className="space-y-1.5">
                {selectedTask.activity.map((entry) => (
                  <div key={entry.id} className="rounded-[10px] border border-white/8 bg-black/20 px-3 py-2 text-[12px] text-white/50">
                    <p>{entry.message}</p>
                    <p className="mt-0.5 text-[10px] text-white/30">{entry.actorName} · {formatDateTime(entry.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

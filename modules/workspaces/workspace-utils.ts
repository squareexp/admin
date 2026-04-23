import type {
  AdminBillingKind,
  AdminBillingStatus,
  AdminBillingWorkflow,
  AdminTaskPriority,
  AdminTaskStatus,
} from "@/lib/admin-types";

// ─── Chart configs ──────────────────────────────────────────────────

export const intakeChartConfig = {
  value: {
    label: "Volume",
    color: "var(--sq-brand-action)",
  },
};

export const trendChartConfig = {
  visitors: {
    label: "Visitors",
    color: "#CDFF04",
  },
  bookings: {
    label: "Bookings",
    color: "#57C7FF",
  },
  reports: {
    label: "Reports",
    color: "#FF8A65",
  },
};

export const geoChartConfig = {
  count: {
    label: "Count",
    color: "#A5E366",
  },
};

export const taskThroughputChartConfig = {
  created: {
    label: "Created",
    color: "#CDFF04",
  },
  completed: {
    label: "Completed",
    color: "#57C7FF",
  },
  touched: {
    label: "Touched",
    color: "#FF8A65",
  },
};

export const taskStatusChartConfig = {
  count: {
    label: "Count",
    color: "#CDFF04",
  },
};

export const billingRenewalChartConfig = {
  due: {
    label: "Due",
    color: "#CDFF04",
  },
  reminded: {
    label: "Reminded",
    color: "#57C7FF",
  },
  paid: {
    label: "Paid",
    color: "#FF8A65",
  },
};

export const billingRevenueChartConfig = {
  expected: {
    label: "Expected",
    color: "#CDFF04",
  },
  collected: {
    label: "Collected",
    color: "#57C7FF",
  },
  outstanding: {
    label: "Outstanding",
    color: "#FF8A65",
  },
};

export const pieColors = ["#CDFF04", "#57C7FF", "#FF8A65", "#F9F871"];

// ─── Label maps ─────────────────────────────────────────────────────

export const taskStatusLabels: Record<AdminTaskStatus, string> = {
  draft: "Draft",
  assigned: "Assigned",
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
  canceled: "Canceled",
};

export const taskPriorityLabels: Record<AdminTaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const billingStatusLabels: Record<AdminBillingStatus, string> = {
  active: "Active",
  due: "Due soon",
  overdue: "Overdue",
  paid: "Paid",
  snoozed: "Snoozed",
};

export const billingKindLabels: Record<AdminBillingKind, string> = {
  recurring: "Recurring",
  one_time: "One-time",
  milestone: "Milestone",
};

export const billingWorkflowLabels: Record<AdminBillingWorkflow, string> = {
  pre_service: "Pre-service",
  post_confirmation: "Post-confirmation",
  post_delivery: "Post-delivery",
};

export const taskSignals = [
  "Ask for progress and notify through WhatsApp, email, and in-system at once.",
  "Mirror external task events into this workspace with live collaboration status.",
  "Use issue reports and support friction as automatic task seeds.",
];

// ─── Formatters ─────────────────────────────────────────────────────

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDueDate(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

export function inferImapHostFromSmtpHost(smtpHost: string) {
  const trimmed = smtpHost.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("smtp.")) {
    return `imap.${trimmed.slice("smtp.".length)}`;
  }

  return trimmed;
}

// ─── Tone helpers ───────────────────────────────────────────────────

export function getTaskStatusTone(status: AdminTaskStatus) {
  if (status === "done") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "blocked" || status === "canceled") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (status === "review") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  if (status === "assigned") {
    return "border-violet-400/20 bg-violet-400/10 text-violet-200";
  }

  if (status === "in_progress") {
    return "border-[rgba(205,255,4,0.28)] bg-[rgba(205,255,4,0.12)] text-[var(--sq-brand-action)]";
  }

  return "border-white/10 bg-white/5 text-white/65";
}

export function getTaskPriorityTone(priority: AdminTaskPriority) {
  if (priority === "urgent") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (priority === "high") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  if (priority === "medium") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  return "border-white/10 bg-white/5 text-white/65";
}

export function getBillingStatusTone(status: AdminBillingStatus) {
  if (status === "paid") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  if (status === "overdue") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (status === "due") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  if (status === "snoozed") {
    return "border-white/10 bg-white/5 text-white/65";
  }

  return "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-[var(--sq-brand-action)]";
}

export function getBillingKindTone(kind: AdminBillingKind) {
  if (kind === "one_time") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  if (kind === "milestone") {
    return "border-violet-400/20 bg-violet-400/10 text-violet-200";
  }

  return "border-white/10 bg-white/5 text-white/65";
}

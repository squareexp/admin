export type AdminSection =
  | 'dashboard'
  | 'messages'
  | 'invoice'
  | 'mail'
  | 'report'
  | 'team'
  | 'analytics'
  | 'tasks'
  | 'billings'
  | 'settings';

export type MessageSection = 'team' | 'support' | 'inbox';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role?: string;
  twoFactorEnabled?: boolean;
}

export interface AdminWorkspaceSnapshot {
  generatedAt: string;
  metrics: {
    visitors: {
      total: number;
      last14Days: number;
    };
    bookings: {
      total: number;
      last30Days: number;
    };
    reports: {
      total: number;
      contacts: number;
      products: number;
      open: number;
    };
    customers: {
      total: number;
      reviews: number;
    };
    team: {
      total: number;
      activeAdmins: number;
      suspended: number;
    };
    support: {
      activeSessions: number;
      totalSessions: number;
      unresolved: number;
    };
  };
  charts: {
    activity: Array<{
      date: string;
      visitors: number;
      bookings: number;
      reports: number;
    }>;
    intakeMix: Array<{
      label: string;
      value: number;
    }>;
    countries: Array<{
      country: string;
      count: number;
    }>;
  };
  team: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  reports: Array<{
    id: string;
    type: 'CONTACT' | 'CASE' | 'PRODUCT';
    status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: string;
    subject: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    clientCompany: string | null;
    message: string;
    techIssue: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  bookings: Array<{
    id: string;
    bookingType: string | null;
    bookingDate: string;
    createdAt: string;
    customerName: string;
    customerEmail: string;
  }>;
  reviews: Array<{
    id: string;
    name: string;
    rating: number;
    comment: string;
    designation: string | null;
    createdAt: string;
  }>;
  support: Array<{
    sessionId: string;
    name?: string;
    email?: string;
    connected: boolean;
    lastSeenAt: string;
    unanswered: boolean;
    preview: string;
  }>;
  activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

export interface AdminSystemSnapshot {
  checkedAt: string;
  nest: {
    ok: boolean;
    url: string;
    error?: string;
  };
  mailGateway?: {
    ok: boolean;
    status?: string;
    error?: string;
    issues?: string[];
    checkedAt?: string;
    authRequired?: boolean;
    tokenConfigured?: boolean;
    requestSigningRequired?: boolean;
    requestSigningConfigured?: boolean;
    allowedTimestampSkewSeconds?: number;
    nonceTtlSeconds?: number;
    rateLimitWindowSeconds?: number;
    rateLimitMaxRequests?: number;
    maxRequestBytes?: number;
  };
  core: {
    ok: boolean;
    url?: string;
    error?: string;
    status?: string;
    service?: string;
    timestamp?: string;
  };
}

export type AdminTaskStatus = 'draft' | 'assigned' | 'todo' | 'in_progress' | 'review' | 'blocked' | 'done' | 'canceled';

export type AdminTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AdminTaskSource = 'manual' | 'report' | 'support' | 'booking' | 'system';

export interface AdminTaskActivity {
  id: string;
  type:
    | 'created'
    | 'updated'
    | 'status'
    | 'progress'
    | 'assignment'
    | 'due_date'
    | 'comment'
    | 'deleted'
    | 'restored'
    | 'seen';
  message: string;
  actorName: string;
  createdAt: string;
}

export interface AdminTaskComment {
  id: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  seenBy?: AdminTaskSeenBy[];
}

export interface AdminTaskSeenBy {
  userId: string;
  userName: string;
  seenAt: string;
}

export interface AdminTaskChecklistItem {
  id: string;
  label: string;
  isDone: boolean;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTask {
  id: string;
  title: string;
  description: string;
  status: AdminTaskStatus;
  priority: AdminTaskPriority;
  progress: number;
  source: AdminTaskSource;
  isPrivate: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  createdById: string | null;
  createdByName: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  deletedAt?: string | null;
  deletedById?: string | null;
  restoreUntil?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  activity: AdminTaskActivity[];
  comments: AdminTaskComment[];
  checklist: AdminTaskChecklistItem[];
  canDelete?: boolean;
  canBoost?: boolean;
  canManageSettings?: boolean;
  canReassign?: boolean;
  reportId?: string | null;
}

export interface AdminTaskSnapshot {
  generatedAt: string;
  metrics: {
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    blocked: number;
    done: number;
    overdue: number;
    completionRate: number;
  };
  charts: {
    throughput: Array<{
      date: string;
      created: number;
      completed: number;
      touched: number;
    }>;
    status: Array<{
      status: AdminTaskStatus;
      count: number;
    }>;
    priority: Array<{
      priority: AdminTaskPriority;
      count: number;
    }>;
  };
  tasks: AdminTask[];
}

export interface AdminTaskBinSnapshot {
  generatedAt: string;
  total: number;
  tasks: AdminTask[];
}

export type AdminTaskRealtimeEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.progress.updated'
  | 'task.comment.created'
  | 'task.typing.started'
  | 'task.typing.stopped'
  | 'task.read.seen'
  | 'task.deleted.soft'
  | 'task.restored'
  | 'task.deleted.purged';

export interface AdminTaskRealtimeEvent {
  type: AdminTaskRealtimeEventType;
  taskId: string;
  actorId?: string;
  actorName?: string;
  payload?: unknown;
  at: string;
}

export interface CreateAdminTaskInput {
  title: string;
  description?: string;
  status?: AdminTaskStatus;
  priority?: AdminTaskPriority;
  progress?: number;
  source?: AdminTaskSource;
  isPrivate?: boolean;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  tags?: string[];
  reportId?: string;
}

export interface UpdateAdminTaskInput {
  title?: string;
  description?: string;
  status?: AdminTaskStatus;
  priority?: AdminTaskPriority;
  progress?: number;
  source?: AdminTaskSource;
  isPrivate?: boolean;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  tags?: string[];
}

export interface AddTaskCommentInput {
  body: string;
}

export interface AssignTaskInput {
  userId: string;
  userName: string;
  role?: 'owner' | 'contributor' | 'watcher';
}

export interface AddTaskChecklistInput {
  label: string;
}

export type SessionSameSite = 'strict' | 'lax' | 'none';

export interface AdminSettingsSnapshot {
  updatedAt: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromAddress: string;
  };
  imap: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    useSmtpDefaults: boolean;
  };
  session: {
    maxAgeHours: number;
    sameSite: SessionSameSite;
    secureCookies: boolean;
    allowMultipleSessions: boolean;
  };
  integrations: {
    nestUrl: string;
    coreUrl: string;
    supportSocketUrl: string;
    tasksSocketUrl: string;
  };
  notifications: {
    billingEmailEnabled: boolean;
    inboxAlerts: boolean;
    soundEffects: boolean;
  };
}

export interface AdminEmailRuntimeSnapshot {
  smtp: AdminSettingsSnapshot["smtp"];
  imap: AdminSettingsSnapshot["imap"];
}

export type AdminBillingStatus = 'active' | 'due' | 'overdue' | 'paid' | 'snoozed';
export type AdminBillingInterval = 'one_time' | 'monthly' | 'quarterly' | 'annual';
export type AdminBillingKind = 'recurring' | 'one_time' | 'milestone';
export type AdminBillingWorkflow = 'pre_service' | 'post_confirmation' | 'post_delivery';

export interface AdminBillingSubscription {
  id: string;
  clientId: string | null;
  clientName: string;
  clientCompany: string | null;
  email: string;
  internalOwnerEmail: string | null;
  kind: AdminBillingKind;
  workflow: AdminBillingWorkflow;
  serviceCategory: string;
  planName: string;
  amount: number;
  currency: string;
  interval: AdminBillingInterval;
  status: AdminBillingStatus;
  renewalDate: string;
  reminderLeadDays: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  lastReminderSentAt: string | null;
  lastPaidAt: string | null;
  lastInternalAlertAt: string | null;
  lastAutomationRunAt: string | null;
  snoozedUntil: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBillingSnapshot {
  generatedAt: string;
  metrics: {
    total: number;
    dueSoon: number;
    overdue: number;
    remindedThisWeek: number;
    paidRecently: number;
    monthlyValue: number;
    recurringValue: number;
    oneTimeValue: number;
    projectedMonthlyRevenue: number;
    collectedThisMonth: number;
    overdueValue: number;
    lossRiskValue: number;
  };
  charts: {
    renewals: Array<{
      date: string;
      due: number;
      reminded: number;
      paid: number;
    }>;
    revenueTrend: Array<{
      date: string;
      expected: number;
      collected: number;
      outstanding: number;
    }>;
  };
  automation: {
    lastRunAt: string | null;
    lastRunSummary: string | null;
    dueSoonQueue: number;
    overdueQueue: number;
  };
  subscriptions: AdminBillingSubscription[];
}

export interface CreateAdminBillingInput {
  clientId?: string;
  clientName: string;
  clientCompany?: string;
  email: string;
  internalOwnerEmail?: string;
  kind?: AdminBillingKind;
  workflow?: AdminBillingWorkflow;
  serviceCategory?: string;
  planName: string;
  amount: number;
  currency?: string;
  interval?: AdminBillingInterval;
  renewalDate: string;
  reminderLeadDays?: number;
  notes?: string;
}

export interface UpdateAdminBillingInput {
  status?: AdminBillingStatus;
  renewalDate?: string;
  notes?: string;
  reminderLeadDays?: number;
  workflow?: AdminBillingWorkflow;
  serviceCategory?: string;
  internalOwnerEmail?: string;
  snoozeDays?: number;
}

export type AdminInvoiceStatus =
  | 'draft'
  | 'proforma'
  | 'sent'
  | 'paid'
  | 'overdue';

export type AdminInvoiceDisplayVariant = 'light' | 'dark';

export interface AdminInvoiceLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

export interface AdminInvoiceAiReview {
  reviewedAt: string;
  tone: 'professional' | 'neutral' | 'friendly';
  summary: string;
  suggestions: string[];
  riskFlags: string[];
  normalizedTerms: string;
  suggestedNotes: string;
  instructionUsed: string | null;
}

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  status: AdminInvoiceStatus;
  publicStatusToken: string;
  issuerName: string;
  issuerEmail: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  partnerEnabled: boolean;
  partnerLabel: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
  partnerCompany: string | null;
  partnerLogoUrl: string | null;
  issueDate: string;
  dueDate: string | null;
  currency: string;
  notes: string;
  internalMemo: string;
  terms: string;
  logoUrl: string | null;
  displayVariant: AdminInvoiceDisplayVariant;
  logoSize: number;
  fontSize: number;
  tableItemCornerRadius: number;
  discountAmount: number;
  taxRate: number;
  sentAt: string | null;
  paidAt: string | null;
  lastResentAt: string | null;
  lastResentById: string | null;
  lastResentByName: string | null;
  deletedAt: string | null;
  deletedById: string | null;
  deletedByName: string | null;
  restoreUntil: string | null;
  items: AdminInvoiceLineItem[];
  aiReview: AdminInvoiceAiReview | null;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  outstandingAmount: number;
}

export interface AdminInvoiceSnapshot {
  generatedAt: string;
  metrics: {
    total: number;
    draft: number;
    proforma: number;
    sent: number;
    paid: number;
    overdue: number;
    outstandingValue: number;
    paidValue: number;
    averageInvoiceValue: number;
  };
  charts: {
    status: Array<{
      status: AdminInvoiceStatus;
      count: number;
    }>;
    volume: Array<{
      date: string;
      issued: number;
      paid: number;
    }>;
  };
  invoices: AdminInvoice[];
}

export interface CreateAdminInvoiceInput {
  invoiceNumber?: string;
  status?: AdminInvoiceStatus;
  issuerName?: string;
  issuerEmail?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  partnerEnabled?: boolean;
  partnerLabel?: string;
  partnerName?: string;
  partnerEmail?: string;
  partnerCompany?: string;
  partnerLogoUrl?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  internalMemo?: string;
  terms?: string;
  logoUrl?: string;
  displayVariant?: AdminInvoiceDisplayVariant;
  logoSize?: number;
  fontSize?: number;
  tableItemCornerRadius?: number;
  discountAmount?: number;
  taxRate?: number;
  items?: Array<{
    id?: string;
    title: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    sortOrder?: number;
  }>;
}

export type UpdateAdminInvoiceInput = Partial<CreateAdminInvoiceInput>;

export interface ResendAdminInvoiceInput {
  subject?: string;
  contextNote?: string;
}

export interface ReviewAdminInvoiceInput {
  instruction?: string;
  tone?: 'professional' | 'neutral' | 'friendly';
  apply?: boolean;
}

export interface AdminInvoiceReviewResponse {
  snapshot: AdminInvoiceSnapshot;
  review: AdminInvoiceAiReview;
}

export type TeamDeliveryChannel = 'email' | 'whatsapp' | 'in_system';
export type TeamChannelStatus = 'sent' | 'queued' | 'failed' | 'skipped';

export interface AdminTeamDeliveryResult {
  channel: TeamDeliveryChannel;
  status: TeamChannelStatus;
  detail?: string;
}

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'ACCOUNTANT';
  isActive: boolean;
  createdAt: string;
  suspendedUntil: string | null;
  suspensionReason: string | null;
  lastProgressRequestedAt: string | null;
  lastProgressRequestedBy: string | null;
  lastProgressChannels: TeamDeliveryChannel[];
}

export interface AdminTeamSnapshot {
  generatedAt: string;
  metrics: {
    total: number;
    active: number;
    suspended: number;
    admins: number;
    superAdmins: number;
    progressRequestsToday: number;
  };
  members: AdminTeamMember[];
}

export interface AdminTeamProgressResponse {
  snapshot: AdminTeamSnapshot;
  delivery: AdminTeamDeliveryResult[];
}

export interface UpdateAdminTeamRoleInput {
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'ACCOUNTANT';
}

export interface UpdateAdminTeamStatusInput {
  action: 'suspend' | 'activate';
  durationDays?: number;
  reason?: string;
}

export interface RequestAdminTeamProgressInput {
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
  notifyInSystem?: boolean;
  note?: string;
  dueDate?: string;
}

export interface GlobalMessage {
  id: string;
  sender: "me" | "server" | "other";
  text: string;
  timestamp: string;
  senderName?: string;
  userId?: string;
}

export interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

export type ChatSession = {
  sessionId: string;
  name?: string;
  email?: string;
  lastSeenAt: string;
  connected: boolean;
  unseenCount?: number;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  from: "client" | "admin";
  text: string;
  timestamp: string;
  adminName?: string;
};

export type AdminNotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STARTED'
  | 'TASK_COMPLETED'
  | 'TASK_COMMENT'
  | 'TASK_PROGRESS_UPDATE'
  | 'BILLING_REMINDER'
  | 'TEAM_PROGRESS_REQUEST'
  | 'CHAT_MESSAGE'
  | 'DIRECT_MESSAGE'
  | 'SUPPORT_MESSAGE';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  userId: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    name: string;
    role?: string;
  };
  reactions?: ThreadMessageReaction[];
}

export interface ThreadMessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  reactedAt: string;
}

export interface ThreadTypingParticipant {
  userId: string;
  userName: string;
  at: string;
}

export interface AdminThread {
  id: string;
  updatedAt: string;
  otherUser?: {
    id: string;
    name: string;
    role?: string;
  };
  lastMessage: string | null;
  unread: boolean;
}

export interface AdminThreadSnapshot {
  threads: AdminThread[];
}

export type DirectThreadSnapshot = AdminWorkspaceSnapshot;
export type AdminMessage = ThreadMessage;

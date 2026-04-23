"use client";

import React from "react";
import {
  DashboardWorkspace,
  InvoiceWorkspace,
  MailWorkspace,
  ReportWorkspace,
  TeamWorkspace,
  AnalyticsWorkspace,
  TasksWorkspace,
  BillingsWorkspace,
  SettingsWorkspace,
  DirectWorkspace,
} from "@/modules/workspaces";

import { MessageInboxWorkspace } from "@/modules/workspaces/MessageInboxWorkspace";
import type { DashboardSection } from "@/lib/admin-constants";
import type { 
  AdminWorkspaceSnapshot, 
  AdminSystemSnapshot, 
  AdminTaskSnapshot, 
  AdminInvoiceSnapshot, 
  AdminInvoiceReviewResponse,
  AdminBillingSnapshot, 
  AdminSettingsSnapshot, 
  AdminEmailRuntimeSnapshot,
  UserProfile,
  AdminThreadSnapshot,
  DirectThreadSnapshot,
  AdminMessage,
  ThreadTypingParticipant,
  CreateAdminBillingInput,
  CreateAdminInvoiceInput,
  CreateAdminTaskInput,
  AdminTaskBinSnapshot,
  RequestAdminTeamProgressInput,
  ReviewAdminInvoiceInput,
  ResendAdminInvoiceInput,
  UpdateAdminBillingInput,
  UpdateAdminInvoiceInput,
  UpdateAdminTeamRoleInput,
  UpdateAdminTeamStatusInput,
  UpdateAdminTaskInput,
} from "@/lib/admin-types";

interface WorkspaceViewProps {
  activeSection: DashboardSection | string;
  messageSection: "inbox" | "direct" | null;
  workspaceSnapshot: AdminWorkspaceSnapshot | null;
  systemSnapshot: AdminSystemSnapshot | null;
  taskSnapshot: AdminTaskSnapshot | null;
  invoiceSnapshot: AdminInvoiceSnapshot | null;
  billingSnapshot: AdminBillingSnapshot | null;
  settingsSnapshot: AdminSettingsSnapshot | null;
  emailRuntimeSnapshot: AdminEmailRuntimeSnapshot | null;
  currentUser: UserProfile | null;
  
  isTasksConnected: boolean;
  isInvoiceLoading: boolean;
  invoiceError: string | null;
  activeInvoiceId: string | null;
  
  tasksError: string | null;
  billingError: string | null;
  settingsError: string | null;
  isSettingsSaving: boolean;
  activeBillingId: string | null;
  activeTeamMemberId: string | null;
  teamActionError: string | null;

  // Handlers
  createInvoice: (payload: CreateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>;
  getInvoiceBin: () => Promise<AdminInvoiceSnapshot>;
  updateInvoice: (invoiceId: string, payload: UpdateAdminInvoiceInput) => Promise<AdminInvoiceSnapshot>;
  deleteInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>;
  restoreInvoice: (invoiceId: string) => Promise<AdminInvoiceSnapshot>;
  resendInvoice: (
    invoiceId: string,
    payload?: ResendAdminInvoiceInput,
  ) => Promise<AdminInvoiceSnapshot>;
  reviewInvoice: (invoiceId: string, payload: ReviewAdminInvoiceInput) => Promise<AdminInvoiceReviewResponse>;
  createTask: (payload: CreateAdminTaskInput) => Promise<unknown>;
  updateTask: (taskId: string, payload: UpdateAdminTaskInput) => Promise<unknown>;
  deleteTask: (taskId: string) => Promise<unknown>;
  startTask: (taskId: string) => Promise<unknown>;
  addTaskComment: (taskId: string, body: string) => Promise<unknown>;
  addTaskChecklistItem: (taskId: string, label: string) => Promise<unknown>;
  toggleTaskChecklistItem: (taskId: string, itemId: string) => Promise<unknown>;
  getTaskBin: () => Promise<AdminTaskBinSnapshot>;
  restoreTask: (taskId: string) => Promise<unknown>;
  markTaskSeen: (taskId: string, commentId?: string) => Promise<unknown>;
  markTaskSeenRealtime: (taskId: string, commentId?: string) => void;
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
  sendTaskTyping: (taskId: string, typing: boolean) => void;
  taskTypingByTask: Record<string, { typing: boolean; userId: string; userName: string; at: string }>;
  taskPulseByTask: Record<string, number>;
  taskEventVersion: number;
  sendBillingReminder: (subscriptionId: string) => Promise<unknown>;
  createBilling: (payload: CreateAdminBillingInput) => Promise<unknown>;
  issueBillingInvoice: (subscriptionId: string) => Promise<unknown>;
  runBillingAutomationSweep: () => Promise<unknown>;
  updateBilling: (subscriptionId: string, payload: UpdateAdminBillingInput) => Promise<unknown>;
  saveSettings: (settings: AdminSettingsSnapshot) => Promise<void>;
  updateTeamRole: (memberId: string, payload: UpdateAdminTeamRoleInput) => Promise<unknown>;
  updateTeamStatus: (memberId: string, payload: UpdateAdminTeamStatusInput) => Promise<unknown>;
  requestTeamProgress: (memberId: string, payload: RequestAdminTeamProgressInput) => Promise<unknown>;
  handleLogout: () => void;

  // Messaging (Inbox/Direct)
  inboxSnapshot: AdminThreadSnapshot | null;
  isInboxLoading: boolean;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  threadMessages: AdminMessage[];
  setThreadMessages: (msgs: AdminMessage[]) => void;
  sendThreadMessage: (threadId: string, body: string) => void | Promise<unknown>;
  sendThreadTyping?: (threadId: string, typing: boolean) => void;
  toggleThreadReaction?: (threadId: string, messageId: string, emoji: string) => Promise<void> | void;
  markThreadRead: (threadId: string) => void | Promise<unknown>;
  threadTypingParticipants?: ThreadTypingParticipant[];
  
  directSnapshot: DirectThreadSnapshot | null;
  isDirectLoading: boolean;
  activeDirectId: string | null;
  setActiveDirectId: (id: string | null) => void;
  directMessages: AdminMessage[];
  sendDirectMessage: (receiverId: string, body: string) => Promise<unknown>;
  markDirectRead: (senderId: string) => Promise<unknown>;

  // UI state
  currentSection: { eyebrow: string; title: string; description: string };
  sectionSkeleton: React.ReactNode;
  sectionError: string | null;
}

export function WorkspaceView({
  activeSection,
  messageSection,
  workspaceSnapshot,
  systemSnapshot,
  taskSnapshot,
  invoiceSnapshot,
  billingSnapshot,
  settingsSnapshot,
  emailRuntimeSnapshot,
  currentUser,
  
  isTasksConnected,
  isInvoiceLoading,
  invoiceError,
  activeInvoiceId,
  
  tasksError,
  billingError,
  settingsError,
  isSettingsSaving,
  activeBillingId,
  activeTeamMemberId,
  teamActionError,

  createInvoice,
  getInvoiceBin,
  updateInvoice,
  deleteInvoice,
  restoreInvoice,
  resendInvoice,
  reviewInvoice,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  addTaskComment,
  addTaskChecklistItem,
  toggleTaskChecklistItem,
  getTaskBin,
  restoreTask,
  markTaskSeen,
  markTaskSeenRealtime,
  joinTaskRoom,
  leaveTaskRoom,
  sendTaskTyping,
  taskTypingByTask,
  taskPulseByTask,
  taskEventVersion,
  sendBillingReminder,
  createBilling,
  issueBillingInvoice,
  runBillingAutomationSweep,
  updateBilling,
  saveSettings,
  updateTeamRole,
  updateTeamStatus,
  requestTeamProgress,
  handleLogout,

  inboxSnapshot,
  isInboxLoading,
  activeThreadId,
  setActiveThreadId,
  threadMessages,
  setThreadMessages,
  sendThreadMessage,
  sendThreadTyping,
  toggleThreadReaction,
  markThreadRead,
  threadTypingParticipants,
  
  directSnapshot,
  isDirectLoading,
  activeDirectId,
  setActiveDirectId,
  directMessages,
  sendDirectMessage,
  markDirectRead,

  currentSection,
  sectionSkeleton,
  sectionError,
}: WorkspaceViewProps) {
  const showWorkspaceHeader = activeSection !== "mail";
  const contentContainerClassName = showWorkspaceHeader
    ? "min-h-0 flex-1 overflow-y-auto"
    : "min-h-0 flex-1 overflow-hidden";

  if (activeSection === "inbox") {
    if (messageSection === "direct") {
      return (
        <DirectWorkspace
          snapshot={directSnapshot}
          isLoading={isDirectLoading}
          activeDirectId={activeDirectId}
          setActiveDirectId={setActiveDirectId}
          messages={directMessages}
          sendMessage={sendDirectMessage}
          markRead={markDirectRead}
          currentUser={currentUser}
        />
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex-1 overflow-hidden">
          <MessageInboxWorkspace
            snapshot={inboxSnapshot}
            isLoading={isInboxLoading}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            messages={threadMessages}
            setThreadMessages={setThreadMessages}
            typingParticipants={threadTypingParticipants}
            sendThreadMessage={sendThreadMessage}
            sendThreadTyping={sendThreadTyping}
            toggleThreadReaction={
              activeThreadId && toggleThreadReaction
                ? (messageId, emoji) => toggleThreadReaction(activeThreadId, messageId, emoji)
                : undefined
            }
            markThreadRead={markThreadRead}
            currentUser={currentUser}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showWorkspaceHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-(--sq-brand-action)/72">
              {currentSection.eyebrow}
            </p>
            <h2 className="mt-1.5 text-[1.55rem] font-semibold tracking-[-0.04em] text-white">
              {currentSection.title}
            </h2>
            <p className="mt-1 max-w-3xl text-[13px] text-white/55">{currentSection.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2" />
        </div>
      ) : null}

      <div className={contentContainerClassName}>
        {sectionSkeleton ? (
          sectionSkeleton
        ) : (
          <>
            {sectionError ? (
              <div className="px-4 pt-4">
                <div className="rounded-[18px] border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-4 py-3 text-sm text-[#ffb49d]">
                  {sectionError}
                </div>
              </div>
            ) : null}

            <>
              {activeSection === "overview" || activeSection === "dashboard" ? (
                <DashboardWorkspace
                  data={workspaceSnapshot}
                  system={systemSnapshot}
                  currentUser={currentUser}
                  tasks={taskSnapshot}
                  isTasksConnected={isTasksConnected}
                />
              ) : null}
              {activeSection === "invoices" || activeSection === "invoice" ? (
                <InvoiceWorkspace
                  data={invoiceSnapshot}
                  system={systemSnapshot}
                  isLoading={isInvoiceLoading}
                  invoiceError={invoiceError}
                  activeInvoiceId={activeInvoiceId}
                  onCreateInvoice={createInvoice}
                  onGetInvoiceBin={getInvoiceBin}
                  onUpdateInvoice={updateInvoice}
                  onDeleteInvoice={deleteInvoice}
                  onRestoreInvoice={restoreInvoice}
                  onResendInvoice={resendInvoice}
                  onReviewInvoice={reviewInvoice}
                />
              ) : null}
              <div className={activeSection === "mail" ? "h-full" : "hidden h-full"}>
                <MailWorkspace
                  currentUser={currentUser}
                  isActive={activeSection === "mail"}
                />
              </div>
              {activeSection === "support" || activeSection === "report" ? (
                <ReportWorkspace
                  data={workspaceSnapshot}
                  onCreateTaskFromReport={createTask}
                />
              ) : null}
              {activeSection === "team" ? (
                <TeamWorkspace
                  data={workspaceSnapshot}
                  onCreateTaskForMember={createTask}
                  onPromoteMember={(memberId, nextRole) =>
                    updateTeamRole(memberId, { role: nextRole })
                  }
                  onUpdateMemberStatus={updateTeamStatus}
                  onRequestProgress={(memberId) =>
                    requestTeamProgress(memberId, {})
                  }
                  activeMemberId={activeTeamMemberId}
                  actionError={teamActionError}
                />
              ) : null}
              {activeSection === "analytics" ? (
                <AnalyticsWorkspace
                  data={workspaceSnapshot}
                  system={systemSnapshot}
                  tasks={taskSnapshot}
                />
              ) : null}
              {activeSection === "tasks" ? (
                <TasksWorkspace
                  data={workspaceSnapshot}
                  tasks={taskSnapshot}
                  currentUser={currentUser}
                  taskError={tasksError}
                  isRealtimeConnected={isTasksConnected}
                  onCreateTask={createTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onStartTask={startTask}
                  onAddComment={addTaskComment}
                  onAddChecklistItem={addTaskChecklistItem}
                  onToggleChecklistItem={toggleTaskChecklistItem}
                  onLoadTaskBin={getTaskBin}
                  onRestoreTask={restoreTask}
                  onMarkTaskSeen={markTaskSeen}
                  onMarkTaskSeenRealtime={markTaskSeenRealtime}
                  onJoinTaskRoom={joinTaskRoom}
                  onLeaveTaskRoom={leaveTaskRoom}
                  onTaskTyping={sendTaskTyping}
                  taskTypingByTask={taskTypingByTask}
                  taskPulseByTask={taskPulseByTask}
                  taskEventVersion={taskEventVersion}
                />
              ) : null}
              {activeSection === "billings" ? (
                <BillingsWorkspace
                  canView={currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ACCOUNTANT"}
                  data={billingSnapshot}
                  billingError={billingError}
                  activeBillingId={activeBillingId}
                  onSendReminder={sendBillingReminder}
                  onCreateSubscription={createBilling}
                  onIssueInvoice={issueBillingInvoice}
                  onRunAutomationSweep={runBillingAutomationSweep}
                  onUpdateSubscription={updateBilling}
                />
              ) : null}
              {activeSection === "settings" ? (
                <SettingsWorkspace
                  settings={settingsSnapshot}
                  emailRuntime={emailRuntimeSnapshot}
                  system={systemSnapshot}
                  isSaving={isSettingsSaving}
                  saveError={settingsError}
                  onSave={saveSettings}
                  onLogout={handleLogout}
                />
              ) : null}
            </>
          </>
        )}
      </div>
    </div>
  );
}

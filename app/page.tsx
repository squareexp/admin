"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AdminContextMenu } from "@/components/dashboard/AdminContextMenu";
import { DashboardSectionHeader } from "@/components/dashboard/DashboardSectionHeader";
import { GlobalSnapshotLoader } from "@/components/dashboard/GlobalSnapshotLoader";
import { WorkspaceView } from "@/components/dashboard/WorkspaceView";
import { WorkspaceSkeleton } from "@/components/dashboard/WorkspaceSkeleton";

import { useAdminAuth } from "@/hooks/dashboard/useAdminAuth";
import { useAdminStore } from "@/hooks/dashboard/useAdminStore";
import { useAdminSockets } from "@/hooks/dashboard/useAdminSockets";
import { useAdminActions } from "@/hooks/dashboard/useAdminActions";
import { SECTION_META } from "@/const/admin-sections";
import type { AdminSection, MessageSection } from "@/lib/admin-types";
import { GlobalChat } from "@/modules/GlobalChat/GlobalChat";
import { SupportChat } from "@/modules/SupportChat/SupportChat";
import { MessageInboxWorkspace } from "@/modules/workspaces";
import { Sidebar } from "@/modules/Sidebar";

export default function AdminDashboard() {
  const { 
    currentUser, 
    handleLogout, 
    isUnauthorized,
    flagUnauthorized,
  } = useAdminAuth();

  const {
    workspaceSnapshot, workspaceError, isWorkspaceLoading, loadWorkspace,
    systemSnapshot,
    taskSnapshot, setTaskSnapshot, tasksError, setTasksError, isTasksLoading, loadTasks,
    settingsSnapshot, setSettingsSnapshot, settingsError, setSettingsError, isSettingsLoading, loadSettings,
    emailRuntimeSnapshot,
    setEmailRuntimeSnapshot,
    billingSnapshot, setBillingSnapshot, billingError, setBillingError, isBillingLoading,
    invoiceSnapshot, setInvoiceSnapshot, invoiceError, setInvoiceError, isInvoiceLoading,
    canViewBillings,
    addNotification,
    refreshWorkspaceSnapshot,
  } = useAdminStore(currentUser, flagUnauthorized);

  const addLog = useCallback(
    (
      _type: "info" | "success" | "warning" | "error",
      _message: string,
    ) => {
      void _type;
      void _message;
    },
    [],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [supportInputValue, setSupportInputValue] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeDirectId, setActiveDirectId] = useState<string | null>(null);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionIdRef = useRef<string | null>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    createInvoice, getInvoiceBin, updateInvoice, deleteInvoice, restoreInvoice, resendInvoice, reviewInvoice,
    createTask: createTaskHttp,
    updateTask: updateTaskHttp,
    deleteTask: deleteTaskHttp,
    startTask: startTaskHttp,
    addTaskComment: addTaskCommentHttp,
    addTaskChecklistItem: addTaskChecklistItemHttp,
    toggleTaskChecklistItem: toggleTaskChecklistItemHttp,
    getTaskBin,
    restoreTask: restoreTaskHttp,
    markTaskSeen,
    createBilling,
    sendBillingReminder,
    issueBillingInvoice,
    runBillingAutomationSweep,
    updateBilling,
    saveSettings,
    updateTeamRole, updateTeamStatus, requestTeamProgress,
    teamActionError,
    activeInvoiceId, activeBillingId, activeTeamMemberId,
    isSettingsSaving,
  } = useAdminActions({
    flagUnauthorized,
    setTaskSnapshot,
    setTasksError,
    refreshWorkspaceSnapshot,
    addLog,
    setSettingsSnapshot,
    setSettingsError,
    setEmailRuntimeSnapshot,
    setBillingSnapshot,
    setBillingError,
    setInvoiceSnapshot,
    setInvoiceError,
  });

  const {
    isConnected: isChatConnected,
    transport,
    messages: chatMessages,
    sendGlobalMessage,
    notifySupportTyping,
    isSupportConnected,
    sessions,
    supportMessages,
    sendSupportMessage,
    requestSupportDetails,
    viewSupportSession,
    typingUsers,
    unansweredCount,
    isTasksConnected,
    taskTypingByTask,
    taskPulseByTask,
    taskEventVersion,
    createTask: createTaskRealtime,
    updateTask: updateTaskRealtime,
    deleteTask: deleteTaskRealtime,
    startTask: startTaskRealtime,
    addTaskComment: addTaskCommentRealtime,
    addTaskChecklistItem: addTaskChecklistItemRealtime,
    toggleTaskChecklistItem: toggleTaskChecklistItemRealtime,
    restoreTask: restoreTaskRealtime,
    joinTaskRoom,
    leaveTaskRoom,
    sendTaskTyping,
    markTaskSeen: markTaskSeenRealtime,
    threads: inboxSnapshotThreads,
    setThreads: setInboxSnapshotThreads,
    threadMessages,
    setThreadMessages,
    threadTypingByThread,
    sendThreadMessage,
    sendThreadTyping,
    toggleThreadReaction,
    markThreadRead,
  } = useAdminSockets({
    currentUser,
    adminName: currentUser?.username || "Admin",
    settingsSnapshot,
    setTaskSnapshot,
    setTasksError,
    addLog,
    addNotification,
    taskHttpActions: {
      createTask: createTaskHttp,
      updateTask: updateTaskHttp,
      deleteTask: deleteTaskHttp,
      startTask: startTaskHttp,
      addTaskComment: addTaskCommentHttp,
      addTaskChecklistItem: addTaskChecklistItemHttp,
      toggleTaskChecklistItem: toggleTaskChecklistItemHttp,
      restoreTask: restoreTaskHttp,
    },
  });

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [messageSection, setMessageSection] = useState<MessageSection>("team");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const activeDirectThread =
    activeDirectId
      ? inboxSnapshotThreads.find((thread) => thread.otherUser?.id === activeDirectId) || null
      : null;
  const activeDirectThreadId = activeDirectThread?.id || null;

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    void viewSupportSession(activeSessionId, prevSessionIdRef.current);
    prevSessionIdRef.current = activeSessionId;
  }, [activeSessionId, viewSupportSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSessionId, supportMessages]);

  useEffect(() => {
    if (!activeDirectThreadId) return;
    const existingMessages = threadMessages[activeDirectThreadId] || [];
    void markThreadRead(activeDirectThreadId);
    if (existingMessages.length > 0) {
      return;
    }

    fetch(`/api/admin/threads/${activeDirectThreadId}/messages`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setThreadMessages((prev) => ({
          ...prev,
          [activeDirectThreadId]: data,
        }));
      })
      .catch(() => undefined);
  }, [activeDirectThreadId, markThreadRead, setThreadMessages, threadMessages]);

  if (isUnauthorized) return null;

  const currentSection = SECTION_META[activeSection];
  const mailGatewayStatus = systemSnapshot?.mailGateway;
  const mailGatewayIssues = (mailGatewayStatus?.issues || []).filter(Boolean).slice(0, 2);
  const showMailGatewayWarning =
    Boolean(mailGatewayStatus) && mailGatewayStatus?.ok === false;
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      session.name?.toLowerCase().includes(q) ||
      session.email?.toLowerCase().includes(q) ||
      session.sessionId.toLowerCase().includes(q)
    );
  });
  const activeSession = sessions.find((session) => session.sessionId === activeSessionId);
  const currentSupportMessages = activeSessionId ? supportMessages[activeSessionId] || [] : [];

  const getSectionError = (section: AdminSection) => {
    if (section === "dashboard" && !workspaceSnapshot) return workspaceError;
    if (section === "tasks" && !taskSnapshot) return tasksError;
    if (section === "invoice" && !invoiceSnapshot) return invoiceError;
    if (section === "billings" && canViewBillings && !billingSnapshot) return billingError;
    if (section === "settings" && !settingsSnapshot) return settingsError;
    return null;
  };

  const getSectionSkeleton = (section: AdminSection) => {
    if (section === "dashboard" && isWorkspaceLoading && !workspaceSnapshot) return <WorkspaceSkeleton variant="dashboard" />;
    if (section === "invoice" && isInvoiceLoading && !invoiceSnapshot) return <WorkspaceSkeleton variant="invoice" />;
    if (section === "tasks" && isTasksLoading && !taskSnapshot) return <WorkspaceSkeleton variant="tasks" />;
    if (section === "billings" && canViewBillings && isBillingLoading && !billingSnapshot) return <WorkspaceSkeleton variant="billings" />;
    if (section === "settings" && isSettingsLoading && !settingsSnapshot) return <WorkspaceSkeleton variant="settings" />;
    return null;
  };

  const handleSendTeamMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    sendGlobalMessage(inputValue.trim());
    setInputValue("");
  };

  const handleSupportInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSupportInputValue(event.target.value);
    if (!activeSessionId) return;
    notifySupportTyping(activeSessionId, true);
    if (adminTypingTimeoutRef.current) {
      clearTimeout(adminTypingTimeoutRef.current);
    }
    adminTypingTimeoutRef.current = setTimeout(() => {
      notifySupportTyping(activeSessionId, false);
    }, 1500);
  };

  const handleSendSupportMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeSessionId || !supportInputValue.trim()) return;
    sendSupportMessage(activeSessionId, supportInputValue.trim());
    setSupportInputValue("");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-sq-brand-black text-gray-100">
      <div className="relative flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(205,255,4,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(87,199,255,0.08),transparent_26%),linear-gradient(180deg,#05070D_0%,#090B12_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[72px_72px]" />

        <div className="relative z-10 flex w-full gap-2.5 p-2.5">
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            messageSection={messageSection}
            setMessageSection={setMessageSection}
            unansweredCount={unansweredCount}
            canViewBillings={canViewBillings}
          />

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,14,20,0.94),rgba(9,11,17,0.92))] shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            {showMailGatewayWarning ? (
              <div className="mx-3 mt-3 rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-100">
                <p className="font-semibold uppercase tracking-[0.14em] text-amber-200">
                  Mail Security Alert
                </p>
                <p className="mt-1 text-amber-100/90">
                  Rust mail gateway security checks are degraded{mailGatewayStatus?.error ? `: ${mailGatewayStatus.error}` : "."}
                </p>
                {mailGatewayIssues.length ? (
                  <p className="mt-1 text-amber-100/80">
                    {mailGatewayIssues.join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : null}
            {activeSection === "messages" ? (
              <div className="flex h-full min-h-0 flex-col">
                <DashboardSectionHeader
                  eyebrow={SECTION_META.messages.eyebrow}
                  title={SECTION_META.messages.title}
                  description={SECTION_META.messages.description}
                >
                  {[
                    { key: "team" as const, label: "Team chat" },
                    { key: "support" as const, label: `Support${unansweredCount ? ` · ${unansweredCount}` : ""}` },
                    { key: "inbox" as const, label: "Private inbox" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setMessageSection(item.key)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        messageSection === item.key
                          ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] text-sq-brand-action"
                          : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </DashboardSectionHeader>

                <div className="min-h-0 flex-1">
                  {messageSection === "team" ? (
                    <GlobalChat
                      isConnected={isChatConnected}
                      transport={transport}
                      messages={chatMessages}
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      showEmojiPicker={showEmojiPicker}
                      setShowEmojiPicker={setShowEmojiPicker}
                      isMembersPanelOpen={isMembersPanelOpen}
                      setIsMembersPanelOpen={setIsMembersPanelOpen}
                      isMobile={isMobile}
                      currentUser={currentUser}
                      messagesEndRef={messagesEndRef}
                      handleSendMessage={handleSendTeamMessage}
                    />
                  ) : messageSection === "support" ? (
                    <SupportChat
                      isSupportConnected={isSupportConnected}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filteredSessions={filteredSessions}
                      activeSessionId={activeSessionId}
                      setActiveSessionId={setActiveSessionId}
                      supportMessages={supportMessages}
                      activeSession={activeSession}
                      currentSupportMessages={currentSupportMessages}
                      isClientTyping={activeSessionId ? !!typingUsers[activeSessionId] : false}
                      supportInputValue={supportInputValue}
                      setSupportInputValue={setSupportInputValue}
                      handleSupportInputChange={handleSupportInputChange}
                      showEmojiPicker={showEmojiPicker}
                      setShowEmojiPicker={setShowEmojiPicker}
                      handleSendSupportMessage={handleSendSupportMessage}
                      handleRequestDetails={() => {
                        if (activeSessionId) requestSupportDetails(activeSessionId);
                      }}
                      supportMessagesEndRef={supportMessagesEndRef}
                    />
                  ) : (
                    <MessageInboxWorkspace
                      snapshot={{ threads: inboxSnapshotThreads }}
                      isLoading={!inboxSnapshotThreads}
                      currentUser={currentUser}
                      activeThreadId={activeThreadId}
                      setActiveThreadId={setActiveThreadId}
                      messages={activeThreadId ? threadMessages[activeThreadId] || [] : []}
                      setThreadMessages={(msgs) => {
                        if (!activeThreadId) return;
                        setThreadMessages((prev) => ({ ...prev, [activeThreadId]: msgs }));
                      }}
                      typingParticipants={activeThreadId ? threadTypingByThread[activeThreadId] || [] : []}
                      sendThreadMessage={sendThreadMessage}
                      sendThreadTyping={sendThreadTyping}
                      toggleThreadReaction={(messageId, emoji) => {
                        if (!activeThreadId) return;
                        return toggleThreadReaction(activeThreadId, messageId, emoji);
                      }}
                      markThreadRead={markThreadRead}
                    />
                  )}
                </div>
              </div>
            ) : (
              <WorkspaceView
                activeSection={activeSection}
                messageSection={null}
                workspaceSnapshot={workspaceSnapshot}
                systemSnapshot={systemSnapshot}
                taskSnapshot={taskSnapshot}
                invoiceSnapshot={invoiceSnapshot}
                billingSnapshot={billingSnapshot}
                settingsSnapshot={settingsSnapshot}
                emailRuntimeSnapshot={emailRuntimeSnapshot}
                currentUser={currentUser}
                isTasksConnected={isTasksConnected}
                isInvoiceLoading={isInvoiceLoading}
                invoiceError={invoiceError}
                activeInvoiceId={activeInvoiceId}
                tasksError={tasksError}
                billingError={billingError}
                settingsError={settingsError}
                isSettingsSaving={isSettingsSaving}
                activeBillingId={activeBillingId}
                activeTeamMemberId={activeTeamMemberId}
                teamActionError={teamActionError}
                createInvoice={createInvoice}
                getInvoiceBin={getInvoiceBin}
                updateInvoice={updateInvoice}
                deleteInvoice={deleteInvoice}
                restoreInvoice={restoreInvoice}
                resendInvoice={resendInvoice}
                reviewInvoice={reviewInvoice}
                createTask={createTaskRealtime}
                updateTask={updateTaskRealtime}
                deleteTask={deleteTaskRealtime}
                startTask={startTaskRealtime}
                addTaskComment={addTaskCommentRealtime}
                addTaskChecklistItem={addTaskChecklistItemRealtime}
                toggleTaskChecklistItem={toggleTaskChecklistItemRealtime}
                getTaskBin={getTaskBin}
                restoreTask={restoreTaskRealtime}
                markTaskSeen={markTaskSeen}
                markTaskSeenRealtime={markTaskSeenRealtime}
                joinTaskRoom={joinTaskRoom}
                leaveTaskRoom={leaveTaskRoom}
                sendTaskTyping={sendTaskTyping}
                taskTypingByTask={taskTypingByTask}
                taskPulseByTask={taskPulseByTask}
                taskEventVersion={taskEventVersion}
                sendBillingReminder={sendBillingReminder}
                createBilling={createBilling}
                issueBillingInvoice={issueBillingInvoice}
                runBillingAutomationSweep={runBillingAutomationSweep}
                updateBilling={updateBilling}
                saveSettings={saveSettings}
                updateTeamRole={updateTeamRole}
                updateTeamStatus={updateTeamStatus}
                requestTeamProgress={requestTeamProgress}
                handleLogout={handleLogout}
                inboxSnapshot={{ threads: inboxSnapshotThreads }}
                isInboxLoading={!inboxSnapshotThreads}
                activeThreadId={activeThreadId}
                setActiveThreadId={setActiveThreadId}
                threadMessages={activeThreadId ? (threadMessages[activeThreadId] || []) : []}
                setThreadMessages={(msgs) => {
                  if (!activeThreadId) return;
                  setThreadMessages((prev) => ({
                    ...prev,
                    [activeThreadId]: msgs,
                  }));
                }}
                sendThreadMessage={sendThreadMessage}
                markThreadRead={markThreadRead}
                directSnapshot={workspaceSnapshot}
                isDirectLoading={isWorkspaceLoading}
                activeDirectId={activeDirectId}
                setActiveDirectId={setActiveDirectId}
                directMessages={activeDirectThreadId ? (threadMessages[activeDirectThreadId] || []) : []}
                sendDirectMessage={async (receiverId, body) => {
                  let thread = inboxSnapshotThreads.find((item) => item.otherUser?.id === receiverId) || null;
                  if (!thread) {
                    const response = await fetch("/api/admin/threads/direct", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: receiverId }),
                    });
                    if (!response.ok) {
                      throw new Error("Failed to create direct thread");
                    }

                    const createdThread = await response.json();
                    const teammate = workspaceSnapshot?.team?.find((member) => member.id === receiverId);
                    thread = {
                      id: createdThread.id,
                      updatedAt: new Date().toISOString(),
                      otherUser: teammate
                        ? {
                            id: teammate.id,
                            name: teammate.name,
                            role: teammate.role,
                          }
                        : undefined,
                      lastMessage: null,
                      unread: false,
                    };
                    setInboxSnapshotThreads((prev) => {
                      if (prev.some((item) => item.id === thread?.id)) {
                        return prev;
                      }
                      return [thread!, ...prev];
                    });
                  }

                  await sendThreadMessage(thread.id, body);
                }}
                markDirectRead={async (senderId) => {
                  const thread = inboxSnapshotThreads.find(t => t.otherUser?.id === senderId);
                  if (thread) await markThreadRead(thread.id);
                }}
                currentSection={currentSection}
                sectionSkeleton={getSectionSkeleton(activeSection)}
                sectionError={getSectionError(activeSection)}
              />
            )}
          </main>
        </div>

        <AdminContextMenu
          activeSection={activeSection}
          onNavigate={(section) => setActiveSection(section)}
          onLogout={() => {
            void handleLogout();
          }}
          onRefresh={() => {
            void loadWorkspace();
            void loadTasks();
            void loadSettings();
          }}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          canViewBillings={canViewBillings}
        />

        <div className="fixed bottom-6 right-8 z-50">
          <GlobalSnapshotLoader isLoading={isWorkspaceLoading || isTasksLoading || isSettingsLoading} />
        </div>
      </div>
    </div>
  );
}

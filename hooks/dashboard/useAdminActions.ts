"use client";

import { useState } from "react";
import type {
  AdminBillingSnapshot,
  AdminEmailRuntimeSnapshot,
  AdminInvoiceReviewResponse,
  AdminInvoiceSnapshot,
  CreateAdminBillingInput,
  ResendAdminInvoiceInput,
  AdminSettingsSnapshot,
  AdminTeamProgressResponse,
  AdminTaskBinSnapshot,
  AdminTaskSnapshot,
  CreateAdminTaskInput,
  CreateAdminInvoiceInput,
  RequestAdminTeamProgressInput,
  ReviewAdminInvoiceInput,
  UpdateAdminBillingInput,
  UpdateAdminInvoiceInput,
  UpdateAdminTaskInput,
  UpdateAdminTeamRoleInput,
  UpdateAdminTeamStatusInput,
} from "@/lib/admin-types";

export function useAdminActions({
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
}: {
  flagUnauthorized: () => void;
  setTaskSnapshot: (snap: AdminTaskSnapshot) => void;
  setTasksError: (err: string | null) => void;
  refreshWorkspaceSnapshot: () => Promise<unknown>;
  addLog: (type: "info" | "success" | "warning" | "error", msg: string) => void;
  setSettingsSnapshot: (snap: AdminSettingsSnapshot) => void;
  setSettingsError: (err: string | null) => void;
  setEmailRuntimeSnapshot: (snap: AdminEmailRuntimeSnapshot) => void;
  setBillingSnapshot: (snap: AdminBillingSnapshot) => void;
  setBillingError: (err: string | null) => void;
  setInvoiceSnapshot: (snap: AdminInvoiceSnapshot) => void;
  setInvoiceError: (err: string | null) => void;
}) {
  const [activeBillingId, setActiveBillingId] = useState<string | null>(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const [activeTeamMemberId, setActiveTeamMemberId] = useState<string | null>(null);
  const [teamActionError, setTeamActionError] = useState<string | null>(null);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  const createTask = async (payload: CreateAdminTaskInput) => {
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      const errorData = await res.json().catch(() => ({ error: "Failed to create task" }));
      const message = typeof errorData?.error === "string" ? errorData.error : "Failed to create task";
      setTasksError(message);
      throw new Error(message);
    }

    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    setTasksError(null);
    return snapshot;
  };

  const updateTask = async (taskId: string, payload: UpdateAdminTaskInput) => {
    const res = await fetch(`/api/admin/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      const errorData = await res.json().catch(() => ({ error: "Failed to update task" }));
      const message = typeof errorData?.error === "string" ? errorData.error : "Failed to update task";
      setTasksError(message);
      throw new Error(message);
    }

    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    setTasksError(null);
    return snapshot;
  };

  const deleteTask = async (taskId: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      throw new Error("Failed to delete task");
    }
    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    setTasksError(null);
    return snapshot;
  };

  const startTask = async (taskId: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/start`, { method: "POST" });
    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      throw new Error("Failed to start task");
    }
    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    setTasksError(null);
    return snapshot;
  };

  const addTaskComment = async (taskId: string, body: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) { if (res.status === 401) flagUnauthorized(); throw new Error("Failed to add comment"); }
    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    return snapshot;
  };

  const addTaskChecklistItem = async (taskId: string, label: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) { if (res.status === 401) flagUnauthorized(); throw new Error("Failed to add checklist item"); }
    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    return snapshot;
  };

  const toggleTaskChecklistItem = async (taskId: string, itemId: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/checklist/${itemId}`, { method: "PATCH" });
    if (!res.ok) { if (res.status === 401) flagUnauthorized(); throw new Error("Failed to toggle item"); }
    const snapshot = await res.json() as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    return snapshot;
  };

  const getTaskBin = async () => {
    const res = await fetch('/api/admin/tasks/bin', { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      throw new Error('Failed to load task bin');
    }
    return (await res.json()) as AdminTaskBinSnapshot;
  };

  const restoreTask = async (taskId: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/restore`, { method: 'POST' });
    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      const errorData = await res.json().catch(() => ({ error: 'Failed to restore task' }));
      throw new Error(typeof errorData.error === 'string' ? errorData.error : 'Failed to restore task');
    }
    const snapshot = (await res.json()) as AdminTaskSnapshot;
    setTaskSnapshot(snapshot);
    setTasksError(null);
    return snapshot;
  };

  const markTaskSeen = async (taskId: string, commentId?: string) => {
    const res = await fetch(`/api/admin/tasks/${taskId}/seen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentId ? { commentId } : {}),
    });

    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      throw new Error('Failed to mark task as seen');
    }

    return res.json();
  };

  const updateTeamRole = async (userId: string, payload: UpdateAdminTeamRoleInput) => {
    setActiveTeamMemberId(userId);
    setTeamActionError(null);
    try {
      const res = await fetch(`/api/admin/team/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to update role" }));
        setTeamActionError(errorData.error);
        throw new Error(errorData.error);
      }
      await refreshWorkspaceSnapshot();
      addLog("success", `Updated team role to ${payload.role}`);
    } finally { setActiveTeamMemberId(null); }
  };

  const updateTeamStatus = async (userId: string, payload: UpdateAdminTeamStatusInput) => {
    setActiveTeamMemberId(userId);
    setTeamActionError(null);
    try {
      const res = await fetch(`/api/admin/team/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to update status" }));
        setTeamActionError(errorData.error);
        throw new Error(errorData.error);
      }
      await refreshWorkspaceSnapshot();
      addLog("success", payload.action === "suspend" ? "Team member suspended" : "Team member activated");
    } finally { setActiveTeamMemberId(null); }
  };

  const requestTeamProgress = async (userId: string, payload: RequestAdminTeamProgressInput) => {
    setActiveTeamMemberId(userId);
    setTeamActionError(null);
    try {
      const res = await fetch(`/api/admin/team/${userId}/request-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to request progress" }));
        setTeamActionError(errorData.error);
        throw new Error(errorData.error);
      }
      const data = await res.json() as AdminTeamProgressResponse;
      const delivered = data.delivery.filter(i => i.status === "sent" || i.status === "queued").length;
      addLog("success", `Progress request dispatched via ${delivered} channel(s)`);
      await refreshWorkspaceSnapshot();
      return data;
    } finally { setActiveTeamMemberId(null); }
  };

  const saveSettings = async (payload: AdminSettingsSnapshot) => {
    setIsSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to update settings" }));
        setSettingsError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminSettingsSnapshot;
      setSettingsSnapshot(snapshot);
      setSettingsError(null);

      const runtimeRes = await fetch("/api/admin/settings/email-runtime", { cache: "no-store" });
      if (runtimeRes.ok) setEmailRuntimeSnapshot(await runtimeRes.json());
    } finally { setIsSettingsSaving(false); }
  };

  const updateBilling = async (subscriptionId: string, payload: UpdateAdminBillingInput) => {
    setActiveBillingId(subscriptionId);
    try {
      const res = await fetch(`/api/admin/billings/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to update billing item" }));
        setBillingError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminBillingSnapshot;
      setBillingSnapshot(snapshot);
      setBillingError(null);
      return snapshot;
    } finally { setActiveBillingId(null); }
  };

  const createBilling = async (payload: CreateAdminBillingInput) => {
    setActiveBillingId("new");
    try {
      const res = await fetch("/api/admin/billings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to create billing record" }));
        setBillingError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminBillingSnapshot;
      setBillingSnapshot(snapshot);
      setBillingError(null);
      return snapshot;
    } finally { setActiveBillingId(null); }
  };

  const sendBillingReminder = async (subscriptionId: string) => {
    setActiveBillingId(subscriptionId);
    try {
      const res = await fetch(`/api/admin/billings/${subscriptionId}/remind`, { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to send reminder" }));
        setBillingError(errorData.error);
        throw new Error(errorData.error);
      }
      setBillingSnapshot(await res.json());
      setBillingError(null);
    } finally { setActiveBillingId(null); }
  };

  const issueBillingInvoice = async (subscriptionId: string) => {
    setActiveBillingId(subscriptionId);
    try {
      const res = await fetch(`/api/admin/billings/${subscriptionId}/issue-invoice`, {
        method: "POST",
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to issue invoice" }));
        setBillingError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminBillingSnapshot;
      setBillingSnapshot(snapshot);
      setBillingError(null);
      return snapshot;
    } finally { setActiveBillingId(null); }
  };

  const runBillingAutomationSweep = async () => {
    setActiveBillingId("automation");
    try {
      const res = await fetch("/api/admin/billings/automation/sweep", {
        method: "POST",
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to run billing automation" }));
        setBillingError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminBillingSnapshot;
      setBillingSnapshot(snapshot);
      setBillingError(null);
      return snapshot;
    } finally { setActiveBillingId(null); }
  };

  const createInvoice = async (payload: CreateAdminInvoiceInput) => {
    setActiveInvoiceId("new");
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to create invoice" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(snapshot);
      setInvoiceError(null);
      return snapshot;
    } finally { setActiveInvoiceId(null); }
  };

  const getInvoiceBin = async () => {
    const res = await fetch("/api/admin/invoices/bin", { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 401) flagUnauthorized();
      const errorData = await res.json().catch(() => ({ error: "Failed to load invoice bin" }));
      throw new Error(typeof errorData?.error === "string" ? errorData.error : "Failed to load invoice bin");
    }

    return (await res.json()) as AdminInvoiceSnapshot;
  };

  const updateInvoice = async (invoiceId: string, payload: UpdateAdminInvoiceInput) => {
    setActiveInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to update invoice" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(snapshot);
      setInvoiceError(null);
      return snapshot;
    } finally { setActiveInvoiceId(null); }
  };

  const deleteInvoice = async (invoiceId: string) => {
    setActiveInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, { method: "DELETE" });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to move invoice to bin" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(snapshot);
      setInvoiceError(null);
      return snapshot;
    } finally { setActiveInvoiceId(null); }
  };

  const restoreInvoice = async (invoiceId: string) => {
    setActiveInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/restore`, { method: "POST" });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to restore invoice" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(snapshot);
      setInvoiceError(null);
      return snapshot;
    } finally { setActiveInvoiceId(null); }
  };

  const resendInvoice = async (
    invoiceId: string,
    payload?: ResendAdminInvoiceInput,
  ) => {
    setActiveInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to resend invoice" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const snapshot = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(snapshot);
      setInvoiceError(null);
      return snapshot;
    } finally { setActiveInvoiceId(null); }
  };

  const reviewInvoice = async (invoiceId: string, payload: ReviewAdminInvoiceInput) => {
    setActiveInvoiceId(invoiceId);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) flagUnauthorized();
        const errorData = await res.json().catch(() => ({ error: "Failed to review invoice" }));
        setInvoiceError(errorData.error);
        throw new Error(errorData.error);
      }
      const result = await res.json() as AdminInvoiceReviewResponse;
      setInvoiceSnapshot(result.snapshot);
      setInvoiceError(null);
      return result;
    } finally { setActiveInvoiceId(null); }
  };

  return {
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
    updateTeamRole, updateTeamStatus, requestTeamProgress, activeTeamMemberId, teamActionError,
    saveSettings, isSettingsSaving,
    updateBilling, createBilling, sendBillingReminder, issueBillingInvoice, runBillingAutomationSweep, activeBillingId,
    createInvoice, getInvoiceBin, updateInvoice, deleteInvoice, restoreInvoice, resendInvoice, reviewInvoice, activeInvoiceId,
  };
}

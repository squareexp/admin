"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminBillingSnapshot,
  AdminEmailRuntimeSnapshot,
  AdminInvoiceSnapshot,
  AdminNotification,
  AdminSettingsSnapshot,
  AdminSystemSnapshot,
  AdminTaskSnapshot,
  AdminWorkspaceSnapshot,
  UserProfile,
} from "@/lib/admin-types";

const DASHBOARD_POLL_MS = 180_000;
const NON_REALTIME_POLL_MS = 300_000;

const isPageVisible = () =>
  typeof document === "undefined" || document.visibilityState === "visible";

async function proxyFetch(url: string): Promise<Response> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res;
  } catch (error) {
    // Network error (backend down) - return synthetic 503
    return new Response(
      JSON.stringify({ error: "Backend server is not running", code: "BACKEND_DOWN" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

export function useAdminStore(currentUser: UserProfile | null, flagUnauthorized: () => void) {
  const [workspaceSnapshot, setWorkspaceSnapshot] = useState<AdminWorkspaceSnapshot | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);

  const [systemSnapshot, setSystemSnapshot] = useState<AdminSystemSnapshot | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [isSystemLoading, setIsSystemLoading] = useState(true);

  const [taskSnapshot, setTaskSnapshot] = useState<AdminTaskSnapshot | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [isTasksLoading, setIsTasksLoading] = useState(true);

  const [settingsSnapshot, setSettingsSnapshot] = useState<AdminSettingsSnapshot | null>(null);
  const [emailRuntimeSnapshot, setEmailRuntimeSnapshot] = useState<AdminEmailRuntimeSnapshot | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  const [billingSnapshot, setBillingSnapshot] = useState<AdminBillingSnapshot | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(true);

  const [invoiceSnapshot, setInvoiceSnapshot] = useState<AdminInvoiceSnapshot | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(true);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isBackendDown, setIsBackendDown] = useState(false);

  const resolvedCurrentRole =
    workspaceSnapshot?.team.find((member) => {
      if (!currentUser) return false;
      return (
        member.id === currentUser.id ||
        member.email.toLowerCase() === currentUser.email.toLowerCase()
      );
    })?.role || currentUser?.role;

  const canViewBillings =
    resolvedCurrentRole === "SUPER_ADMIN" || resolvedCurrentRole === "ACCOUNTANT";

  const refreshWorkspaceSnapshot = useCallback(async () => {
    const response = await proxyFetch("/api/admin/workspace");
    if (response.status === 401) {
      flagUnauthorized();
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      throw new Error(`Workspace request failed with ${response.status}`);
    }

    const snapshot = (await response.json()) as AdminWorkspaceSnapshot;
    setWorkspaceSnapshot(snapshot);
    setWorkspaceError(null);
    return snapshot;
  }, [flagUnauthorized]);

  const loadData = useCallback(async ({ isBackground = false }: { isBackground?: boolean } = {}) => {
    if (!isBackground) {
      setIsWorkspaceLoading(true);
      setIsSystemLoading(true);
    }

    const [workspaceResult, systemResult] = await Promise.allSettled([
      fetch("/api/admin/workspace").then((res) => {
        if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
        if (res.status === 503) { throw new Error("Backend server is not running"); }
        if (!res.ok) throw new Error(`Workspace request failed with ${res.status}`);
        return res.json() as Promise<AdminWorkspaceSnapshot>;
      }),
      fetch("/api/admin/system").then((res) => {
        if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
        if (res.status === 503) { throw new Error("Backend server is not running"); }
        if (!res.ok) throw new Error(`System status request failed with ${res.status}`);
        return res.json() as Promise<AdminSystemSnapshot>;
      }),
    ]);

    if (workspaceResult.status === "fulfilled") {
      setWorkspaceSnapshot(workspaceResult.value);
      setWorkspaceError(null);
      setIsBackendDown(false);
    } else {
      const msg = workspaceResult.reason instanceof Error ? workspaceResult.reason.message : "Workspace request failed";
      setWorkspaceError(msg);
      if (msg.includes("Backend server is not running")) setIsBackendDown(true);
    }
    setIsWorkspaceLoading(false);

    if (systemResult.status === "fulfilled") {
      setSystemSnapshot(systemResult.value);
      setSystemError(null);
    } else {
      setSystemError(systemResult.reason instanceof Error ? systemResult.reason.message : "System status request failed");
    }
    setIsSystemLoading(false);
  }, [flagUnauthorized]);

  const loadTasks = useCallback(async ({ isBackground = false }: { isBackground?: boolean } = {}) => {
    if (!isBackground) {
      setIsTasksLoading(true);
    }
    try {
      const res = await proxyFetch("/api/admin/tasks");
      if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
      if (res.status === 503) { setIsBackendDown(true); throw new Error("Backend server is not running"); }
      if (!res.ok) throw new Error(`Tasks request failed with ${res.status}`);
      const data = await res.json() as AdminTaskSnapshot;
      setTaskSnapshot(data);
      setTasksError(null);
      setIsBackendDown(false);
    } catch (error) {
      setTasksError(error instanceof Error ? error.message : "Failed to load task workspace");
    } finally {
      setIsTasksLoading(false);
    }
  }, [flagUnauthorized]);

  const loadSettings = useCallback(async ({ isBackground = false }: { isBackground?: boolean } = {}) => {
    if (!isBackground) {
      setIsSettingsLoading(true);
    }
    try {
      const [settingsRes, runtimeRes] = await Promise.allSettled([
        fetch("/api/admin/settings").then(res => {
          if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
          if (res.status === 503) { throw new Error("Backend server is not running"); }
          if (!res.ok) throw new Error("Settings request failed");
          return res.json() as Promise<AdminSettingsSnapshot>;
        }),
        fetch("/api/admin/settings/email-runtime").then(res => {
          if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
          if (res.status === 503) { throw new Error("Backend server is not running"); }
          if (!res.ok) throw new Error("Email runtime request failed");
          return res.json() as Promise<AdminEmailRuntimeSnapshot>;
        })
      ]);

      if (settingsRes.status === "fulfilled") {
        setSettingsSnapshot(settingsRes.value);
        setSettingsError(null);
      } else {
        setSettingsError(settingsRes.reason instanceof Error ? settingsRes.reason.message : "Failed to load settings");
      }
      if (runtimeRes.status === "fulfilled") {
        setEmailRuntimeSnapshot(runtimeRes.value);
      }
    } finally {
      setIsSettingsLoading(false);
    }
  }, [flagUnauthorized]);

  const loadBillings = useCallback(async ({ isBackground = false }: { isBackground?: boolean } = {}) => {
    if (!canViewBillings) return;
    if (!isBackground) {
      setIsBillingLoading(true);
    }
    try {
      const res = await proxyFetch("/api/admin/billings");
      if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error(`Billings request failed with ${res.status}`);
      const data = await res.json() as AdminBillingSnapshot;
      setBillingSnapshot(data);
      setBillingError(null);
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Failed to load billings");
    } finally {
      setIsBillingLoading(false);
    }
  }, [canViewBillings, flagUnauthorized]);

  const loadInvoices = useCallback(async ({ isBackground = false }: { isBackground?: boolean } = {}) => {
    if (!isBackground) {
      setIsInvoiceLoading(true);
    }
    try {
      const res = await proxyFetch("/api/admin/invoices");
      if (res.status === 401) { flagUnauthorized(); throw new Error("Unauthorized"); }
      if (!res.ok) throw new Error(`Invoices request failed with ${res.status}`);
      const data = await res.json() as AdminInvoiceSnapshot;
      setInvoiceSnapshot(data);
      setInvoiceError(null);
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Failed to load invoices");
    } finally {
      setIsInvoiceLoading(false);
    }
  }, [flagUnauthorized]);

  // Workspace & System Polling
  useEffect(() => {
    if (!currentUser) return;

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadData({ isBackground: true });
    };

    void loadData();
    const interval = window.setInterval(pollInBackground, DASHBOARD_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, loadData]);

  // Tasks Polling
  useEffect(() => {
    if (!currentUser) return;

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadTasks({ isBackground: true });
    };

    void loadTasks();
    const interval = window.setInterval(pollInBackground, DASHBOARD_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, loadTasks]);

  // Settings & Runtime Polling
  useEffect(() => {
    if (!currentUser) return;

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadSettings({ isBackground: true });
    };

    void loadSettings();
    const interval = window.setInterval(pollInBackground, NON_REALTIME_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, loadSettings]);

  // Billings Polling
  useEffect(() => {
    if (!currentUser || !canViewBillings) return;

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadBillings({ isBackground: true });
    };

    void loadBillings();
    const interval = window.setInterval(pollInBackground, NON_REALTIME_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, canViewBillings, loadBillings]);

  // Invoices Polling
  useEffect(() => {
    if (!currentUser) return;

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadInvoices({ isBackground: true });
    };

    void loadInvoices();
    const interval = window.setInterval(pollInBackground, NON_REALTIME_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, loadInvoices]);

  // Notification polling
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    const loadUnread = async () => {
      try {
        const res = await proxyFetch("/api/admin/notifications/unread-count");
        if (res.status === 401) {
          flagUnauthorized();
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setNotificationCount(data.count || 0);
      } catch { /* silent */ }
    };

    const pollInBackground = () => {
      if (!isPageVisible()) return;
      void loadUnread();
    };

    void loadUnread();
    const interval = window.setInterval(pollInBackground, NON_REALTIME_POLL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pollInBackground();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [currentUser, flagUnauthorized]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await proxyFetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json() as AdminNotification[];
        setNotifications(data);
      }
    } catch { /* silent */ }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await proxyFetch("/api/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setNotificationCount(0);
    } catch { /* silent */ }
  }, []);

  const addNotification = useCallback((notification: AdminNotification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
    setNotificationCount((prev) => prev + 1);
  }, []);

  return {
    workspaceSnapshot, workspaceError, isWorkspaceLoading, refreshWorkspaceSnapshot, loadWorkspace: loadData,
    systemSnapshot, systemError, isSystemLoading, loadSystem: loadData,
    taskSnapshot, setTaskSnapshot, tasksError, setTasksError, isTasksLoading, loadTasks,
    settingsSnapshot, setSettingsSnapshot, emailRuntimeSnapshot, setEmailRuntimeSnapshot, settingsError, setSettingsError, isSettingsLoading, loadSettings,
    billingSnapshot, setBillingSnapshot, billingError, setBillingError, isBillingLoading, loadBillings,
    invoiceSnapshot, setInvoiceSnapshot, invoiceError, setInvoiceError, isInvoiceLoading, loadInvoices,
    canViewBillings,
    isBackendDown,
    notifications, notificationCount, setNotificationCount, fetchNotifications, markNotificationRead, markAllNotificationsRead, addNotification,
  };
}

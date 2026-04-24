"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";
import { getCookie } from "@/lib/utils";
import type {
  AdminNotification,
  AdminSettingsSnapshot,
  AdminTaskRealtimeEvent,
  AdminTaskSnapshot,
  CreateAdminTaskInput,
  ChatMessage,
  ChatSession,
  GlobalMessage,
  LogEntry,
  UpdateAdminTaskInput,
  UserProfile,
  AdminThread,
  ThreadMessage,
  ThreadMessageReaction,
  ThreadTypingParticipant,
} from "@/lib/admin-types";

type TaskHttpActions = {
  createTask?: (payload: CreateAdminTaskInput) => Promise<unknown>;
  updateTask?: (taskId: string, payload: UpdateAdminTaskInput) => Promise<unknown>;
  deleteTask?: (taskId: string) => Promise<unknown>;
  startTask?: (taskId: string) => Promise<unknown>;
  addTaskComment?: (taskId: string, body: string) => Promise<unknown>;
  addTaskChecklistItem?: (taskId: string, label: string) => Promise<unknown>;
  toggleTaskChecklistItem?: (taskId: string, itemId: string) => Promise<unknown>;
  restoreTask?: (taskId: string) => Promise<unknown>;
};

type TeamChatSocketMessage = {
  id?: string;
  userId?: string;
  username?: string;
  text?: string;
  content?: string;
  timestamp?: string;
};

type ThreadTypingPayload = ThreadTypingParticipant & {
  threadId: string;
  typing: boolean;
};

type ThreadReactionPayload = {
  threadId: string;
  messageId: string;
  reactions: ThreadMessageReaction[];
};

export function useAdminSockets({
  currentUser,
  adminName,
  settingsSnapshot,
  setTaskSnapshot,
  setTasksError,
  addLog,
  addNotification,
  setNotificationCount,
  taskHttpActions,
}: {
  currentUser: UserProfile | null;
  adminName: string;
  settingsSnapshot: AdminSettingsSnapshot | null;
  setTaskSnapshot: (snap: AdminTaskSnapshot) => void;
  setTasksError: (err: string | null) => void;
  addLog: (type: LogEntry["type"], msg: string) => void;
  addNotification?: (n: AdminNotification) => void;
  setNotificationCount?: (count: number | ((prev: number) => number)) => void;
  taskHttpActions?: TaskHttpActions;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [isSupportConnected, setIsSupportConnected] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [supportMessages, setSupportMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isTasksConnected, setIsTasksConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [taskTypingByTask, setTaskTypingByTask] = useState<
    Record<string, { typing: boolean; userId: string; userName: string; at: string }>
  >({});
  const [taskPulseByTask, setTaskPulseByTask] = useState<Record<string, number>>({});
  const [taskEventVersion, setTaskEventVersion] = useState(0);
  
  const [threads, setThreads] = useState<AdminThread[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<string, ThreadMessage[]>>({});
  const [threadTypingByThread, setThreadTypingByThread] = useState<
    Record<string, ThreadTypingParticipant[]>
  >({});

  const socketRef = useRef<Socket | null>(null);
  const supportSocketRef = useRef<Socket | null>(null);
  const tasksSocketRef = useRef<Socket | null>(null);
  const notificationSocketRef = useRef<Socket | null>(null);
  const threadsSocketRef = useRef<Socket | null>(null);
  const supportTypingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const supportTypingNotifiedRef = useRef<Record<string, boolean>>({});
  const taskTypingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const taskTypingNotifiedRef = useRef<Record<string, boolean>>({});
  const taskPulseTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const threadTypingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const browserNotificationRequestedRef = useRef(false);
  const desktopNotificationCooldownRef = useRef<Record<string, number>>({});
  const taskActionWaitersRef = useRef<
    Record<
      string,
      {
        resolve: (value: unknown) => void;
        reject: (error: Error) => void;
        timeoutId: NodeJS.Timeout;
      }
    >
  >({});
  const taskSnapshotSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reportSocketError = (
    label: string,
    error: Error,
    options?: { taskError?: boolean },
  ) => {
    const message = error?.message || "Unknown socket error";
    addLog("error", `${label} connection failed: ${message}`);
    if (options?.taskError) {
      setTasksError(`${label} connection failed: ${message}`);
    }
  };

  const playSound = (type: "sent" | "received" | "typing" | "notification") => {
    try {
      const soundMap: Record<string, string> = {
        sent: "/sounds/sent.ogg",
        received: "/sounds/received.ogg",
        typing: "/sounds/received.ogg",
        notification: "/sounds/received.ogg",
      };
      const audio = new Audio(soundMap[type]);
      audio.volume = type === "typing" ? 0.2 : type === "notification" ? 1 : 0.8;
      audio.play().catch(() => undefined);
    } catch { /* Audio not available */ }
  };

  const getSocketToken = () => getCookie("jwt") || getCookie("admin_token");

  const showDesktopNotification = (title: string, body: string, tag: string) => {
    if (settingsSnapshot?.notifications?.inboxAlerts === false) {
      return;
    }

    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    if (document.visibilityState === "visible" && document.hasFocus()) {
      return;
    }

    const now = Date.now();
    const lastShownAt = desktopNotificationCooldownRef.current[tag] || 0;
    if (now - lastShownAt < 1500) {
      return;
    }
    desktopNotificationCooldownRef.current[tag] = now;

    const notification = new Notification(title, {
      body,
      tag,
      icon: "/favicon.ico",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  useEffect(() => {
    if (!currentUser) return;
    if (settingsSnapshot?.notifications?.inboxAlerts === false) return;
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (browserNotificationRequestedRef.current) return;

    browserNotificationRequestedRef.current = true;
    void Notification.requestPermission().catch(() => undefined);
  }, [currentUser, settingsSnapshot]);

  const triggerTaskPulse = (taskId: string) => {
    const at = Date.now();
    setTaskPulseByTask((prev) => ({ ...prev, [taskId]: at }));
    if (taskPulseTimeoutRef.current[taskId]) {
      clearTimeout(taskPulseTimeoutRef.current[taskId]);
    }
    taskPulseTimeoutRef.current[taskId] = setTimeout(() => {
      setTaskPulseByTask((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }, 2600);
  };

  const queueTaskSnapshotSync = () => {
    if (taskSnapshotSyncTimeoutRef.current) {
      clearTimeout(taskSnapshotSyncTimeoutRef.current);
    }
    taskSnapshotSyncTimeoutRef.current = setTimeout(() => {
      tasksSocketRef.current?.emit("tasks:request_snapshot", {});
    }, 80);
  };

  const isTaskEventFromOtherUser = (event: AdminTaskRealtimeEvent, currentUserId: string) => {
    if (!event?.type) return false;
    return !event.actorId || event.actorId !== currentUserId;
  };

  const shouldPlayTaskEventSound = (event: AdminTaskRealtimeEvent, currentUserId: string) => {
    if (!isTaskEventFromOtherUser(event, currentUserId)) return false;
    return [
      "task.updated",
      "task.progress.updated",
      "task.comment.created",
      "task.deleted.soft",
      "task.restored",
    ].includes(event.type);
  };

  const buildTaskEventNotification = (
    event: AdminTaskRealtimeEvent,
    currentUserId: string,
  ): AdminNotification | null => {
    if (!addNotification || !isTaskEventFromOtherUser(event, currentUserId)) {
      return null;
    }

    const actor = event.actorName || "Team member";
    const createdAt = event.at || new Date().toISOString();
    const payload =
      event.payload && typeof event.payload === "object"
        ? (event.payload as Record<string, unknown>)
        : {};
    const title = typeof payload.title === "string" ? payload.title : "a task";
    const base = {
      id: `task-event-${event.taskId}-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
      userId: currentUserId,
      entityType: "task",
      entityId: event.taskId,
      isRead: false,
      readAt: null,
      metadata: { eventType: event.type, actorId: event.actorId || null },
      createdAt,
    } as const;

    if (event.type === "task.comment.created") {
      const bodyPreview = typeof payload.body === "string" ? payload.body.trim().slice(0, 80) : "";
      return {
        ...base,
        type: "TASK_COMMENT",
        title: "Task comment",
        body: bodyPreview
          ? `${actor} commented on "${title}": ${bodyPreview}`
          : `${actor} commented on "${title}".`,
      };
    }

    if (event.type === "task.progress.updated") {
      const progress = typeof payload.progress === "number" ? payload.progress : null;
      return {
        ...base,
        type: "TASK_PROGRESS_UPDATE",
        title: "Task progress updated",
        body:
          progress !== null
            ? `${actor} moved "${title}" to ${progress}%.`
            : `${actor} updated "${title}".`,
      };
    }

    if (event.type === "task.updated") {
      return {
        ...base,
        type: "TASK_PROGRESS_UPDATE",
        title: "Task interaction",
        body: `${actor} updated "${title}".`,
      };
    }

    if (event.type === "task.deleted.soft" || event.type === "task.restored") {
      return {
        ...base,
        type: "TASK_PROGRESS_UPDATE",
        title: "Task lifecycle update",
        body: `${actor} ${event.type === "task.deleted.soft" ? `moved "${title}" to Bin` : `restored "${title}" from Bin`}.`,
      };
    }

    return null;
  };

  const appendThreadMessage = (msg: ThreadMessage, currentUserId: string) => {
    setThreadMessages((prev) => {
      const existing = prev[msg.threadId] || [];
      if (existing.some((item) => item.id === msg.id)) {
        return prev;
      }

      return {
        ...prev,
        [msg.threadId]: [...existing, msg],
      };
    });

    setThreads((prev) => {
      const existingThread = prev.find((thread) => thread.id === msg.threadId);
      const updatedThread: AdminThread = existingThread
        ? {
            ...existingThread,
            lastMessage: msg.body,
            updatedAt: msg.createdAt,
            unread: msg.senderId !== currentUserId,
          }
        : {
            id: msg.threadId,
            updatedAt: msg.createdAt,
            otherUser:
              msg.senderId === currentUserId
                ? undefined
                : {
                    id: msg.sender.id,
                    name: msg.sender.name,
                    role: msg.sender.role,
                  },
            lastMessage: msg.body,
            unread: msg.senderId !== currentUserId,
          };

      return [updatedThread, ...prev.filter((thread) => thread.id !== msg.threadId)].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
    });

    setThreadTypingByThread((prev) => {
      const participants = prev[msg.threadId];
      if (!participants?.length) {
        return prev;
      }

      const nextParticipants = participants.filter((participant) => participant.userId !== msg.senderId);
      if (nextParticipants.length === participants.length) {
        return prev;
      }

      return {
        ...prev,
        [msg.threadId]: nextParticipants,
      };
    });
  };

  const applyThreadReactionUpdate = (payload: ThreadReactionPayload) => {
    setThreadMessages((prev) => {
      const existing = prev[payload.threadId];
      if (!existing?.length) {
        return prev;
      }

      return {
        ...prev,
        [payload.threadId]: existing.map((message) =>
          message.id === payload.messageId
            ? {
                ...message,
                reactions: payload.reactions,
              }
            : message,
        ),
      };
    });
  };

  const updateThreadTypingState = (payload: ThreadTypingPayload, currentUserId: string) => {
    if (!payload?.threadId || !payload?.userId || payload.userId === currentUserId) {
      return;
    }

    const timeoutKey = `${payload.threadId}:${payload.userId}`;
    const clearTimeoutKey = () => {
      const existingTimeout = threadTypingTimeoutRef.current[timeoutKey];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        delete threadTypingTimeoutRef.current[timeoutKey];
      }
    };

    if (!payload.typing) {
      clearTimeoutKey();
      setThreadTypingByThread((prev) => {
        const existing = prev[payload.threadId];
        if (!existing?.length) {
          return prev;
        }

        const nextParticipants = existing.filter((participant) => participant.userId !== payload.userId);
        if (nextParticipants.length === existing.length) {
          return prev;
        }

        return {
          ...prev,
          [payload.threadId]: nextParticipants,
        };
      });
      return;
    }

    setThreadTypingByThread((prev) => {
      const existing = prev[payload.threadId] || [];
      const filtered = existing.filter((participant) => participant.userId !== payload.userId);
      return {
        ...prev,
        [payload.threadId]: [
          ...filtered,
          {
            userId: payload.userId,
            userName: payload.userName,
            at: payload.at,
          },
        ].sort((left, right) => new Date(left.at).getTime() - new Date(right.at).getTime()),
      };
    });

    clearTimeoutKey();
    threadTypingTimeoutRef.current[timeoutKey] = setTimeout(() => {
      setThreadTypingByThread((prev) => {
        const existing = prev[payload.threadId];
        if (!existing?.length) {
          return prev;
        }

        const nextParticipants = existing.filter((participant) => participant.userId !== payload.userId);
        if (nextParticipants.length === existing.length) {
          return prev;
        }

        return {
          ...prev,
          [payload.threadId]: nextParticipants,
        };
      });
      delete threadTypingTimeoutRef.current[timeoutKey];
    }, 2400);
  };

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;
    const loadThreads = async () => {
      try {
        const res = await fetch("/api/admin/threads", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as AdminThread[];
        if (!cancelled) {
          setThreads(data);
        }
      } catch {
        // silent
      }
    };

    void loadThreads();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // 1. Global Team Chat Socket
  useEffect(() => {
    if (!currentUser) return;
    const token = getSocketToken();
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      addLog("success", `Connected to team chat as ${currentUser.username}`);
      socket.emit("team:history_request");
      socket.io.engine.on("upgrade", (t) => { setTransport(t.name); addLog("info", `Transport upgraded to: ${t.name}`); });
    });

    socket.on("disconnect", (reason) => { setIsConnected(false); addLog("error", `Disconnected: ${reason}`); });
    socket.on("connect_error", (error) => {
      reportSocketError("Team chat", error);
    });

    socket.on("messageHistory", (history: TeamChatSocketMessage[]) => {
      const formatted = history.map(item => ({
        id: String(item.id),
        sender: item.userId === currentUser.id ? "me" : "other",
        text: String(item.content || item.text || ""),
        timestamp: new Date(String(item.timestamp)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        senderName: item.username,
        userId: item.userId,
      })) as GlobalMessage[];
      setMessages(formatted);
    });

    socket.on("newMessage", (data: TeamChatSocketMessage) => {
      const isMine = data.userId === currentUser.id;
      const msg: GlobalMessage = {
        id: String(data.id || Math.random().toString(36)),
        sender: isMine ? "me" : "other",
        text: String(data.text || ""),
        timestamp: new Date(String(data.timestamp || Date.now())).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        senderName: data.username,
        userId: data.userId,
      };
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    });

    return () => { socket.disconnect(); };
  }, [currentUser]);

  // 2. Support Inbox Socket
  useEffect(() => {
    if (!currentUser) return;
    const token = getSocketToken();
    const socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
    supportSocketRef.current = socket;

    socket.on("connect", () => {
      setIsSupportConnected(true);
      socket.emit("admin:join", { adminName, adminId: currentUser.id });
    });

    socket.on("disconnect", () => setIsSupportConnected(false));
    socket.on("connect_error", (error) => {
      reportSocketError("Support inbox", error);
    });
    socket.on("admin:connected", () => addLog("success", "Support system connected"));
    socket.on("admin:initial_state", (data: { sessions: ChatSession[] }) => {
      setSessions(data.sessions.sort((l, r) => new Date(r.lastSeenAt).getTime() - new Date(l.lastSeenAt).getTime()));
    });

    socket.on("admin:session_updated", (session: ChatSession) => {
      setSessions(prev => {
        const exists = prev.find(i => i.sessionId === session.sessionId);
        const next = exists ? prev.map(i => i.sessionId === session.sessionId ? { ...i, ...session } : i) : [session, ...prev];
        return next.sort((l, r) => new Date(r.lastSeenAt).getTime() - new Date(l.lastSeenAt).getTime());
      });
    });

    socket.on("admin:new_message", (msg: ChatMessage) => {
      setSupportMessages(prev => {
        const sessionMsgs = prev[msg.sessionId] || [];
        if (sessionMsgs.some(i => i.id === msg.id)) return prev;
        return { ...prev, [msg.sessionId]: [...sessionMsgs, msg] };
      });
      setSessions(prev => {
        const session = prev.find(i => i.sessionId === msg.sessionId) || { sessionId: msg.sessionId, lastSeenAt: msg.timestamp, connected: true };
        return [{ ...session, lastSeenAt: msg.timestamp } as ChatSession, ...prev.filter(i => i.sessionId !== msg.sessionId)];
      });
      if (msg.from === "client") {
        if (settingsSnapshot?.notifications?.soundEffects !== false) {
          playSound("notification");
        }
        if (addNotification) {
          addNotification({
            id: `support-${msg.id}`,
            type: "SUPPORT_MESSAGE",
            title: "New support message",
            body: msg.text,
            userId: currentUser.id,
            entityType: "support-session",
            entityId: msg.sessionId,
            isRead: false,
            readAt: null,
            metadata: { sessionId: msg.sessionId },
            createdAt: msg.timestamp,
          });
        }
        showDesktopNotification("New support message", msg.text, `support-${msg.sessionId}`);
      }
    });

    socket.on("admin:history", (data: { sessionId: string; messages: ChatMessage[] }) => {
      setSupportMessages(prev => ({ ...prev, [data.sessionId]: data.messages }));
    });

    socket.on("admin:typing", (data: { sessionId: string; typing: boolean; from: string }) => {
      if (data.from !== "client") return;
      setTypingUsers(prev => ({ ...prev, [data.sessionId]: data.typing }));
      if (data.typing && !supportTypingNotifiedRef.current[data.sessionId]) { playSound("typing"); supportTypingNotifiedRef.current[data.sessionId] = true; }
      if (!data.typing) supportTypingNotifiedRef.current[data.sessionId] = false;
      if (data.typing) {
        if (supportTypingTimeoutRef.current[data.sessionId]) clearTimeout(supportTypingTimeoutRef.current[data.sessionId]);
        supportTypingTimeoutRef.current[data.sessionId] = setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [data.sessionId]: false }));
          supportTypingNotifiedRef.current[data.sessionId] = false;
        }, 3000);
      }
    });

    return () => { socket.disconnect(); };
  }, [currentUser, adminName]);

  // 3. Task Board Socket
  useEffect(() => {
    if (!currentUser) return;
    const url = settingsSnapshot?.integrations?.tasksSocketUrl || `${API_URL}/tasks`;
    const token = getSocketToken();
    const socket = io(url, {
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
    tasksSocketRef.current = socket;

    socket.on("connect", () => {
      setIsTasksConnected(true);
      addLog("success", "Realtime task board connected");
      socket.emit("tasks:request_snapshot", {});
    });

    socket.on("disconnect", (reason) => { setIsTasksConnected(false); addLog("warning", `Task board disconnected: ${reason}`); });
    socket.on("connect_error", (error) => {
      setIsTasksConnected(false);
      reportSocketError("Task board", error, { taskError: true });
    });
    socket.on("tasks:snapshot", (snap: AdminTaskSnapshot) => { setTaskSnapshot(snap); setTasksError(null); });
    socket.on("tasks:error", (p: { message?: string }) => { setTasksError(p.message || "Task socket error"); });
    socket.on("tasks:action_result", (payload: {
      requestId?: string | null;
      ok: boolean;
      message?: string;
      snapshot?: AdminTaskSnapshot;
      result?: unknown;
    }) => {
      if (payload?.snapshot) {
        setTaskSnapshot(payload.snapshot);
        setTasksError(null);
      }

      const requestId = payload?.requestId || "";
      const waiter = requestId ? taskActionWaitersRef.current[requestId] : undefined;
      if (!waiter) {
        return;
      }

      clearTimeout(waiter.timeoutId);
      delete taskActionWaitersRef.current[requestId];

      if (!payload.ok) {
        const message = payload.message || "Task action failed";
        setTasksError(message);
        waiter.reject(new Error(message));
        return;
      }

      waiter.resolve(payload.snapshot ?? payload.result ?? null);
    });
    socket.on("tasks:typing", (payload: { taskId: string; typing: boolean; userId: string; userName: string; at: string }) => {
      if (!payload?.taskId || !payload?.userId) return;
      if (payload.userId === currentUser.id) return;

      if (!payload.typing) {
        setTaskTypingByTask((prev) => {
          const next = { ...prev };
          delete next[payload.taskId];
          return next;
        });
        if (taskTypingTimeoutRef.current[payload.taskId]) {
          clearTimeout(taskTypingTimeoutRef.current[payload.taskId]);
        }
        taskTypingNotifiedRef.current[payload.taskId] = false;
        return;
      }

      triggerTaskPulse(payload.taskId);
      if (!taskTypingNotifiedRef.current[payload.taskId]) {
        taskTypingNotifiedRef.current[payload.taskId] = true;
        if (settingsSnapshot?.notifications?.soundEffects !== false) {
          playSound("typing");
        }
        if (addNotification) {
          addNotification({
            id: `task-typing-${payload.taskId}-${payload.at}-${Math.random().toString(36).slice(2, 8)}`,
            type: "TASK_COMMENT",
            title: "Task typing",
            body: `${payload.userName} is typing on a task.`,
            userId: currentUser.id,
            entityType: "task",
            entityId: payload.taskId,
            isRead: false,
            readAt: null,
            metadata: { eventType: "task.typing.started", actorId: payload.userId },
            createdAt: payload.at || new Date().toISOString(),
          });
        }
      }

      setTaskTypingByTask((prev) => ({
        ...prev,
        [payload.taskId]: payload,
      }));
      if (taskTypingTimeoutRef.current[payload.taskId]) {
        clearTimeout(taskTypingTimeoutRef.current[payload.taskId]);
      }
      taskTypingTimeoutRef.current[payload.taskId] = setTimeout(() => {
        setTaskTypingByTask((prev) => {
          const next = { ...prev };
          delete next[payload.taskId];
          return next;
        });
        taskTypingNotifiedRef.current[payload.taskId] = false;
      }, 3000);
    });

    socket.on("tasks:event", (event: AdminTaskRealtimeEvent) => {
      if (!event?.taskId) return;

      const isFromCurrentUser = !!event.actorId && event.actorId === currentUser.id;
      const isFromOtherUser = isTaskEventFromOtherUser(event, currentUser.id);
      if (isFromOtherUser) {
        triggerTaskPulse(event.taskId);
      }

      if (
        isFromCurrentUser &&
        event.type === "task.comment.created" &&
        settingsSnapshot?.notifications?.soundEffects !== false
      ) {
        playSound("sent");
      }

      if (
        settingsSnapshot?.notifications?.soundEffects !== false &&
        shouldPlayTaskEventSound(event, currentUser.id)
      ) {
        playSound("notification");
      }

      const eventNotification = buildTaskEventNotification(event, currentUser.id);
      if (eventNotification && addNotification) {
        addNotification(eventNotification);
      }

      setTaskEventVersion((prev) => prev + 1);
      queueTaskSnapshotSync();
    });
    socket.on("tasks:seen_ack", () => {
      setTaskEventVersion((prev) => prev + 1);
      queueTaskSnapshotSync();
    });

    return () => {
      Object.values(taskActionWaitersRef.current).forEach(({ timeoutId, reject }) => {
        clearTimeout(timeoutId);
        reject(new Error("Task socket disconnected"));
      });
      taskActionWaitersRef.current = {};
      Object.values(taskTypingTimeoutRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      Object.values(taskPulseTimeoutRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      if (taskSnapshotSyncTimeoutRef.current) {
        clearTimeout(taskSnapshotSyncTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [currentUser, settingsSnapshot, setTaskSnapshot, setTasksError, addNotification]);

  // 4. Notification Socket
  useEffect(() => {
    if (!currentUser) return;
    const token = getSocketToken();
    const socket = io(`${API_URL}/notifications`, {
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
    notificationSocketRef.current = socket;

    socket.on("connect", () => {
      addLog("success", "Notification feed connected");
    });
    socket.on("connect_error", (error) => {
      reportSocketError("Notification feed", error);
    });

    socket.on("disconnect", () => {
      addLog("warning", "Notification feed disconnected");
    });

    socket.on("notification:new", (notification: AdminNotification) => {
      if (addNotification) addNotification(notification);
      if (settingsSnapshot?.notifications?.soundEffects !== false) {
        playSound("notification");
      }
      showDesktopNotification(notification.title, notification.body, `notification-${notification.id}`);
    });

    socket.on("notification:unread_count", (data: { count: number }) => {
      if (setNotificationCount) setNotificationCount(data.count);
    });

    return () => { socket.disconnect(); };
  }, [currentUser, settingsSnapshot, addNotification, setNotificationCount]);

  // 5. Threads Socket
  useEffect(() => {
    if (!currentUser) return;
    const token = getSocketToken();
    const socket = io(`${API_URL}/threads`, {
      transports: ["websocket"],
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
    threadsSocketRef.current = socket;

    socket.on("connect", () => {
      addLog("success", "Team inbox connected");
    });
    socket.on("connect_error", (error) => {
      reportSocketError("Team inbox", error);
    });

    socket.on("thread:message", (msg: ThreadMessage) => {
      appendThreadMessage(msg, currentUser.id);
    });

    socket.on("thread:read", (payload: { threadId: string; userId: string; userName?: string; at: string }) => {
      if (!payload?.threadId) {
        return;
      }
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === payload.threadId && payload.userId === currentUser.id
            ? { ...thread, unread: false }
            : thread,
        ),
      );
    });

    socket.on("thread:typing", (payload: ThreadTypingPayload) => {
      updateThreadTypingState(payload, currentUser.id);
    });

    socket.on("thread:reaction", (payload: ThreadReactionPayload) => {
      applyThreadReactionUpdate(payload);
    });

    return () => {
      Object.values(threadTypingTimeoutRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
      socket.disconnect();
    };
  }, [currentUser, addLog]);

  const sendGlobalMessage = (text: string) => {
    if (text.trim() && socketRef.current) {
      socketRef.current.emit("newMessage", { text });
      playSound("sent");
    }
  };

  const sendSupportMessage = (sessionId: string, text: string) => {
    if (text.trim() && supportSocketRef.current) {
      supportSocketRef.current.emit("admin:reply", { sessionId, text });
      supportSocketRef.current.emit("admin:typing", { sessionId, typing: false });
      playSound("sent");
    }
  };

  const requestSupportDetails = (sessionId: string) => {
    if (supportSocketRef.current) {
      supportSocketRef.current.emit("admin:reply", { sessionId, text: "Requested contact details", type: "form_request" });
      playSound("sent");
    }
  };

  const notifySupportTyping = (sessionId: string, typing: boolean) => {
    if (supportSocketRef.current) {
      supportSocketRef.current.emit("admin:typing", { sessionId, typing });
    }
  };

  const viewSupportSession = (sessionId: string, prevSessionId?: string | null) => {
    if (!supportSocketRef.current) return;
    if (prevSessionId && prevSessionId !== sessionId) supportSocketRef.current.emit("admin:leave_session", { sessionId: prevSessionId });
    supportSocketRef.current.emit("admin:view_session", { sessionId, adminName });
    if (!supportMessages[sessionId]) supportSocketRef.current.emit("admin:get_history", { sessionId });
  };

  const sendThreadMessage = async (threadId: string, body: string) => {
    const text = body.trim();
    if (!text) {
      return;
    }

    if (threadsSocketRef.current?.connected) {
      threadsSocketRef.current.emit("thread:message_send", { threadId, body: text });
      playSound("sent");
      return;
    }

    const response = await fetch(`/api/admin/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!response.ok) {
      throw new Error("Failed to send private message");
    }

    const message = (await response.json()) as ThreadMessage;
    appendThreadMessage(message, currentUser?.id || "");
    playSound("sent");
    return message;
  };

  const markThreadRead = async (threadId: string) => {
    if (threadsSocketRef.current?.connected) {
      threadsSocketRef.current.emit("thread:mark_read", { threadId });
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unread: false } : t));
      return;
    }

    await fetch(`/api/admin/threads/${threadId}/read`, {
      method: "PATCH",
    });
    setThreads((prev) => prev.map((thread) => thread.id === threadId ? { ...thread, unread: false } : thread));
  };

  const sendThreadTyping = (threadId: string, typing: boolean) => {
    if (!threadId || !threadsSocketRef.current?.connected) {
      return;
    }

    threadsSocketRef.current.emit("thread:typing", { threadId, typing });
  };

  const toggleThreadReaction = async (threadId: string, messageId: string, emoji: string) => {
    if (!currentUser || !threadId || !messageId || !emoji) {
      return;
    }

    const optimisticPayload: ThreadReactionPayload | null = (() => {
      const message = (threadMessages[threadId] || []).find((item) => item.id === messageId);
      if (!message) {
        return null;
      }

      const existing = [...(message.reactions || [])];
      const existingIndex = existing.findIndex(
        (reaction) => reaction.userId === currentUser.id && reaction.emoji === emoji,
      );

      if (existingIndex >= 0) {
        existing.splice(existingIndex, 1);
      } else {
        existing.push({
          emoji,
          userId: currentUser.id,
          userName: currentUser.username,
          reactedAt: new Date().toISOString(),
        });
      }

      return {
        threadId,
        messageId,
        reactions: existing,
      };
    })();

    if (optimisticPayload) {
      applyThreadReactionUpdate(optimisticPayload);
    }

    if (threadsSocketRef.current?.connected) {
      threadsSocketRef.current.emit("thread:reaction_toggle", { threadId, messageId, emoji });
      return;
    }

    const response = await fetch(
      `/api/admin/threads/${threadId}/messages/${messageId}/reactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update reaction");
    }

    const payload = (await response.json()) as ThreadReactionPayload;
    applyThreadReactionUpdate(payload);
  };

  const joinTaskRoom = (taskId: string) => {
    if (tasksSocketRef.current && taskId) {
      tasksSocketRef.current.emit("task:join", { taskId });
    }
  };

  const leaveTaskRoom = (taskId: string) => {
    if (tasksSocketRef.current && taskId) {
      tasksSocketRef.current.emit("task:leave", { taskId });
    }
  };

  const sendTaskTyping = (taskId: string, typing: boolean) => {
    if (tasksSocketRef.current && taskId) {
      tasksSocketRef.current.emit("task:typing", { taskId, typing });
    }
  };

  const markTaskSeen = (taskId: string, commentId?: string) => {
    if (tasksSocketRef.current && taskId) {
      tasksSocketRef.current.emit("task:seen", { taskId, commentId });
    }
  };

  const executeTaskSocketAction = (
    payload: {
      type:
        | "create"
        | "update"
        | "start"
        | "delete"
        | "restore"
        | "comment"
        | "checklist:add"
        | "checklist:toggle";
      taskId?: string;
      itemId?: string;
      payload?: Record<string, unknown>;
    },
    fallback?: () => Promise<unknown>,
  ) => {
    const socket = tasksSocketRef.current;
    if (!socket || !socket.connected) {
      if (fallback) {
        return fallback();
      }
      return Promise.reject(new Error("Realtime task socket is disconnected"));
    }

    const requestId = `${payload.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return new Promise<unknown>((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        delete taskActionWaitersRef.current[requestId];
        if (fallback) {
          try {
            resolve(await fallback());
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Task action failed"));
          }
          return;
        }
        reject(new Error("Task action timed out"));
      }, 8000);

      taskActionWaitersRef.current[requestId] = {
        resolve,
        reject,
        timeoutId,
      };

      socket.emit("task:action", {
        requestId,
        ...payload,
      });
    });
  };

  const createTask = (payload: CreateAdminTaskInput) =>
    executeTaskSocketAction(
      { type: "create", payload: payload as unknown as Record<string, unknown> },
      taskHttpActions?.createTask ? () => taskHttpActions.createTask!(payload) : undefined,
    );

  const updateTask = (taskId: string, payload: UpdateAdminTaskInput) =>
    executeTaskSocketAction(
      { type: "update", taskId, payload: payload as unknown as Record<string, unknown> },
      taskHttpActions?.updateTask ? () => taskHttpActions.updateTask!(taskId, payload) : undefined,
    );

  const deleteTask = (taskId: string) =>
    executeTaskSocketAction(
      { type: "delete", taskId },
      taskHttpActions?.deleteTask ? () => taskHttpActions.deleteTask!(taskId) : undefined,
    );

  const startTask = (taskId: string) =>
    executeTaskSocketAction(
      { type: "start", taskId },
      taskHttpActions?.startTask ? () => taskHttpActions.startTask!(taskId) : undefined,
    );

  const addTaskComment = (taskId: string, body: string) =>
    executeTaskSocketAction(
      { type: "comment", taskId, payload: { body } },
      taskHttpActions?.addTaskComment ? () => taskHttpActions.addTaskComment!(taskId, body) : undefined,
    );

  const addTaskChecklistItem = (taskId: string, label: string) =>
    executeTaskSocketAction(
      { type: "checklist:add", taskId, payload: { label } },
      taskHttpActions?.addTaskChecklistItem
        ? () => taskHttpActions.addTaskChecklistItem!(taskId, label)
        : undefined,
    );

  const toggleTaskChecklistItem = (taskId: string, itemId: string) =>
    executeTaskSocketAction(
      { type: "checklist:toggle", taskId, itemId },
      taskHttpActions?.toggleTaskChecklistItem
        ? () => taskHttpActions.toggleTaskChecklistItem!(taskId, itemId)
        : undefined,
    );

  const restoreTask = (taskId: string) =>
    executeTaskSocketAction(
      { type: "restore", taskId },
      taskHttpActions?.restoreTask ? () => taskHttpActions.restoreTask!(taskId) : undefined,
    );

  const unansweredCount = sessions.filter((session) => {
    if (typeof session.unseenCount === "number" && session.unseenCount > 0) {
      return true;
    }
    const sessionMessages = supportMessages[session.sessionId] || [];
    const lastMessage = sessionMessages[sessionMessages.length - 1];
    return lastMessage?.from === "client";
  }).length;

  return {
    isConnected, transport, messages, sendGlobalMessage,
    isSupportConnected, sessions, supportMessages, sendSupportMessage, requestSupportDetails, notifySupportTyping, viewSupportSession, typingUsers, unansweredCount,
    isTasksConnected,
    taskTypingByTask,
    taskPulseByTask,
    taskEventVersion,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    addTaskComment,
    addTaskChecklistItem,
    toggleTaskChecklistItem,
    restoreTask,
    joinTaskRoom,
    leaveTaskRoom,
    sendTaskTyping,
    markTaskSeen,
    threads,
    setThreads,
    threadMessages,
    setThreadMessages,
    threadTypingByThread,
    sendThreadMessage,
    sendThreadTyping,
    toggleThreadReaction,
    markThreadRead,
  };
}

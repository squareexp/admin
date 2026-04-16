"use client";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import {
  Send,
  Phone,
  Video,
  Search,
  Plus,
  Paperclip,
  Smile,
  FileText,
  Settings2,
  X,
  MessageSquare,
  Users,
  PanelRight,
  ChevronLeft,
  MoreVertical,
  Mail,
} from "lucide-react";
import { Global, User, Headphone, Message } from "iconsax-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn, getCookie } from "@/libs/utils";

// TYPE DEFINITIONS
interface GlobalMessage {
  id: string;
  sender: "me" | "server" | "other";
  text: string;
  timestamp: string;
  senderName?: string;
  userId?: string;
}

interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
}

// Support Types
type ChatSession = {
  sessionId: string;
  name?: string;
  email?: string;
  lastSeenAt: string;
  connected: boolean;
  unseenCount?: number;
};

type ChatMessage = {
  id: string;
  sessionId: string;
  from: "client" | "admin";
  text: string;
  timestamp: string;
  adminName?: string;
};

type ViewMode = "global" | "support";

export default function AdminDashboard() {
  const router = useRouter();

  // STATE MANAGEMENT
  const [viewMode, setViewMode] = useState<ViewMode>("global");
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [socketId, setSocketId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Support State
  const [supportSocket, setSupportSocket] = useState<Socket | null>(null);
  const [isSupportConnected, setIsSupportConnected] = useState(false);
  const [adminName, setAdminName] = useState("Support Agent");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [supportMessages, setSupportMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [supportInputValue, setSupportInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const prevSessionIdRef = useRef<string | null>(null);
  
  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingNotifiedRef = useRef<Record<string, boolean>>({}); // Track if we already played sound for this typing session

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supportMessagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Calculate unanswered sessions count
  const unansweredCount = sessions.filter(s => {
    const sessionMsgs = supportMessages[s.sessionId] || [];
    const lastMsg = sessionMsgs[sessionMsgs.length - 1];
    return lastMsg && lastMsg.from === "client";
  }).length;

  // Sound Functions
  const playSound = (type: "sent" | "received" | "typing" | "notification") => {
    try {
      // Use existing sounds, notification uses received sound, typing uses a short beep
      const soundMap: Record<string, string> = {
        sent: "/assets/sounds/message-out.mp3",
        received: "/assets/sounds/message-in.mp3",
        typing: "/assets/sounds/message-in.mp3", // Fallback to message-in for typing
        notification: "/assets/sounds/message-in.mp3" // Fallback to message-in for notification
      };
      const audio = new Audio(soundMap[type]);
      audio.volume = type === "typing" ? 0.2 : type === "notification" ? 1 : 0.8;
      audio.play().catch((err) => console.warn("Audio playback failed:", err));
    } catch (error) {
      console.warn("Audio creation failed:", error);
    }
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch current user
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => setCurrentUser(data))
      .catch((err) => {
        console.log("Auth check:", err);
        router.push("/session/access");
      });
  }, [router]);

  // Fetch admin name for support
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("http://localhost:2222/session/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.name) {
            setAdminName(data.user.name);
          }
        }
      } catch (err) {
        const cookieName = getCookie("admin_name");
        if (cookieName) setAdminName(cookieName);
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.refresh();
      router.push("/session/access");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const addLog = (type: LogEntry["type"], message: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const addMessage = (msg: GlobalMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  };

  // Global Chat Socket
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io("http://localhost:1010", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setTransport(newSocket.io.engine.transport.name);
      setSocketId(newSocket.id || "");
      addLog("success", `Connected with ID: ${newSocket.id}`);

      newSocket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
        addLog("info", `Transport upgraded to: ${transport.name}`);
      });
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      addLog("error", `Disconnected: ${reason}`);
    });

    newSocket.on("messageHistory", (history: any[]) => {
      const formattedMessages = history.map((m: any) => ({
        id: m.id,
        sender: m.userId === currentUser.id ? "me" : "other",
        text: m.content || m.text,
        timestamp: new Date(m.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderName: m.username,
        userId: m.userId,
      })) as GlobalMessage[];
      setMessages(formattedMessages);
      addLog("info", `Loaded ${history.length} messages from history`);
    });

    newSocket.on("newMessage", (data: any) => {
      const isMe = data.userId === currentUser.id;
      const newMessage: GlobalMessage = {
        id: data.id || Math.random().toString(36),
        sender: isMe ? "me" : "other",
        text: data.text,
        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        ),
        senderName: data.username,
        userId: data.userId,
      };

      addMessage(newMessage);
      if (!isMe) playSound("received");
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Support Socket
  useEffect(() => {
    const token = getCookie("jwt");
    const newSocket = io("http://localhost:2222", {
      transports: ["websocket"],
      auth: { token }
    });

    newSocket.on("connect", () => {
      setIsSupportConnected(true);
      newSocket.emit("admin:join", { 
        adminKey: "SUPER_SECRET",
        adminName 
      });
    });

    newSocket.on("disconnect", () => setIsSupportConnected(false));

    setSupportSocket(newSocket);

    return () => {
      if (prevSessionIdRef.current) {
        newSocket.emit("admin:leave_session", { sessionId: prevSessionIdRef.current });
      }
      newSocket.disconnect();
    };
  }, [adminName]);

  // Re-emit admin:join when adminName changes
  useEffect(() => {
    if (supportSocket && isSupportConnected && adminName !== "Support Agent") {
      supportSocket.emit("admin:join", { 
        adminKey: "SUPER_SECRET",
        adminName 
      });
    }
  }, [adminName, supportSocket, isSupportConnected]);

  // Support Socket Event Listeners
  useEffect(() => {
    if (!supportSocket) return;

    supportSocket.on("admin:connected", () => {
      addLog("success", "Support system connected");
    });

    supportSocket.on("admin:initial_state", (data: { sessions: ChatSession[] }) => {
      setSessions(data.sessions.sort((a, b) => 
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
      ));
    });

    supportSocket.on("admin:session_updated", (session: ChatSession) => {
      setSessions((prev) => {
        const existing = prev.find((s) => s.sessionId === session.sessionId);
        if (existing) {
          return prev.map((s) => s.sessionId === session.sessionId ? { ...s, ...session } : s)
            .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
        }
        return [session, ...prev];
      });
    });

    supportSocket.on("admin:new_message", (message: ChatMessage) => {
      setSupportMessages((prev) => {
        const sessionMsgs = prev[message.sessionId] || [];
        if (sessionMsgs.some(m => m.id === message.id)) return prev;
        return { ...prev, [message.sessionId]: [...sessionMsgs, message] };
      });

      // Play sound for new client messages
      if (message.from === "client") {
        playSound("notification");
      }

      setSessions(prev => {
        const session = prev.find(s => s.sessionId === message.sessionId);
        if (!session) {
          return [{
            sessionId: message.sessionId,
            lastSeenAt: message.timestamp,
            connected: true,
          }, ...prev];
        }
        const updatedSession = { ...session, lastSeenAt: message.timestamp };
        return [updatedSession, ...prev.filter(s => s.sessionId !== message.sessionId)];
      });

      scrollSupportToBottom();
    });

    supportSocket.on("admin:history", (data: { sessionId: string; messages: ChatMessage[] }) => {
      setSupportMessages((prev) => ({
        ...prev,
        [data.sessionId]: data.messages
      }));
      setTimeout(scrollSupportToBottom, 100);
    });

    // Typing indicators
    supportSocket.on("admin:typing", (data: { sessionId: string; typing: boolean; from: string }) => {
      if (data.from === "client") {
        setTypingUsers(prev => ({ ...prev, [data.sessionId]: data.typing }));
        
        // Play typing sound ONCE when typing starts (not already notified)
        if (data.typing && !typingNotifiedRef.current[data.sessionId]) {
          playSound("typing");
          typingNotifiedRef.current[data.sessionId] = true;
        }
        
        // Reset notification flag when typing stops
        if (!data.typing) {
          typingNotifiedRef.current[data.sessionId] = false;
        }
        
        if (data.typing) {
          if (typingTimeoutRef.current[data.sessionId]) {
            clearTimeout(typingTimeoutRef.current[data.sessionId]);
          }
          typingTimeoutRef.current[data.sessionId] = setTimeout(() => {
            setTypingUsers(prev => ({ ...prev, [data.sessionId]: false }));
            typingNotifiedRef.current[data.sessionId] = false; // Reset on timeout too
          }, 3000);
        }
      }
    });

    return () => {
      supportSocket.off("admin:connected");
      supportSocket.off("admin:initial_state");
      supportSocket.off("admin:session_updated");
      supportSocket.off("admin:new_message");
      supportSocket.off("admin:history");
      supportSocket.off("admin:typing");
    };
  }, [supportSocket]);

  // Session view/leave handling
  useEffect(() => {
    if (!supportSocket) return;
    
    if (prevSessionIdRef.current && prevSessionIdRef.current !== activeSessionId) {
      supportSocket.emit("admin:leave_session", { sessionId: prevSessionIdRef.current });
    }

    if (activeSessionId) {
      supportSocket.emit("admin:view_session", { 
        sessionId: activeSessionId,
        adminName 
      });
      
      if (!supportMessages[activeSessionId]) {
        supportSocket.emit("admin:get_history", { sessionId: activeSessionId });
      }
    }

    prevSessionIdRef.current = activeSessionId;
  }, [activeSessionId, supportSocket, adminName, supportMessages]);

  // Scroll functions
  const scrollSupportToBottom = () => {
    supportMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    scrollSupportToBottom();
  }, [supportMessages, activeSessionId]);

  // Handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && socketRef.current) {
      socketRef.current.emit("newMessage", { text: inputValue });
      setInputValue("");
      playSound("sent");
    }
  };

  const handleSendSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInputValue.trim() || !activeSessionId || !supportSocket) return;

    supportSocket.emit("admin:reply", {
      sessionId: activeSessionId,
      text: supportInputValue
    });
    
    supportSocket.emit("admin:typing", { sessionId: activeSessionId, typing: false });
    setSupportInputValue("");
    playSound("sent");
  };

  const handleRequestDetails = () => {
    if (!activeSessionId || !supportSocket) return;

    supportSocket.emit("admin:reply", {
      sessionId: activeSessionId,
      text: "Requested contact details",
      type: "form_request"
    });
    
    playSound("sent");
  };

  const handleSupportInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSupportInputValue(value);

    if (supportSocket && activeSessionId) {
      supportSocket.emit("admin:typing", { sessionId: activeSessionId, typing: true });

      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }

      adminTypingTimeoutRef.current = setTimeout(() => {
        supportSocket.emit("admin:typing", { sessionId: activeSessionId, typing: false });
      }, 1500);
    }
  };

  const handleCreateRoom = (type: "public" | "private") => {
    const name = prompt("Enter room name:");
    if (name && socketRef.current) {
      socketRef.current.emit("createRoom", { name, type }, (response: any) => {
        if (response.success) {
          addLog("success", `Created room: ${response.room.name}`);
          setIsCreateDialogOpen(false);
        } else {
          addLog("error", `Failed to create room: ${response.error || "Unknown error"}`);
        }
      });
    }
  };

  const filteredSessions = sessions.filter(s => 
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.sessionId.includes(searchQuery) ||
     s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSession = sessions.find(s => s.sessionId === activeSessionId);
  const currentSupportMessages = activeSessionId ? (supportMessages[activeSessionId] || []) : [];
  const isClientTyping = activeSessionId ? typingUsers[activeSessionId] : false;

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <div className="w-20 bg-dark-800 flex flex-col items-center py-6 border-r border-dark-700 gap-4">
        {/* User Profile / Logout */}
        <div className="relative group cursor-pointer" onClick={handleLogout}>
          <div className="h-12 w-12 bg-brand-yellow rounded-xl flex items-center justify-center text-black font-bold text-xl hover:bg-red-500 transition-colors">
            {currentUser ? (
              <span className="uppercase">
                {currentUser.username.substring(0, 2)}
              </span>
            ) : (
              <User color="black" variant="Bulk" size={24} />
            )}
          </div>
          <div className="absolute left-[110%] top-1/2 -translate-y-1/2 bg-black px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-dark-700">
            <p className="font-bold text-brand-yellow">{currentUser?.username}</p>
            <p className="text-gray-400">Click to logout</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full px-2">
          {/* Global Chat */}
          <button
            onClick={() => setViewMode("global")}
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all mx-auto relative",
              viewMode === "global" 
                ? "bg-brand-yellow text-black" 
                : "bg-dark-700 hover:bg-dark-600 text-gray-400"
            )}
          >
            <Global variant="Bulk" size={22} />
          </button>

          {/* Support Chat */}
          <button
            onClick={() => setViewMode("support")}
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all mx-auto relative",
              viewMode === "support" 
                ? "bg-brand-yellow text-black" 
                : "bg-dark-700 hover:bg-dark-600 text-gray-400"
            )}
          >
            <Headphone variant="Bulk" size={22} />
            {unansweredCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full  flex items-center justify-center animate-pulse">
                {unansweredCount}
              </span>
            )}
          </button>

          <div className="w-8 h-px bg-dark-700 mx-auto my-2" />

          <button className="h-12 w-12 rounded-2xl border border-dashed border-gray-600 text-gray-500 flex items-center justify-center hover:bg-dark-700 hover:text-brand-yellow mx-auto transition-colors">
            <Settings2 size={20} />
          </button>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-12 w-12 bg-brand-yellow rounded-full  text-black flex items-center justify-center hover:bg-[#ccec40] transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* Global Chat View */}
      <AnimatePresence mode="wait">
        {viewMode === "global" && (
          <motion.div 
            key="global"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex"
          >
            {/* Chat List Sidebar */}
            <AnimatePresence>
              {(!isMembersPanelOpen || !isMobile) && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-dark-900 border-r border-dark-700 flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <div className="p-6 min-w-70">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-dark-800 text-sm text-white rounded-full  pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-yellow placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 p-2 space-y-2 min-w-70 no-scrollbar">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-800 cursor-pointer transition-colors group border border-brand-yellow/20">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full  flex items-center justify-center text-sm font-medium bg-brand-yellow text-black">
                          <Global color="black" variant="Bulk" size={24} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-gray-200">Global</h3>
                        <p className="text-xs text-gray-500 truncate">The Public Chat</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-dark-900 relative min-w-0">
              <div className="h-20 border-b border-dark-700 flex items-center justify-between px-6 bg-dark-900/95 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">Global Chat</h2>
                  {isConnected && <span className="h-2 w-2 rounded-full  bg-green-500 animate-pulse" />}
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-10 w-10 rounded-full  bg-dark-800 hover:bg-dark-700 text-brand-yellow flex items-center justify-center transition-colors">
                    <Phone size={18} />
                  </button>
                  <button className="h-10 w-10 rounded-full  bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                    <Video size={18} />
                  </button>
                  <div className="w-px h-6 bg-dark-700 mx-1" />
                  <button
                    onClick={() => setIsMembersPanelOpen(!isMembersPanelOpen)}
                    className={cn(
                      "h-10 w-10 rounded-full  transition-colors flex items-center justify-center",
                      isMembersPanelOpen ? "bg-brand-yellow text-black" : "bg-dark-800 text-gray-400"
                    )}
                  >
                    <PanelRight size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                    <p>No messages yet.</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex gap-4", msg.sender === "me" && "flex-row-reverse")}
                  >
                    {msg.sender !== "me" && (
                      <div className="h-10 w-10 rounded-full  bg-dark-700 shrink-0 flex items-center justify-center text-xs text-white uppercase font-bold">
                        {msg.senderName?.[0] || "U"}
                      </div>
                    )}
                    <div className={cn("max-w-[70%] space-y-1", msg.sender === "me" && "items-end flex flex-col")}>
                      {msg.sender !== "me" && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-white">{msg.senderName}</span>
                          <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl px-5 py-3 text-sm leading-relaxed",
                        msg.sender === "me"
                          ? "bg-brand-yellow text-black rounded-tr-sm"
                          : "bg-dark-800 text-gray-200 rounded-tl-sm"
                      )}>
                        {msg.text}
                      </div>
                      {msg.sender === "me" && <span className="text-[10px] text-gray-500">{msg.timestamp}</span>}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 bg-dark-900 z-10">
                <div className="bg-dark-800 rounded-3xl ring ring-brand-yellow/30 p-2 flex items-center gap-2">
                  <button 
                    onClick={handleRequestDetails}
                    title="Request Contact Details"
                    className="h-10 w-10 rounded-full  hover:bg-dark-700 text-gray-400 hover:text-brand-yellow flex items-center justify-center transition-colors"
                  >
                    <Mail size={20} />
                  </button>
                  <button className="h-10 w-10 rounded-full  hover:bg-dark-700 text-gray-400 flex items-center justify-center">
                    <Paperclip size={20} />
                  </button>
                  <form onSubmit={handleSendMessage} className="flex-1">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Write a message..."
                      className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none px-2"
                    />
                  </form>
                  <div className="flex ring-1 ring-brand-yellow/10 rounded-3xl bg-black items-center gap-1 relative">
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-14 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-dark-700"
                        >
                          <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={(emojiData) => {
                              setInputValue((prev) => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn("h-10 w-10 rounded-full  flex items-center justify-center", showEmojiPicker ? "text-brand-yellow" : "text-gray-400")}
                    >
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!isConnected || !inputValue.trim()}
                      className="h-10 w-10 rounded-full  hover:bg-dark-700 text-gray-400 hover:text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Info Panel */}
            <AnimatePresence>
              {isMembersPanelOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-dark-900 border-l border-dark-700 flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <div className="p-6 border-b border-dark-700 min-w-[320px]">
                    <h3 className="text-lg font-bold text-white mb-4">Members</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full  bg-brand-yellow text-black font-bold flex items-center justify-center text-xs uppercase">
                          {currentUser?.username?.[0] || "Y"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {currentUser ? `${currentUser.username} (You)` : "Loading..."}
                          </span>
                          <span className="text-xs text-green-500">Online</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-dark-700">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">System Status</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Connection</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full ", isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                              {isConnected ? "Online" : "Offline"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Transport</span>
                            <span className="text-xs font-mono text-blue-400">{transport}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="flex-1 overflow-y-auto p-4 min-w-[320px] no-scrollbar">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                      <FileText size={16} /> Logs
                    </h3>
                    <div className="space-y-2 font-mono text-[10px]">
                      {logs.map((log) => (
                        <div key={log.id} className="bg-dark-800 p-2 rounded border-l-2 border-dark-700">
                          <div className="flex justify-between text-gray-500 mb-1">
                            <span className={cn(
                              log.type === "success" ? "text-green-500" : 
                              log.type === "error" ? "text-red-500" : "text-blue-500"
                            )}>{log.type}</span>
                            <span>{log.timestamp}</span>
                          </div>
                          <p className="text-gray-300 break-all">{log.message}</p>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Support View */}
        {viewMode === "support" && (
          <motion.div 
            key="support"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex"
          >
            {/* Sessions Sidebar */}
            <div className={cn(
              "w-80 bg-dark-900 border-r border-dark-700 flex flex-col transition-all duration-300",
              activeSessionId ? "hidden md:flex" : "flex"
            )}>
              <div className="p-4 border-b border-dark-700 flex items-center justify-between">
                <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Headphone variant="Bulk" className="text-brand-yellow" size={24} />
                  Support
                </h1>
                <div className={cn("w-3 h-3 rounded-full ", isSupportConnected ? "bg-green-500" : "bg-red-500")} />
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search visitors..." 
                    className="w-full bg-dark-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-yellow outline-none text-white placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No active sessions</div>
                ) : (
                  filteredSessions.map(session => {
                    const sessionMsgs = supportMessages[session.sessionId] || [];
                    const lastMsg = sessionMsgs[sessionMsgs.length - 1];
                    const isUnanswered = lastMsg && lastMsg.from === "client";
                    
                    return (
                      <div 
                        key={session.sessionId}
                        onClick={() => setActiveSessionId(session.sessionId)}
                        className={cn(
                          "p-4 border-b border-dark-700 hover:bg-dark-800 cursor-pointer transition-colors flex gap-3 items-start relative",
                          activeSessionId === session.sessionId && "bg-dark-800",
                          isUnanswered && "border-l-2 border-l-brand-yellow"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full  bg-gradient-to-br from-brand-yellow to-orange-500 text-black flex items-center justify-center font-bold text-sm shrink-0">
                          {session.name ? session.name.charAt(0).toUpperCase() : <User size={16} color="black" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className={cn(
                              "font-medium truncate text-sm",
                              activeSessionId === session.sessionId ? "text-brand-yellow" : "text-gray-200"
                            )}>
                              {session.name || "Visitor"}
                            </h3>
                            <span className="text-[10px] text-gray-500">
                              {new Date(session.lastSeenAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {session.email || `ID: ${session.sessionId.slice(0, 8)}...`}
                          </p>
                          {session.connected && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full  absolute bottom-4 right-4" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Support Chat Area */}
            <div className={cn(
              "flex-1 flex flex-col bg-dark-900 relative",
              !activeSessionId ? "hidden md:flex" : "flex"
            )}>
              {activeSessionId ? (
                <>
                  {/* Chat Header */}
                  <div className="h-20 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveSessionId(null)}
                        className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-dark-800 rounded-full "
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-full  bg-gradient-to-br from-brand-yellow to-orange-500 text-black flex items-center justify-center font-bold text-sm">
                        {activeSession?.name?.[0]?.toUpperCase() || "V"}
                      </div>
                      <div>
                        <h2 className="font-bold text-white">{activeSession?.name || "Visitor"}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {activeSession?.connected ? (
                            <span className="text-green-500 flex items-center gap-1">● Online</span>
                          ) : (
                            <span>Last seen: {new Date(activeSession?.lastSeenAt || "").toLocaleString()}</span>
                          )}
                          <span className="text-gray-600">|</span>
                          <span>{activeSession?.email || "No email"}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-dark-800 rounded-full  text-gray-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-dark-800 text-gray-500 px-3 py-1 rounded-full ">
                        Session Started: {new Date(activeSession?.lastSeenAt || "").toLocaleDateString()}
                      </span>
                    </div>
                    
                    {currentSupportMessages.map((msg) => {
                      const isMe = msg.from === "admin";
                      return (
                        <div 
                          key={msg.id} 
                          className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed",
                            isMe 
                              ? "bg-brand-yellow text-black rounded-br-none" 
                              : "bg-dark-800 text-gray-200 rounded-bl-none"
                          )}>
                            <p>{msg.text}</p>
                            <div className={cn(
                              "text-[10px] mt-2 text-right opacity-70",
                              isMe ? "text-black/60" : "text-gray-500"
                            )}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {isClientTyping && (
                      <div className="flex w-full mb-4 justify-start">
                        <div className="bg-dark-800 text-gray-200 rounded-2xl rounded-bl-none p-4">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-brand-yellow rounded-full  animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-brand-yellow rounded-full  animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-brand-yellow rounded-full  animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={supportMessagesEndRef} />
                  </div>

                  {/* Input */}
          <div className="p-6 bg-dark-900 z-10">
                <div className="bg-dark-800 rounded-3xl ring ring-brand-yellow/30 p-2 flex items-center gap-2">
                  <button className="h-10 w-10 rounded-full  hover:bg-dark-700 text-gray-400 flex items-center justify-center">
                    <Paperclip size={20} />
                  </button>
                  <form onSubmit={handleSendSupportMessage} className="flex-1">
                    <input
                      type="text"
                      value={supportInputValue}
                      onChange={(e) => setSupportInputValue(e.target.value)}
                      placeholder="Write a message..."
                      className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none px-2"
                    />
                  </form>
                  <div className="flex ring-1 ring-brand-yellow/10 rounded-3xl bg-black items-center gap-1 relative">
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-14 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-dark-700"
                        >
                          <EmojiPicker
                            theme={Theme.DARK}
                            onEmojiClick={(emojiData) => {
                              setSupportInputValue((prev) => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn("h-10 w-10 cursor-pointer rounded-full  flex items-center justify-center", showEmojiPicker ? "text-brand-yellow" : "text-gray-400")}
                    >
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendSupportMessage}
                      disabled={!supportInputValue.trim()}
                      className="h-10 w-10 cursor-pointer rounded-full  hover:bg-dark-700 text-gray-400 hover:text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                  <div className="w-24 h-24 bg-dark-800 rounded-full  flex items-center justify-center mb-6">
                    <Message size={48} className="text-gray-600" variant="Bulk" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">Select a Conversation</h3>
                  <p className="max-w-xs text-center text-sm">Choose a visitor from the sidebar to start chatting or view their history.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <AnimatePresence>
        {isCreateDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create New</h2>
                <button
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="h-8 w-8 rounded-full  bg-dark-800 hover:bg-dark-700 text-gray-400 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={() => handleCreateRoom("public")}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 1)" }}
                  className="w-full p-4 rounded-2xl bg-dark-800 border border-transparent hover:border-brand-yellow/50 transition-colors group text-left flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full  bg-brand-yellow/10 text-brand-yellow flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-black transition-colors">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">New Room</h3>
                    <p className="text-xs text-gray-500">Create a public room</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => handleCreateRoom("private")}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 1)" }}
                  className="w-full p-4 rounded-2xl bg-dark-800 border border-transparent hover:border-brand-yellow/50 transition-colors group text-left flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full  bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">New Private Room</h3>
                    <p className="text-xs text-gray-500">Create a group for your team</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

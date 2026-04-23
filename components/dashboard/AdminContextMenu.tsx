"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Category,
  MessageText1,
  ReceiptSquare,
  DocumentText1,
  DirectInbox,
  Profile2User,
  Chart21,
  TaskSquare,
  WalletMoney,
  Setting2,
  Logout,
  Refresh,
  VolumeHigh,
  VolumeSlash,
  InfoCircle,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import type { AdminSection } from "@/lib/admin-types";

type IconsaxVariant = "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
type IconsaxIcon = React.ComponentType<{
  size?: number | string;
  color?: string;
  variant?: IconsaxVariant;
  className?: string;
}>;

interface MenuItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: IconsaxIcon;
  danger?: boolean;
  separator?: boolean;
  children?: MenuItem[];
  action?: () => void;
}

interface AdminContextMenuProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void | Promise<void>;
  onRefresh: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  canViewBillings: boolean;
  userName?: string;
}

export function AdminContextMenu({
  activeSection,
  onNavigate,
  onLogout,
  onRefresh,
  soundEnabled,
  onToggleSound,
  canViewBillings,
  userName,
}: AdminContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [submenu, setSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const playMenuSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/received.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => undefined);
    } catch { /* silent */ }
  }, []);

  const openMenu = useCallback((e: MouseEvent) => {
    // If another component (like Radix ContextMenu in Invoice) already handled it
    if (e.defaultPrevented) return;

    e.preventDefault();

    // Don't override right-click on inputs/textareas
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
      return;
    }

    const x = Math.min(e.clientX, window.innerWidth - 240);
    const y = Math.min(e.clientY, window.innerHeight - 400);

    setPosition({ x, y });
    setIsOpen(true);
    setSubmenu(null);
    playMenuSound();
  }, [playMenuSound]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setSubmenu(null);
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", openMenu);
    return () => document.removeEventListener("contextmenu", openMenu);
  }, [openMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  if (!isOpen) return null;

  const navigateTo = (section: AdminSection) => {
    onNavigate(section);
    closeMenu();
  };

  const sections: Array<{ key: AdminSection; label: string; icon: IconsaxIcon }> = [
    { key: "dashboard", label: "Dashboard", icon: Category },
    { key: "messages", label: "Messages", icon: MessageText1 },
    { key: "invoice", label: "Invoice", icon: ReceiptSquare },
    { key: "mail", label: "Mail", icon: DirectInbox },
    { key: "report", label: "Reports", icon: DocumentText1 },
    { key: "team", label: "Team", icon: Profile2User },
    { key: "analytics", label: "Analytics", icon: Chart21 },
    { key: "tasks", label: "Tasks", icon: TaskSquare },
  ];

  if (canViewBillings) {
    sections.push({ key: "billings", label: "Billings", icon: WalletMoney });
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-[220px] rounded-[14px] border border-white/12 bg-[#0c0f18]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] py-1.5 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.x, top: position.y }}
    >
      {userName ? (
        <div className="px-3 py-2 border-b border-white/8 mb-1">
          <p className="text-[11px] font-medium text-white/80">{userName}</p>
          <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">Square Admin</p>
        </div>
      ) : null}

      <MenuGroup>
        <MenuItemComponent
          icon={Category}
          label="Dashboard"
          shortcut="⌘1"
          active={activeSection === "dashboard"}
          onClick={() => navigateTo("dashboard")}
        />
        <MenuItemComponent
          icon={TaskSquare}
          label="Tasks"
          shortcut="⌘2"
          active={activeSection === "tasks"}
          onClick={() => navigateTo("tasks")}
        />
        <MenuItemComponent
          icon={MessageText1}
          label="Messages"
          shortcut="⌘3"
          active={activeSection === "messages"}
          onClick={() => navigateTo("messages")}
        />

        <div
          className="relative"
          onMouseEnter={() => setSubmenu("navigate")}
          onMouseLeave={() => setSubmenu(null)}
        >
          <MenuItemComponent
            icon={DocumentText1}
            label="Navigate"
            hasSubmenu
            onClick={() => setSubmenu(submenu === "navigate" ? null : "navigate")}
          />
          {submenu === "navigate" && (
            <div
              ref={submenuRef}
              className="absolute left-full top-0 ml-1 w-[180px] rounded-[12px] border border-white/12 bg-[#0c0f18]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] py-1.5"
            >
              {sections.map((section) => (
                <MenuItemComponent
                  key={section.key}
                  icon={section.icon}
                  label={section.label}
                  active={activeSection === section.key}
                  onClick={() => navigateTo(section.key)}
                />
              ))}
            </div>
          )}
        </div>
      </MenuGroup>

      <MenuSeparator />

      <MenuGroup>
        <MenuItemComponent
          icon={Refresh}
          label="Refresh data"
          shortcut="⌘R"
          onClick={() => { onRefresh(); closeMenu(); }}
        />
        <MenuItemComponent
          icon={soundEnabled ? VolumeHigh : VolumeSlash}
          label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          onClick={() => { onToggleSound(); closeMenu(); }}
        />
      </MenuGroup>

      <MenuSeparator />

      <MenuGroup>
        <MenuItemComponent
          icon={Setting2}
          label="Settings"
          shortcut="⌘,"
          active={activeSection === "settings"}
          onClick={() => navigateTo("settings")}
        />
        <MenuItemComponent
          icon={Logout}
          label="Log out"
          shortcut="⇧⌘Q"
          danger
          onClick={() => { onLogout(); closeMenu(); }}
        />
      </MenuGroup>
    </div>
  );
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-0.5">{children}</div>;
}

function MenuSeparator() {
  return <div className="my-1 mx-3 h-px bg-white/8" />;
}

function MenuItemComponent({
  icon: Icon,
  label,
  shortcut,
  active,
  danger,
  hasSubmenu,
  onClick,
}: {
  icon?: IconsaxIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  danger?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-[7px] text-left text-[12px] transition-colors",
        danger
          ? "text-rose-400 hover:bg-rose-500/10"
          : active
            ? "text-[var(--sq-brand-action)] bg-[rgba(205,255,4,0.06)]"
            : "text-white/70 hover:bg-white/4 hover:text-white",
      )}
    >
      {Icon ? (
        <Icon
          size={14}
          color="currentColor"
          variant="Linear"
          className="shrink-0"
        />
      ) : null}
      <span className="flex-1">{label}</span>
      {shortcut ? (
        <span className="text-[10px] text-white/25 font-mono">{shortcut}</span>
      ) : null}
      {hasSubmenu ? (
        <svg className="h-3 w-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ) : null}
    </button>
  );
}

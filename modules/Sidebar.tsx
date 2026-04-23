"use client";

import React from "react";
import {
  Activity,
  Category,
  Chart21,
  DirectInbox,
  DocumentText1,
  Global,
  Headphone,
  MessageText1,
  Profile2User,
  ReceiptSquare,
  Setting2,
  TaskSquare,
  WalletMoney,
} from "iconsax-react";
import { cn } from "@/lib/utils";
import type {
  AdminSection,
  MessageSection,
} from "@/lib/admin-types";
import Image from "next/image";

interface SidebarProps {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  messageSection: MessageSection;
  setMessageSection: (section: MessageSection) => void;
  unansweredCount: number;
  canViewBillings: boolean;
}

type NavItem = {
  key: AdminSection;
  label: string;
  hint: string;
  icon: React.ComponentType<{
    color?: string;
    size?: number | string;
    variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
    className?: string;
  }>;
};

const primaryNav: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    hint: "Command center",
    icon: Category,
  },
  {
    key: "messages",
    label: "Messages",
    hint: "Team and support",
    icon: MessageText1,
  },
  {
    key: "invoice",
    label: "Invoice",
    hint: "Billing engine",
    icon: ReceiptSquare,
  },
  {
    key: "mail",
    label: "Mail",
    hint: "Client mailing",
    icon: DirectInbox,
  },
  {
    key: "report",
    label: "Report",
    hint: "Issues and client cases",
    icon: DocumentText1,
  },
  {
    key: "team",
    label: "Team Management",
    hint: "Roles and operations",
    icon: Profile2User,
  },
  {
    key: "analytics",
    label: "Analytics",
    hint: "Deep performance",
    icon: Chart21,
  },
  {
    key: "tasks",
    label: "Tasks",
    hint: "Collaboration tracker",
    icon: TaskSquare,
  },
];

const messageNav = [
  {
    key: "team" as const,
    label: "Team",
    icon: Global,
  },
  {
    key: "support" as const,
    label: "Support",
    icon: Headphone,
  },
  {
    key: "inbox" as const,
    label: "Inbox",
    icon: DirectInbox,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  messageSection,
  setMessageSection,
  unansweredCount,
  canViewBillings,
}) => {
  return (
    <aside className="flex h-full w-[276px] shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(14,16,23,0.98),rgba(7,9,14,0.92))] px-3 py-3">
      <div className="mb-5">
        <div className="flex items-center gap-3">
         
          <div className="min-w-0 flex items-center justify-center">
          <Image src="/logo.svg" className="invert mix-blend-screen" alt="Logo" width={100} height={100} /> <hr className="divider-dashed w-[140px] mx-2" />
          </div>
        </div>
      </div>
      <hr className="border-white/10" />

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;

            return (
              <div key={item.key} className="rounded-[24px] border border-transparent">
                <button
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-[22px] border px-3.5 py-2.5 text-left transition-all",
                    isActive
                      ? "border-[rgba(205,255,4,0.18)] bg-[linear-gradient(180deg,rgba(205,255,4,0.08),rgba(205,255,4,0.03))]"
                      : "border-white/8 bg-white/[0.02] hover:border-white/16 hover:bg-white/4",
                  )}
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border transition-colors",
                      isActive
                        ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.14)] text-[var(--sq-brand-action)]"
                        : "border-white/10 bg-white/[0.03] text-white/55",
                    )}
                  >
                    <Icon variant="Bulk" size={18} color="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-[13px] font-semibold", isActive ? "text-white" : "text-white/85")}>
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-white/45">{item.hint}</p>
                  </div>
                  {item.key === "messages" && unansweredCount > 0 ? (
                    <span className="rounded-full bg-[var(--sq-brand-action)] px-2 py-0.5 text-[10px] font-semibold text-[var(--sq-brand-black)]">
                      {unansweredCount}
                    </span>
                  ) : null}
                </button>

                {item.key === "messages" && activeSection === "messages" ? (
                  <div className="ml-4 mt-1.5 space-y-1 border-l border-dashed border-white/12 pl-3">
                    {messageNav.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isActiveMessage = messageSection === subItem.key;

                      return (
                        <button
                          key={subItem.key}
                          onClick={() => setMessageSection(subItem.key)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors",
                            isActiveMessage
                              ? "bg-white/[0.06] text-white"
                              : "text-white/55 hover:bg-white/[0.03] hover:text-white/80",
                          )}
                        >
                          <SubIcon variant="Bulk" size={16} color="currentColor" />
                          <span className="text-xs">{subItem.label}</span>
                          {subItem.key === "support" && unansweredCount > 0 ? (
                            <span className="ml-auto rounded-full border border-[rgba(205,255,4,0.28)] px-2 py-0.5 text-[10px] text-sq-brand-action">
                              {unansweredCount}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {canViewBillings ? (
            <button
              onClick={() => setActiveSection("billings")}
              className={cn(
                "group relative mt-2.5 flex w-full items-center gap-3 rounded-[22px] border px-3.5 py-2.5 text-left transition-all",
                activeSection === "billings"
                  ? "border-[rgba(205,255,4,0.18)] bg-[linear-gradient(180deg,rgba(205,255,4,0.08),rgba(205,255,4,0.03))]"
                  : "border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/4",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border transition-colors",
                  activeSection === "billings"
                    ? "border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.14)] text-[var(--sq-brand-action)]"
                    : "border-white/10 bg-white/3 text-white/55",
                )}
              >
                <WalletMoney variant="Bulk" size={18} color="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">Billings</p>
                <p className="truncate text-[11px] text-white/45">Super admin renewal desk</p>
              </div>
            </button>
          ) : null}
        </div>
      </div>

      <button
        onClick={() => setActiveSection("settings")}
       
      >
        <div
          className={cn(
            "mt-3 flex items-center gap-2 rounded-3xl border bg-black/20 px-4 py-4  font-semibold",
            activeSection === "settings"
              ? "border-[rgba(205,255,4,0.24)] text-sq-brand-action"
              : "border-white/10 text-white/58",
          )}
        >
          <Setting2 variant="Bulk" size={16} color="currentColor" />
          Settings
        </div>
      </button>
    </aside>
  );
};

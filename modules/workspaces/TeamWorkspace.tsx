"use client";

import {
  DirectInbox,
  DocumentText1,
  NotificationBing,
} from "iconsax-react";
import {
  SurfaceCard,
  WorkspaceStateCard,
} from "@/components/dashboard";
import type {
  AdminWorkspaceSnapshot,
  CreateAdminTaskInput,
  UpdateAdminTeamStatusInput,
} from "@/lib/admin-types";
import { formatDateTime } from "./workspace-utils";

export function TeamWorkspace({
  data,
  onCreateTaskForMember,
  onPromoteMember,
  onUpdateMemberStatus,
  onRequestProgress,
  activeMemberId,
  actionError,
}: {
  data: AdminWorkspaceSnapshot | null;
  onCreateTaskForMember: (payload: CreateAdminTaskInput) => Promise<unknown>;
  onPromoteMember: (
    memberId: string,
    nextRole: "ADMIN" | "SUPER_ADMIN",
  ) => Promise<unknown>;
  onUpdateMemberStatus: (
    memberId: string,
    payload: UpdateAdminTeamStatusInput,
  ) => Promise<unknown>;
  onRequestProgress: (
    memberId: string,
    memberName: string,
  ) => Promise<unknown>;
  activeMemberId: string | null;
  actionError: string | null;
}) {
  if (!data) {
    return (
      <WorkspaceStateCard
        title="Loading team management"
        description="Team roster, role data, and operational controls are syncing from the admin backend."
      />
    );
  }

  const getNextRole = (role: string) => {
    if (role === "USER") {
      return "ADMIN" as const;
    }

    if (role === "ADMIN") {
      return "SUPER_ADMIN" as const;
    }

    return null;
  };

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[1.2fr_0.8fr]">
      <SurfaceCard eyebrow="Team" title="Role and account management">
        {actionError ? (
          <div className="mb-3 rounded-[16px] border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3.5 py-2.5 text-xs text-[#ffb49d]">
            {actionError}
          </div>
        ) : null}

        <div className="space-y-3">
          {data.team.map((member) => {
            const nextRole = getNextRole(member.role);
            const isPending = activeMemberId === member.id;

            return (
              <div key={member.id} className="rounded-[22px] border border-white/10 bg-black/20 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="mt-1 text-sm text-white/55">{member.email}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {member.role}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    disabled={isPending || !nextRole}
                    onClick={() => {
                      if (!nextRole) {
                        return;
                      }
                      void onPromoteMember(member.id, nextRole);
                    }}
                    className="rounded-full border border-[rgba(205,255,4,0.22)] px-3 py-1.5 text-xs text-[var(--sq-brand-action)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isPending ? "Working..." : nextRole ? `Promote to ${nextRole}` : "Top role"}
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      void onCreateTaskForMember({
                        title: `Assign follow-up for ${member.name}`,
                        description: `Create a new operational follow-up for ${member.name} (${member.email}).`,
                        priority: "medium",
                        source: "manual",
                        assigneeId: member.id,
                        assigneeName: member.name,
                        tags: ["team", member.role.toLowerCase()],
                      });
                    }}
                    className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Assign task
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      void onRequestProgress(member.id, member.name);
                    }}
                    className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Ask progress
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      void onUpdateMemberStatus(member.id, member.isActive
                        ? {
                            action: "suspend",
                            durationDays: 7,
                            reason: "Suspended from team dashboard controls.",
                          }
                        : { action: "activate" });
                    }}
                    className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/60 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isPending ? "Working..." : member.isActive ? "Suspend 7d" : "Activate"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-white/35">
                  Joined {formatDateTime(member.createdAt)} · {member.isActive ? "active" : "suspended"}
                </p>
              </div>
            );
          })}
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Notifications" title="Progress request channels">
        <div className="space-y-3">
          <div className="rounded-[20px] border border-white/10 bg-black/20 p-3.5">
            <p className="text-sm font-medium text-white">One action, three channels</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              The management flow is prepared for WhatsApp, email, and in-system delivery from a single progress request button.
            </p>
          </div>
          <div className="rounded-[20px] border border-dashed border-white/12 p-3.5">
            <div className="flex items-center gap-3 text-sm text-white/65">
              <NotificationBing variant="Bulk" size={18} color="currentColor" />
              WhatsApp broadcast adapter
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-white/65">
              <DocumentText1 variant="Bulk" size={18} color="currentColor" />
              Email delivery service
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-white/65">
              <DirectInbox variant="Bulk" size={18} color="currentColor" />
              In-system alert feed
            </div>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

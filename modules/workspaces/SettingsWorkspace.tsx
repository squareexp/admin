"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogoutCurve,
  Setting2,
} from "iconsax-react";
import {
  SurfaceCard,
  WorkspaceStateCard,
} from "@/components/dashboard";
import type {
  AdminEmailRuntimeSnapshot,
  AdminSettingsSnapshot,
  AdminSystemSnapshot,
} from "@/lib/admin-types";
import { formatDateTime, inferImapHostFromSmtpHost } from "./workspace-utils";
import { Switch } from "@/components/ui/switch";

export function SettingsWorkspace({
  settings,
  emailRuntime,
  system,
  isSaving,
  saveError,
  onSave,
  onLogout,
}: {
  settings: AdminSettingsSnapshot | null;
  emailRuntime: AdminEmailRuntimeSnapshot | null;
  system: AdminSystemSnapshot | null;
  isSaving: boolean;
  saveError: string | null;
  onSave: (settings: AdminSettingsSnapshot) => Promise<void>;
  onLogout: () => void;
}) {
  const [draft, setDraft] = useState<AdminSettingsSnapshot | null>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (!settings || !draft) {
    return (
      <WorkspaceStateCard
        title={saveError ? "Settings unavailable" : "Loading settings workspace"}
        description={
          saveError ||
          "SMTP, IMAP, sessions, and integration controls are syncing from backend settings."
        }
      />
    );
  }

  const updateDraft = <Section extends keyof AdminSettingsSnapshot>(
    section: Section,
    patch: Partial<AdminSettingsSnapshot[Section]>,
  ) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [section]: {
          ...(current[section] as object),
          ...patch,
        },
      };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(draft);
  };

  const managedMailMode = true;

  return (
    <form onSubmit={handleSave} className="grid gap-4 overflow-y-auto p-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <SurfaceCard eyebrow="Outbound mail" title="SMTP configuration">
          {managedMailMode ? (
            <div className="mb-3 rounded-[18px] border border-dashed border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.08)] px-3.5 py-2.5 text-xs text-sq-brand-action">
              Square-managed mail mode is active. Host, mailbox user, and password are sourced from server env.
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={draft.smtp.host}
              onChange={(event) => updateDraft("smtp", { host: event.target.value })}
              placeholder="SMTP host"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              type="number"
              value={draft.smtp.port}
              onChange={(event) => updateDraft("smtp", { port: Number(event.target.value) || 0 })}
              placeholder="Port"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.smtp.username}
              onChange={(event) => updateDraft("smtp", { username: event.target.value })}
              placeholder="SMTP username"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.smtp.password}
              onChange={(event) => updateDraft("smtp", { password: event.target.value })}
              placeholder="SMTP password"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.smtp.fromAddress}
              onChange={(event) => updateDraft("smtp", { fromAddress: event.target.value })}
              placeholder="From address"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none md:col-span-2"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-white/65">
            <span>Use secure SMTP transport</span>
            <Switch
              checked={draft.smtp.secure}
              onCheckedChange={(val) => updateDraft("smtp", { secure: val })}
              disabled={managedMailMode}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Mailbox sync" title="IMAP configuration">
          <div className="rounded-[18px] border border-dashed border-white/15 bg-black/20 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3 text-sm text-white/70">
              <span>Use SMTP defaults for IMAP credentials</span>
              <Switch
                checked={draft.imap.useSmtpDefaults}
                onCheckedChange={(val) => updateDraft("imap", { useSmtpDefaults: val })}
                disabled={managedMailMode}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                updateDraft("imap", {
                  host: draft.imap.host || inferImapHostFromSmtpHost(draft.smtp.host),
                  username: draft.smtp.username,
                  password: draft.smtp.password,
                })
              }
              disabled={managedMailMode}
              className="mt-3 rounded-full border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.1)] px-3 py-1 text-xs font-medium text-sq-brand-action"
            >
              Copy SMTP to IMAP
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={draft.imap.host}
              onChange={(event) => updateDraft("imap", { host: event.target.value })}
              placeholder="IMAP host"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              type="number"
              value={draft.imap.port}
              onChange={(event) => updateDraft("imap", { port: Number(event.target.value) || 0 })}
              placeholder="Port"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.imap.username}
              onChange={(event) => updateDraft("imap", { username: event.target.value })}
              placeholder="IMAP username"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.imap.password}
              onChange={(event) => updateDraft("imap", { password: event.target.value })}
              placeholder="IMAP password"
              disabled={managedMailMode}
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-white/65">
            <span>Use secure IMAP connection</span>
            <Switch
              checked={draft.imap.secure}
              onCheckedChange={(val) => updateDraft("imap", { secure: val })}
              disabled={managedMailMode}
            />
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Security" title="Session policy">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              value={draft.session.maxAgeHours}
              onChange={(event) =>
                updateDraft("session", { maxAgeHours: Number(event.target.value) || 1 })
              }
              placeholder="Session hours"
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <select
              value={draft.session.sameSite}
              onChange={(event) =>
                updateDraft("session", {
                  sameSite: event.target.value as AdminSettingsSnapshot["session"]["sameSite"],
                })
              }
              className="rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            >
              <option value="strict" className="bg-[#0a0d14]">
                Strict
              </option>
              <option value="lax" className="bg-[#0a0d14]">
                Lax
              </option>
              <option value="none" className="bg-[#0a0d14]">
                None
              </option>
            </select>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/65">
              <span>Secure cookies</span>
              <Switch
                checked={draft.session.secureCookies}
                onCheckedChange={(val) => updateDraft("session", { secureCookies: val })}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/65">
              <span>Allow multiple sessions</span>
              <Switch
                checked={draft.session.allowMultipleSessions}
                onCheckedChange={(val) =>
                  updateDraft("session", { allowMultipleSessions: val })
                }
              />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Notifications" title="Alert preferences">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/65">
              <span>Billing reminder emails</span>
              <Switch
                checked={draft.notifications.billingEmailEnabled}
                onCheckedChange={(val) =>
                  updateDraft("notifications", { billingEmailEnabled: val })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/65">
              <span>Inbox alerts</span>
              <Switch
                checked={draft.notifications.inboxAlerts}
                onCheckedChange={(val) =>
                  updateDraft("notifications", { inboxAlerts: val })
                }
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/65">
              <span>Sound effects in workspace</span>
              <Switch
                checked={draft.notifications.soundEffects}
                onCheckedChange={(val) =>
                  updateDraft("notifications", { soundEffects: val })
                }
              />
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div className="space-y-4">
        <SurfaceCard eyebrow="Integrations" title="Service endpoints">
          <div className="space-y-3">
            <input
              value={draft.integrations.nestUrl}
              onChange={(event) => updateDraft("integrations", { nestUrl: event.target.value })}
              placeholder="Nest API URL"
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.integrations.coreUrl}
              onChange={(event) => updateDraft("integrations", { coreUrl: event.target.value })}
              placeholder="Go core URL"
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.integrations.supportSocketUrl}
              onChange={(event) =>
                updateDraft("integrations", { supportSocketUrl: event.target.value })
              }
              placeholder="Support socket URL"
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
            <input
              value={draft.integrations.tasksSocketUrl}
              onChange={(event) =>
                updateDraft("integrations", { tasksSocketUrl: event.target.value })
              }
              placeholder="Tasks socket URL"
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Runtime" title="SQUARE MAIL CONFIGURATION ">
          <div className="space-y-3 text-sm text-white/70">
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">SMTP runtime</p>
              <p className="mt-2 text-white">
                {emailRuntime?.smtp.host || "No host configured"}:{emailRuntime?.smtp.port || 0}
              </p>
              <p className="mt-1 text-white/55">User: {emailRuntime?.smtp.username || "N/A"}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">IMAP runtime</p>
              <p className="mt-2 text-white">
                {emailRuntime?.imap.host || "No host configured"}:{emailRuntime?.imap.port || 0}
              </p>
              <p className="mt-1 text-white/55">User: {emailRuntime?.imap.username || "N/A"}</p>
            </div>
            <div className="rounded-[20px] border border-dashed border-white/12 p-4 text-xs text-white/55">
              Last saved {formatDateTime(settings.updatedAt)} · Nest{" "}
              {system?.nest.ok ? "connected" : "unreachable"} · Core{" "}
              {system?.core.ok ? "connected" : "unreachable"}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Actions" title="Settings controls">
          {saveError ? (
            <div className="rounded-[20px] border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-3.5 py-2.5 text-sm text-[#ffb49d]">
              {saveError}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-[18px] border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.12)] px-3.5 py-2.5 text-sm font-medium text-[var(--sq-brand-action)] disabled:opacity-50"
            >
              {isSaving ? "Saving settings..." : "Save settings"}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/70"
            >
              <LogoutCurve variant="Bulk" size={18} color="currentColor" />
              Logout
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-dashed border-[rgba(205,255,4,0.18)] bg-[rgba(205,255,4,0.05)] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--sq-brand-action)] text-[var(--sq-brand-black)]">
                <Setting2 variant="Bulk" size={18} color="currentColor" />
              </div>
              <p className="text-sm font-medium text-white">System settings workspace</p>
            </div>
            <p className="mt-3 text-sm text-white/55">
              This page writes directly to the admin settings backend and uses runtime mail
              configuration from the server.
            </p>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Identity security</p>
              <p className="mt-2 text-sm text-white/65">
                Open the dedicated 2FA workspace to scan a QR code, activate authenticator sign-in,
                or remove it with a fresh verification code.
              </p>
              <Link
                href="/session/2fa"
                className="mt-3 inline-flex rounded-full border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.1)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-sq-brand-action transition hover:bg-[rgba(205,255,4,0.16)]"
              >
                Open 2FA workspace
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </form>
  );
}

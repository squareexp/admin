"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  DirectInbox,
  Global,
  LogoutCurve,
  NotificationBing,
  Setting2,
  ShieldTick,
} from "iconsax-react";
import type { AdminSettingsSnapshot } from "@/lib/admin-types";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminSettingsSnapshot | null;
  isSaving: boolean;
  saveError: string | null;
  onSave: (settings: AdminSettingsSnapshot) => Promise<void>;
  onLogout: () => void;
}

const emptySettings: AdminSettingsSnapshot = {
  updatedAt: "",
  smtp: {
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    fromAddress: "",
  },
  imap: {
    host: "",
    port: 993,
    secure: true,
    username: "",
    password: "",
    useSmtpDefaults: true,
  },
  session: {
    maxAgeHours: 24,
    sameSite: "strict",
    secureCookies: true,
    allowMultipleSessions: false,
  },
  integrations: {
    nestUrl: "",
    coreUrl: "",
    supportSocketUrl: "",
    tasksSocketUrl: "",
  },
  notifications: {
    billingEmailEnabled: true,
    inboxAlerts: true,
    soundEffects: true,
  },
};

const inferImapHostFromSmtpHost = (smtpHost: string) => {
  const trimmed = smtpHost.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("smtp.")) {
    return `imap.${trimmed.slice("smtp.".length)}`;
  }

  return trimmed;
};

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  isSaving,
  saveError,
  onSave,
  onLogout,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState<AdminSettingsSnapshot>(settings || emptySettings);
  const isReady = Boolean(settings);

  useEffect(() => {
    if (settings) {
      setDraft(settings);
    }
  }, [settings]);

  const updateDraft = <Section extends keyof AdminSettingsSnapshot>(
    section: Section,
    patch: Partial<AdminSettingsSnapshot[Section]>,
  ) => {
    setDraft((current) => ({
      ...current,
      [section]: {
        ...(current[section] as object),
        ...patch,
      },
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(draft);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,12,18,0.98),rgba(7,9,14,0.96))] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--sq-brand-action)]/78">
                  Settings
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Admin system controls</h2>
                <p className="mt-2 max-w-3xl text-sm text-white/55">
                  Manage SMTP, IMAP, session policy, backend routes, notification behavior, and
                  account controls from one place.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <Setting2 variant="Bulk" size={20} color="currentColor" />
                    <div>
                      <p className="text-sm font-semibold text-white">SMTP mail transport</p>
                      <p className="mt-1 text-sm text-white/50">Used for welcome emails, reminders, and outgoing notifications.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input
                      value={draft.smtp.host}
                      onChange={(event) => updateDraft("smtp", { host: event.target.value })}
                      placeholder="SMTP host"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      type="number"
                      value={draft.smtp.port}
                      onChange={(event) => updateDraft("smtp", { port: Number(event.target.value) || 0 })}
                      placeholder="Port"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.smtp.username}
                      onChange={(event) => updateDraft("smtp", { username: event.target.value })}
                      placeholder="SMTP username"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.smtp.password}
                      onChange={(event) => updateDraft("smtp", { password: event.target.value })}
                      placeholder="SMTP password"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.smtp.fromAddress}
                      onChange={(event) => updateDraft("smtp", { fromAddress: event.target.value })}
                      placeholder="From address"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none md:col-span-2"
                    />
                  </div>

                  <Label className="mt-4 flex items-center justify-between gap-3 text-sm text-white/65">
                    Use secure SMTP transport
                    <Switch checked={draft.smtp.secure} onCheckedChange={(checked) => updateDraft("smtp", { secure: !!checked })} />
                  </Label>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <DirectInbox variant="Bulk" size={20} color="currentColor" />
                    <div>
                      <p className="text-sm font-semibold text-white">IMAP mailbox sync</p>
                      <p className="mt-1 text-sm text-white/50">Prepared for inbox sync and admin-side mailbox operations.</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-dashed border-white/15 bg-black/20 px-4 py-3">
                    <Label className="flex items-center justify-between gap-3 text-sm text-white/70 font-normal hover:cursor-pointer">
                      <span>Use SMTP defaults for IMAP credentials</span>
                      <Switch
                        checked={draft.imap.useSmtpDefaults}
                        onCheckedChange={(checked) =>
                          updateDraft("imap", { useSmtpDefaults: !!checked })
                        }
                      />
                    </Label>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-white/45">
                        When enabled, empty IMAP host/user/password fields inherit SMTP values.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft("imap", {
                            host: draft.imap.host || inferImapHostFromSmtpHost(draft.smtp.host),
                            username: draft.smtp.username,
                            password: draft.smtp.password,
                          })
                        }
                        className="rounded-full border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.1)] px-3 py-1 text-xs font-medium text-sq-brand-action"
                      >
                        Copy SMTP to IMAP
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input
                      value={draft.imap.host}
                      onChange={(event) => updateDraft("imap", { host: event.target.value })}
                      placeholder="IMAP host"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      type="number"
                      value={draft.imap.port}
                      onChange={(event) => updateDraft("imap", { port: Number(event.target.value) || 0 })}
                      placeholder="Port"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.imap.username}
                      onChange={(event) => updateDraft("imap", { username: event.target.value })}
                      placeholder="IMAP username"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.imap.password}
                      onChange={(event) => updateDraft("imap", { password: event.target.value })}
                      placeholder="IMAP password"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>

                  <Label className="mt-4 flex items-center justify-between gap-3 text-sm text-white/65">
                    Use secure IMAP connection
                    <Switch
                      checked={draft.imap.secure}
                      onCheckedChange={(checked) => updateDraft("imap", { secure: !!checked })}
                    />
                  </Label>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <ShieldTick variant="Bulk" size={20} color="currentColor" />
                    <div>
                      <p className="text-sm font-semibold text-white">Session and security</p>
                      <p className="mt-1 text-sm text-white/50">This controls admin cookie duration and browser session policy.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Input
                      type="number"
                      value={draft.session.maxAgeHours}
                      onChange={(event) =>
                        updateDraft("session", { maxAgeHours: Number(event.target.value) || 1 })
                      }
                      placeholder="Session hours"
                      className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Select
                      value={draft.session.sameSite}
                      onValueChange={(value) =>
                        updateDraft("session", {
                          sameSite: value as AdminSettingsSnapshot["session"]["sameSite"],
                        })
                      }
                    >
                      <SelectTrigger className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none h-auto">
                        <SelectValue placeholder="Select sameSite" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0d14] border-white/10 text-white">
                        <SelectItem value="strict">Strict</SelectItem>
                        <SelectItem value="lax">Lax</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Label className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65 font-normal hover:cursor-pointer">
                      Secure cookies
                      <Switch
                        checked={draft.session.secureCookies}
                        onCheckedChange={(checked) =>
                          updateDraft("session", { secureCookies: !!checked })
                        }
                      />
                    </Label>
                    <Label className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65 font-normal hover:cursor-pointer">
                      Allow multiple sessions
                      <Switch
                        checked={draft.session.allowMultipleSessions}
                        onCheckedChange={(checked) =>
                          updateDraft("session", { allowMultipleSessions: !!checked })
                        }
                      />
                    </Label>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <Global variant="Bulk" size={20} color="currentColor" />
                    <div>
                      <p className="text-sm font-semibold text-white">Backend and socket routes</p>
                      <p className="mt-1 text-sm text-white/50">Keep connected services visible and editable.</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Input
                      value={draft.integrations.nestUrl}
                      onChange={(event) => updateDraft("integrations", { nestUrl: event.target.value })}
                      placeholder="Nest API URL"
                      className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.integrations.coreUrl}
                      onChange={(event) => updateDraft("integrations", { coreUrl: event.target.value })}
                      placeholder="Go core URL"
                      className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.integrations.supportSocketUrl}
                      onChange={(event) => updateDraft("integrations", { supportSocketUrl: event.target.value })}
                      placeholder="Support socket URL"
                      className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                    <Input
                      value={draft.integrations.tasksSocketUrl}
                      onChange={(event) => updateDraft("integrations", { tasksSocketUrl: event.target.value })}
                      placeholder="Tasks socket URL"
                      className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    />
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <NotificationBing variant="Bulk" size={20} color="currentColor" />
                    <div>
                      <p className="text-sm font-semibold text-white">Notification behavior</p>
                      <p className="mt-1 text-sm text-white/50">Control billing emails and admin workspace alerts.</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Label className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65 font-normal hover:cursor-pointer">
                      Enable billing reminder emails
                      <Switch
                        checked={draft.notifications.billingEmailEnabled}
                        onCheckedChange={(checked) =>
                          updateDraft("notifications", { billingEmailEnabled: !!checked })
                        }
                      />
                    </Label>
                    <Label className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65 font-normal hover:cursor-pointer">
                      Enable inbox alerts
                      <Switch
                        checked={draft.notifications.inboxAlerts}
                        onCheckedChange={(checked) =>
                          updateDraft("notifications", { inboxAlerts: !!checked })
                        }
                      />
                    </Label>
                    <Label className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65 font-normal hover:cursor-pointer">
                      Enable sound effects
                      <Switch
                        checked={draft.notifications.soundEffects}
                        onCheckedChange={(checked) =>
                          updateDraft("notifications", { soundEffects: !!checked })
                        }
                      />
                    </Label>
                  </div>
                </section>

                {saveError ? (
                  <div className="rounded-[20px] border border-[#ff8a65]/20 bg-[#ff8a65]/10 px-4 py-3 text-sm text-[#ffb49d]">
                    {saveError}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={isSaving || !isReady}
                    className="rounded-[18px] border border-[rgba(205,255,4,0.24)] bg-[rgba(205,255,4,0.12)] px-4 py-3 text-sm font-medium text-[var(--sq-brand-action)] disabled:opacity-50"
                  >
                    {!isReady ? "Loading settings..." : isSaving ? "Saving settings..." : "Save settings"}
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
                  >
                    <LogoutCurve variant="Bulk" size={18} color="currentColor" />
                    Logout
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

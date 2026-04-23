"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck, QrCode, Smartphone, Loader2, LockKeyhole } from "lucide-react";
import AnimatedButton from "@/components/ui/ButtonX";
import { Input } from "@/components/ui/core";
import { useNotchToast } from "@/components/Notchjs";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";
import {
  confirm2FASetupAction,
  disable2FAAction,
  setup2FAAction,
  type AuthState,
} from "@/app/actions";
import type { UserProfile } from "@/lib/admin-types";
import Image from "next/image";

const initialState: AuthState = {
  error: "",
  message: "",
  success: false,
  qrCode: "",
  secret: "",
  twoFactorEnabled: false,
};

export default function TwoFactorSetupPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [setupState, setupAction, isSettingUp] = useActionState(setup2FAAction, initialState);
  const [confirmState, confirmAction, isConfirming] = useActionState(confirm2FASetupAction, initialState);
  const [disableState, disableAction, isDisabling] = useActionState(disable2FAAction, initialState);
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load account profile");
        }
        return response.json();
      })
      .then((data: UserProfile) => {
        if (!cancelled) {
          setProfile(data);
          setIsProfileLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isPending = isSettingUp || isConfirming || isDisabling;
    const activeState = disableState.error || disableState.message
      ? disableState
      : confirmState.error || confirmState.message
        ? confirmState
        : setupState;

    if (isPending) {
      toastId.current = toast({
        type: "loading",
        message: isSettingUp
          ? "Preparing authenticator setup..."
          : isConfirming
            ? "Activating 2FA..."
            : "Disabling 2FA...",
        position: "bottom-right",
      });
      return;
    }

    if (!toastId.current) return;

    if (activeState?.error) {
      update(toastId.current, {
        type: "error",
        message: activeState.error,
        duration: 4000,
      });
    } else if (activeState?.message) {
      update(toastId.current, {
        type: "success",
        message: activeState.message,
        duration: 3500,
      });
    } else {
      dismiss(toastId.current);
    }

    toastId.current = null;
  }, [confirmState, disableState, dismiss, isConfirming, isDisabling, isSettingUp, setupState, toast, update]);

  useEffect(() => {
    if (confirmState.success) {
      setProfile((current) => (current ? { ...current, twoFactorEnabled: true } : current));
    }
  }, [confirmState.success]);

  useEffect(() => {
    if (disableState.success) {
      setProfile((current) => (current ? { ...current, twoFactorEnabled: false } : current));
    }
  }, [disableState.success]);

  const activeSetup = useMemo(() => {
    if (confirmState.success) {
      return null;
    }

    if (setupState.qrCode || setupState.secret) {
      return setupState;
    }

    return null;
  }, [confirmState.success, setupState]);

  return (
    <AuthShell
      aside={
        <DefaultAuthAside
          eyebrow="Security Workspace"
          title="Activate layered account protection"
          paragraphs={[
            "Two-factor authentication adds a device-bound authenticator check after your password so sign-in cannot rely on a single secret alone.",
            "Complete the QR setup and confirmation once, then every future login will require your one-time code before the admin session opens.",
          ]}
        />
      }
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">Account Security</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">Two-factor authentication</h1>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/55">
            Scan the QR code with your authenticator app, confirm the generated code, and future sign-ins will require second-factor verification.
          </p>
        </div>
        <div className="flex">
          <Image src="/arrow.png" alt="Square Experience" width={400} height={400} priority className="  select-none selection:bg-transparent h-[40px] w-auto opacity-60  " /> </div>

      </div>

      {isProfileLoading ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
          Loading account security state...
        </div>
      ) : profile?.twoFactorEnabled ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-medium">Two-factor authentication is active on this account.</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Your next login will require a 6-digit authenticator code after the password step. If you need to remove 2FA, confirm with a fresh code below.
            </p>
          </div>

          <form action={disableAction} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <LockKeyhole className="h-5 w-5 text-sq-brand-action" />
              <div>
                <p className="text-sm font-medium">Disable 2FA</p>
                <p className="text-xs text-white/45">Enter the current authenticator code to remove second-factor sign-in.</p>
              </div>
            </div>
            <Input
              name="code"
              type="text"
              placeholder="000000"
              required
              maxLength={6}
              className="border-white/12 bg-black/25 text-center text-xl tracking-[0.4em] text-white"
            />
            {disableState?.error ? (
              <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                {disableState.error}
              </div>
            ) : null}
            <AnimatedButton
              type="submit"
              className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDisabling}
            >
              {isDisabling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable 2FA"}
            </AnimatedButton>
          </form>
        </div>
      ) : (
        <div className="space-y-5">
         
          {!activeSetup?.qrCode ? (
            <form action={setupAction} className="mt-4">
              <AnimatedButton
                type="submit"
                className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSettingUp}
              >
                {isSettingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate QR code"}
              </AnimatedButton>
            </form>
          ) : (
            <div className="grid gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 lg:grid-cols-[160px_1fr] items-center">
              <div className="rounded-[16px] border border-white/10 bg-white p-2">
                <img src={activeSetup.qrCode} alt="2FA QR code" className="h-auto w-full rounded-[10px]" />
              </div>
              <div className="space-y-4">
                {activeSetup.secret ? (
                  <div className="rounded-xl border border-dashed border-white/15 bg-black/25 px-4 py-3 text-xs text-white/55">
                    Manual secret: <span className="font-mono tracking-[0.12em] text-white/80">{activeSetup.secret}</span>
                  </div>
                ) : null}
                <form action={confirmAction} className="space-y-4">
                  <Input
                    name="code"
                    type="text"
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="border-white/12 bg-black/25 text-center text-xl tracking-[0.4em] text-white"
                  />
                  {confirmState?.error ? (
                    <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                      {confirmState.error}
                    </div>
                  ) : null}
                  <AnimatedButton
                    type="submit"
                    className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isConfirming}
                  >
                    {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate 2FA"}
                  </AnimatedButton>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
<hr className="my-4 divider-dashed" />
      <div className="mt-6 text-center text-sm text-white/50">
        Back to{" "}
        <Link href="/" className="text-sq-brand-action hover:underline">
          dashboard
        </Link>
      </div>
    </AuthShell>
  );
}

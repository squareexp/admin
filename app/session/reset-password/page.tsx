"use client";

import { Suspense, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  passwordResetConfirmAction,
  passwordResetRequestAction,
} from "@/app/actions";
import { Input } from "@/components/ui/core";
import { Loader2, KeyRound, Mail } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";
import AnimatedButton from "@/components/ui/ButtonX";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";

const initialState = { error: "", message: "", success: false };

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [requestState, requestAction, isRequesting] = useActionState(
    passwordResetRequestAction,
    initialState,
  );
  const [confirmState, confirmAction, isConfirming] = useActionState(
    passwordResetConfirmAction,
    initialState,
  );

  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);

  const isPending = isRequesting || isConfirming;
  const activeState = token ? confirmState : requestState;

  useEffect(() => {
    if (isPending) {
      toastId.current = toast({
        type: "loading",
        message: token ? "Updating password..." : "Sending reset link...",
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
  }, [activeState, dismiss, isPending, token, toast, update]);

  return (
    <AuthShell
      aside={
        <DefaultAuthAside
          eyebrow="Account Security"
          title={token ? "Choose a new protected password" : "Recover access securely"}
          paragraphs={[
            "Reset requests are handled through time-bound links so password recovery remains limited to the inbox owner.",
            "Once you regain access, you can strengthen future sign-ins by enabling two-factor authentication from the security workspace.",
          ]}
        />
      }
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">Account Security</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
          {token ? "Set a new password" : "Reset your password"}
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/55">
          {token
            ? "Use a strong password with uppercase, lowercase, and a number before you return to sign-in."
            : "Enter your email and we will send a password reset link to your inbox."}
        </p>
      </div>

      {token ? (
        <form action={confirmAction} className="space-y-5">
          <input type="hidden" name="token" value={token} />
          <Input
            name="newPassword"
            type="password"
            label="New password"
            placeholder="At least 8 chars, mixed case + number"
            required
            minLength={8}
            className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
          />
          {confirmState?.error ? (
            <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {confirmState.error}
            </div>
          ) : null}
          {confirmState?.success ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              {confirmState.message}
            </div>
          ) : null}
          <AnimatedButton
            type="submit"
            className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isConfirming}
          >
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Update password
          </AnimatedButton>
        </form>
      ) : (
        <form action={requestAction} className="space-y-5">
          <Input
            name="email"
            type="email"
            label="Account email"
            placeholder="name@example.com"
            required
            className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
          />
          {requestState?.error ? (
            <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {requestState.error}
            </div>
          ) : null}
          {requestState?.success ? (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              {requestState.message}
            </div>
          ) : null}
          <AnimatedButton
            type="submit"
            className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRequesting}
          >
            {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send reset link
          </AnimatedButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        Back to{" "}
        <Link href="/session/access" className="text-sq-brand-action hover:underline">
          sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white/60">
          Loading reset screen...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

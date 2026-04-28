"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loginAction, verify2FAAction } from "@/app/actions";

import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";
import AnimatedButton from "@/components/ui/ButtonX";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState = {
  error: "",
  requires2FA: false,
  userId: "",
};

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, initialState);
  const [verifyState, verifyAction, isVerifying] = useActionState(verify2FAAction, { error: "" });
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isPending) {
      toastId.current = toast({
        type: "loading",
        message: "Signing in...",
        position: "bottom-right",
      });
    } else if (isVerifying) {
      toastId.current = toast({
        type: "loading",
        message: "Verifying 2FA...",
        position: "bottom-right",
      });
    } else if (toastId.current) {
      if (state?.error || verifyState?.error) {
        update(toastId.current, {
          type: "error",
          message: state?.error || verifyState?.error,
          duration: 4000,
        });
      } else {
        dismiss(toastId.current);
      }
      toastId.current = null;
    }

    return () => {
      if (toastId.current) {
        dismiss(toastId.current);
        toastId.current = null;
      }
    };
  }, [dismiss, isPending, isVerifying, state, toast, update, verifyState]);

  const requires2FA = state?.requires2FA;

  return (
    <AuthShell
      aside={
        <DefaultAuthAside
          eyebrow="SQUARE EXPERIENCE"
          title="Internal Command Center"
          paragraphs={[
            "Welcome to the secure operational control center. This environment keeps collaboration, approvals, billing, and delivery workflows aligned under one protected workspace.",
            "Operating under zero-trust controls, this gateway limits access to verified personnel, hardened sessions, and role-based workspace visibility.",
          ]}
        />
      }
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/70">Authentication</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            {requires2FA ? "Verify 2FA code" : "Sign in"}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/55">
            {requires2FA
              ? "Complete your second-factor check to unlock the workspace."
              : "Use your work credentials to continue into the admin environment."}
          </p>
        </div>
        <div className="flex">
          <Image src="/arrow.png" alt="Square Experience" width={400} height={400} priority className="  select-none selection:bg-transparent h-[40px] w-auto opacity-60  " /> </div>
      </div>

      {!requires2FA ? (
        <form action={action} className="space-y-5">
          <div className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="name@squareexp.com"
              required
              className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
            />
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={8}
                className="border-white/12 bg-black/25 pr-11 text-white placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-[37px] text-white/35 transition-colors hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <Link href="/session/reset-password" className="text-white/50 hover:text-sq-brand-action">
              Forgot password?
            </Link>
            <span className="text-white/35">Min 8 chars + mixed case</span>
          </div>

          <AnimatedButton
            type="submit"
            className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </AnimatedButton>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-5">
          <input type="hidden" name="userId" value={state.userId} />
          <div className="rounded-2xl border border-dashed border-sq-brand-action/30 bg-sq-brand-action/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-sq-brand-action/70">Authenticator</p>
            <p className="mt-2 text-sm text-white/70">
              Open your authenticator app and enter the 6-digit code tied to this account.
            </p>
            <Input
              name="code"
              type="text"
              placeholder="000000"
              required
              maxLength={6}
              className="mt-4 border-white/15 bg-black/25 text-center text-2xl tracking-[0.48em] text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              Back
            </Button>
            <AnimatedButton
              type="submit"
              className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVerifying}
            >
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify
            </AnimatedButton>
          </div>
        </form>
      )}

      <div className="mt-7 border-t border-white/10 pt-5 text-center text-xs text-white/45">
        {!requires2FA ? (
          <>
            Need an account?{" "}
            <Link href="/session/new" className="text-sq-brand-action hover:underline">
              Request admin access
            </Link>
          </>
        ) : (
          "Two-factor verification is required for this account."
        )}
      </div>
    </AuthShell>
  );
}

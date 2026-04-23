"use client";

import { Suspense, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyAction } from "@/app/actions";
import { Input } from "@/components/ui/core";
import { Loader2, BadgeCheck } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";
import AnimatedButton from "@/components/ui/ButtonX";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";

const initialState = {
  error: "",
};

function VerifyForm() {
  const [state, action, isPending] = useActionState(verifyAction, initialState);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      toastId.current = toast({
        type: "loading",
        message: "Verifying account...",
        position: "top-center",
      });
    } else if (toastId.current) {
      if (state?.error) {
        update(toastId.current, {
          type: "error",
          message: state.error,
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
  }, [dismiss, isPending, state, toast, update]);

  return (
    <AuthShell
      aside={
        <DefaultAuthAside
          eyebrow="Account Verification"
          title="Confirm your inbox before first access"
          paragraphs={[
            "A short-lived verification code is sent to your work email when registration is created.",
            "Once your inbox is confirmed, sign-in opens and you can continue to optional 2FA setup for stronger protection.",
          ]}
        />
      }
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">Account Verification</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">Confirm your code</h1>
        <p className="mt-3 max-w-md text-sm text-white/55">
          Enter the 6-digit verification code sent to your inbox to activate your admin account.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <Input
          name="email"
          type="email"
          label="Email"
          defaultValue={email}
          readOnly={!!email}
          required
          className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
        />
        <Input
          name="code"
          label="Verification code"
          placeholder="123456"
          required
          minLength={6}
          maxLength={6}
          className="border-white/12 bg-black/25 text-center text-xl tracking-[0.4em] text-white placeholder:text-white/35"
        />

        {state?.error ? (
          <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}

        <AnimatedButton
          type="submit"
          className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
          Verify account
        </AnimatedButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already verified?{" "}
        <Link href="/session/access" className="text-sq-brand-action hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#070a12] text-white/60">Loading verification screen...</div>}>
      <VerifyForm />
    </Suspense>
  );
}

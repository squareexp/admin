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
  const code = searchParams.get("code") || "";
  const provider = searchParams.get("provider") || "";
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submittedFromLink = useRef(false);

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

  useEffect(() => {
    if (!email || !code || submittedFromLink.current || isPending) {
      return;
    }

    submittedFromLink.current = true;
    formRef.current?.requestSubmit();
  }, [code, email, isPending]);

  return (
    <AuthShell
      aside={
        <DefaultAuthAside
          eyebrow="Account Verification"
          title="Confirm your inbox before first access"
          paragraphs={[
            "A short-lived verification link is sent to your work email when registration is created.",
            "Once your inbox is confirmed, sign-in opens and you can continue to optional 2FA setup for stronger protection.",
          ]}
        />
      }
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">Account Verification</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">Confirm your account</h1>
        <p className="mt-3 max-w-md text-sm text-white/55">
          Open the secure email link or enter the verification code to activate your admin account.
        </p>
      </div>

      <form ref={formRef} action={action} className="space-y-5">
        <Input
          name="email"
          type="email"
          label="Email"
          defaultValue={email}
          readOnly={!!email}
          required
          className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
        />
        {code ? (
          <>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="provider" value={provider} />
            <div className="rounded-[16px] border border-[rgba(205,255,4,0.22)] bg-[rgba(205,255,4,0.1)] px-4 py-3 text-sm text-sq-brand-action">
              Secure verification link detected. Finishing account confirmation...
            </div>
          </>
        ) : (
          <Input
            name="code"
            label="Verification code"
            placeholder="123456"
            required
            minLength={6}
            maxLength={128}
            className="border-white/12 bg-black/25 text-center text-xl tracking-[0.4em] text-white placeholder:text-white/35"
          />
        )}

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

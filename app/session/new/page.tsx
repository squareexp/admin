"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Loader2, UserPlus2 } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";
import AnimatedButton from "@/components/ui/ButtonX";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";

const initialState = {
  error: "",
};

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, initialState);
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      toastId.current = toast({
        type: "loading",
        message: "Creating account...",
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
          eyebrow="Admin Registration"
          title="Create a protected workspace identity"
          paragraphs={[
            "Every admin account begins behind email verification so only confirmed inboxes can enter the operations environment.",
            "After access is active, you can enable two-factor authentication to harden sign-in with a device-bound one-time code.",
          ]}
        />
      }
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.26em] text-sq-brand-action/75">Admin Registration</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">Create an admin account</h1>
        <p className="mt-3 max-w-md text-sm text-white/55">
          Use your work email and a strong password. We will send a verification code before sign-in is enabled.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <Input
          name="username"
          placeholder="Jane Well"
          required
          className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
        />
        <Input
          name="email"
          type="email"
          placeholder="name@squareexp.com"
          required
          className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
        />
        <Input
          name="password"
          type="password"
          placeholder="At least 8 chars, mixed case + number"
          required
          minLength={8}
          className="border-white/12 bg-black/25 text-white placeholder:text-white/35"
        />

        {state?.error ? (
          <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </div>
        ) : null}

        {isPending ? <AnimatedButton isLoading={true} className="h-4 w-4 animate-spin" > Loading... </AnimatedButton> : <AnimatedButton
          type="submit"
          className="w-full gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {"Create account"}
        </AnimatedButton>}
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/session/access" className="text-sq-brand-action hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

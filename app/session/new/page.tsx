"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Eye, EyeOff, Loader2, UserPlus2 } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";
import AnimatedButton from "@/components/ui/ButtonX";
import { AuthShell, DefaultAuthAside } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";

const initialState = {
  error: "",
};

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
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
          title="Create a team identity"
          paragraphs={[
            "Every admin account begins behind email verification so only confirmed inboxes can enter the operations environment.",
            "After access is active, you can enable two-factor authentication to harden sign-in with a device-bound one-time code.",
          ]}
        />
      }
    >
      <div className="mb-8">
        <p className="mt-3 max-w-md text-sm  text-white/55">
          Use your work email and a strong password. We will send a verification code before sign-in is enabled.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <Input
          name="username"
          placeholder="Username"
          required
          className="input-clear"
        />
        <Input
          name="email"
          type="email"
          placeholder="name@squareexp.com"
          required
          className="input-clear"
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 chars, mixed case + number"
            required
            minLength={8}
            className="input-clear pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 focus:outline-none"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

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

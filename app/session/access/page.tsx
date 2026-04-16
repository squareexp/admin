"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions";
import { Button, Input } from "@/components/ui/core";
import { Loader2 } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, initialState);
  const { toast, update, dismiss } = useNotchToast();
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      toastId.current = toast({
        type: 'loading',
        message: 'Signing in...',
        position: 'bottom-right'
      });
    } else {
      if (toastId.current) {
        if (state?.error) {
          update(toastId.current, {
            type: 'error',
            message: state.error,
            duration: 4000
          });
        } else {
           // Success case - likely redirecting, but let's show success briefly or dismiss
           dismiss(toastId.current);
        }
        toastId.current = null;
      }
    }
  }, [isPending, state, toast, update, dismiss]);

  return (
    <div className="min-h-screen  bg-dark-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8  p-8 rounded-3xl  ">
        <div className="text-center space-y-2">
          
          <h1 className="text-2xl font-bold text-white">Welcome back our forum</h1>
          <p className="text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="name@example.com"
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
            />
          </div>

          {state?.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {state.error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/session/new"
            className="text-brand-yellow hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

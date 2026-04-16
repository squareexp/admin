"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Button, Input } from "@/components/ui/core";
import { Loader2 } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";

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
        type: 'loading',
        message: 'Creating account...',
        position: 'top-center'
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
           dismiss(toastId.current);
        }
        toastId.current = null;
      }
    }
  }, [isPending, state, toast, update, dismiss]);

  return (
    <div className="min-h-screen flex items-center bg-dark-800 justify-center p-4">
      <div className="w-full max-w-md space-y-8  p-8 ">
        <div className="text-center space-y-2">
         
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-gray-400">Enter your information to get started</p>
        </div>

        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="username"
              label="Username"
              placeholder="johndoe"
              required
            />
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
              placeholder="Create a password"
              required
              minLength={6}
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
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/session/access"
            className="text-brand-yellow hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

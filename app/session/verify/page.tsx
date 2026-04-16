"use client";

import { useActionState, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { verifyAction } from "@/app/actions";
import { Button, Input } from "@/components/ui/core";
import { Loader2 } from "lucide-react";
import { useNotchToast } from "@/components/Notchjs";

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
        type: 'loading',
        message: 'Verifying...',
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-dark-800 p-8 rounded-3xl border border-dark-700">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-brand-yellow rounded-xl mx-auto flex items-center justify-center text-black font-bold text-xl mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold text-white">Verify your email</h1>
          <p className="text-gray-400">Enter the verification code sent to your email</p>
        </div>

        <form action={action} className="space-y-6">
          <div className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              defaultValue={email}
              readOnly={!!email}
              required
            />
            <Input
              name="code"
              label="Verification Code"
              placeholder="123456"
              required
              minLength={6}
              maxLength={6}
              className="text-center tracking-widest text-lg"
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
            Verify Email
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}

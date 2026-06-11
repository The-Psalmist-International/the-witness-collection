"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { requestPasswordReset } from "@/app/admin/actions/auth";
import { AuthSuccessScreen } from "@/app/components/auth/AuthSuccessScreen";
import { useToast } from "@/app/components/toast/toast-context";
import {
  initialAdminFormState,
  type AdminFormState,
} from "@/app/lib/admin/types";

export function AdminForgotPasswordForm() {
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    requestPasswordReset,
    initialAdminFormState
  );

  const wasPending = useRef(false);

  useEffect(() => {
    if (
      wasPending.current &&
      !pending &&
      state.status === "error" &&
      state.message
    ) {
      toast({
        variant: "error",
        title: "Reset link not sent",
        description: state.message,
      });
    }

    wasPending.current = pending;
  }, [pending, state.message, state.status, toast]);

  if (state.status === "success") {
    return (
      <AuthSuccessScreen
        title="Check your email"
        description={state.message}
        actionLabel="Back to sign in"
        actionHref="/admin"
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-center text-[1.75rem] font-semibold tracking-tight text-black">
        Forgot password
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-neutral-500">
        Enter your work email and we&apos;ll send you a reset link if an
        account exists.
      </p>

      <form action={formAction} className="mt-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-black">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-purple-950"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        <Link
          href="/admin"
          className="font-medium text-purple-950 transition-colors hover:text-purple-900"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomer } from "@/app/actions/customer-auth";
import {
  initialCustomerAuthState,
  type CustomerAuthState,
} from "@/app/lib/customer/types";
import { useToast } from "@/app/components/toast/toast-context";
import { useEffect, useRef } from "react";

type CustomerLoginFormProps = {
  redirectTo?: string;
};

export function CustomerLoginForm({
  redirectTo = "/shop",
}: CustomerLoginFormProps) {
  const { toast } = useToast();
  const wasPending = useRef(false);
  const [state, formAction, pending] = useActionState<CustomerAuthState, FormData>(
    loginCustomer,
    initialCustomerAuthState
  );

  useEffect(() => {
    if (wasPending.current && !pending && state.status === "error" && state.message) {
      toast({
        variant: "error",
        title: "Sign in failed",
        description: state.message,
      });
    }

    wasPending.current = pending;
  }, [pending, state.message, state.status, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-black">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-12 rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-black">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:bg-neutral-300"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        New here?{" "}
        <Link
          href={`/account/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-purple-950 hover:text-purple-900"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

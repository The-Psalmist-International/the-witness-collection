"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { registerCustomer } from "@/app/actions/customer-auth";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import {
  initialCustomerAuthState,
  type CustomerAuthState,
} from "@/app/lib/customer/types";
import { useToast } from "@/app/components/toast/toast-context";

type CustomerRegisterFormProps = {
  redirectTo?: string;
};

export function CustomerRegisterForm({
  redirectTo = "/shop",
}: CustomerRegisterFormProps) {
  const { toast } = useToast();
  const wasPending = useRef(false);
  const [state, formAction, pending] = useActionState<CustomerAuthState, FormData>(
    registerCustomer,
    initialCustomerAuthState
  );

  useEffect(() => {
    if (wasPending.current && !pending && state.status === "error" && state.message) {
      toast({
        variant: "error",
        title: "Registration failed",
        description: state.message,
      });
    }

    wasPending.current = pending;
  }, [pending, state.message, state.status, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-semibold text-black">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm font-semibold text-black">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
          />
        </div>
      </div>

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
          className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-sm font-semibold text-black">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="billingAddress"
          className="text-sm font-semibold text-black"
        >
          Billing address
        </label>
        <LocationAutocomplete
          id="billingAddress"
          name="billingAddress"
          required
          placeholder="Start typing your billing address"
          className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
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
          minLength={8}
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-black"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none transition-colors focus:border-purple-950"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:bg-neutral-300"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href={`/account/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-purple-950 hover:text-purple-900"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

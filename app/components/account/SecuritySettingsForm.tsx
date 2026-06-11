"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changeCustomerPassword,
  type CustomerAccountState,
} from "@/app/actions/customer-account";
import { AccountSettingsRow } from "@/app/components/account/AccountSettingsRow";
import { useToast } from "@/app/components/toast/toast-context";

const initialState: CustomerAccountState = {
  status: "idle",
  message: "",
};

export function SecuritySettingsForm() {
  const { toast } = useToast();
  const wasPending = useRef(false);
  const [state, formAction, pending] = useActionState<
    CustomerAccountState,
    FormData
  >(changeCustomerPassword, initialState);

  useEffect(() => {
    if (wasPending.current && !pending && state.status === "success") {
      toast({
        variant: "success",
        title: "Password updated",
        description: state.message,
      });
    }

    if (wasPending.current && !pending && state.status === "error") {
      toast({
        variant: "error",
        title: "Password update failed",
        description: state.message,
      });
    }

    wasPending.current = pending;
  }, [pending, state.message, state.status, toast]);

  const passwordForm = (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="currentPassword"
          className="text-xs font-medium text-neutral-600"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-xs font-medium text-neutral-600"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-medium text-neutral-600"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:bg-neutral-300"
      >
        {pending ? "Updating..." : "Change password"}
      </button>
    </form>
  );

  return (
    <AccountSettingsRow
      label="Change password"
      description="Update your password to keep your account secure."
      value="••••••••"
      editContent={passwordForm}
    />
  );
}

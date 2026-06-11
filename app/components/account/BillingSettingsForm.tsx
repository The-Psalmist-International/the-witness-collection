"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateBillingAddress,
  type CustomerAccountState,
} from "@/app/actions/customer-account";
import { AccountSettingsRow } from "@/app/components/account/AccountSettingsRow";
import { LocationAutocomplete } from "@/app/components/LocationAutocomplete";
import type { CustomerSessionUser } from "@/app/lib/customer/types";
import { useToast } from "@/app/components/toast/toast-context";

const initialState: CustomerAccountState = {
  status: "idle",
  message: "",
};

type BillingSettingsFormProps = {
  customer: CustomerSessionUser;
};

export function BillingSettingsForm({ customer }: BillingSettingsFormProps) {
  const { toast } = useToast();
  const wasPending = useRef(false);
  const [state, formAction, pending] = useActionState<
    CustomerAccountState,
    FormData
  >(updateBillingAddress, initialState);

  useEffect(() => {
    if (wasPending.current && !pending && state.status === "success") {
      toast({
        variant: "success",
        title: "Billing address saved",
        description: state.message,
      });
    }

    if (wasPending.current && !pending && state.status === "error") {
      toast({
        variant: "error",
        title: "Update failed",
        description: state.message,
      });
    }

    wasPending.current = pending;
  }, [pending, state.message, state.status, toast]);

  const billingForm = (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="billingAddress"
          className="text-xs font-medium text-neutral-600"
        >
          Billing address
        </label>
        <LocationAutocomplete
          id="billingAddress"
          name="billingAddress"
          required
          defaultValue={customer.billingAddress ?? ""}
          placeholder="Start typing your billing address"
          className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:bg-neutral-300"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );

  return (
    <AccountSettingsRow
      label="Billing address"
      description="Used by default during checkout. You can choose a different delivery address per order."
      value={customer.billingAddress || "No billing address saved yet."}
      editContent={billingForm}
      defaultOpen={!customer.billingAddress}
    />
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateProfile,
  type CustomerAccountState,
} from "@/app/actions/customer-account";
import { AccountSettingsRow } from "@/app/components/account/AccountSettingsRow";
import type { CustomerSessionUser } from "@/app/lib/customer/types";
import { useToast } from "@/app/components/toast/toast-context";

const initialState: CustomerAccountState = {
  status: "idle",
  message: "",
};

type ProfileSettingsFormProps = {
  customer: CustomerSessionUser;
};

export function ProfileSettingsForm({ customer }: ProfileSettingsFormProps) {
  const { toast } = useToast();
  const wasPending = useRef(false);
  const [state, formAction, pending] = useActionState<
    CustomerAccountState,
    FormData
  >(updateProfile, initialState);

  useEffect(() => {
    if (wasPending.current && !pending && state.status === "success") {
      toast({
        variant: "success",
        title: "Profile updated",
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

  const profileForm = (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-xs font-medium text-neutral-600">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            defaultValue={customer.firstName}
            className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-xs font-medium text-neutral-600">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            defaultValue={customer.lastName}
            className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-xs font-medium text-neutral-600">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={customer.phone}
          className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-purple-950"
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
    <div>
      <AccountSettingsRow
        label="Email address"
        description="Used for sign-in and order updates."
        value={customer.email}
      />
      <AccountSettingsRow
        label="Personal information"
        description="Your name and phone number for order updates."
        value={
          <span>
            {`${customer.firstName} ${customer.lastName}`.trim()}
            <span className="mt-1 block text-neutral-500">{customer.phone}</span>
          </span>
        }
        editContent={profileForm}
      />
    </div>
  );
}

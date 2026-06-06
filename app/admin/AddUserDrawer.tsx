"use client";

import { useTransition } from "react";
import { addAdminUser } from "@/app/admin/actions";
import { AdminDrawer } from "@/app/admin/AdminDrawer";
import { UserPlusIcon } from "@/app/admin/AdminIcons";
import { StyledSelect } from "@/app/components/StyledSelect";
import { ADMIN_ROLES, ROLE_LABELS } from "@/app/lib/admin/roles";

type AddUserDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export function AddUserDrawer({ isOpen, onClose }: AddUserDrawerProps) {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addAdminUser(formData);
      onClose();
    });
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Users"
      title="Add team member"
      subtitle="An invite email with a temporary password will be sent."
      footer={
        <button
          type="submit"
          form="add-user-form"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-purple-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-purple-300"
        >
          <UserPlusIcon />
          {pending ? "Sending invite..." : "Add user"}
        </button>
      }
    >
      <form id="add-user-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="userFirstName"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              First name
            </label>
            <input
              id="userFirstName"
              name="firstName"
              type="text"
              required
              placeholder="Ama"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="userLastName"
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              Last name
            </label>
            <input
              id="userLastName"
              name="lastName"
              type="text"
              required
              placeholder="Mensah"
              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="userPhone"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Phone number
          </label>
          <input
            id="userPhone"
            name="phone"
            type="tel"
            required
            placeholder="+233 20 123 4567"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="userEmail"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Work email
          </label>
          <input
            id="userEmail"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-purple-950"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="userRole"
            className="text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            Role
          </label>
          <StyledSelect
            id="userRole"
            name="role"
            required
            placeholder="Select a role"
            options={ROLE_OPTIONS}
          />
        </div>
      </form>
    </AdminDrawer>
  );
}

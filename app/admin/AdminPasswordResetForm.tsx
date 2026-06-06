"use client";

import { useActionState, useState } from "react";
import { resetPassword } from "@/app/admin/actions";
import { EyeIcon, EyeOffIcon } from "@/app/admin/AdminIcons";
import {
  initialAdminFormState,
  type AdminFormState,
} from "@/app/lib/admin/types";

type AdminPasswordResetFormProps = {
  mode: "token" | "mandatory";
  token?: string;
  title: string;
  description: string;
};

export function AdminPasswordResetForm({
  mode,
  token = "",
  title,
  description,
}: AdminPasswordResetFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    resetPassword,
    initialAdminFormState
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-center text-[1.75rem] font-semibold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <form action={formAction} className="mt-10 flex flex-col gap-6">
        <input type="hidden" name="mode" value={mode} />
        {token ? <input type="hidden" name="token" value={token} /> : null}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-black"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 pr-12 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-purple-950"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-400 transition-colors hover:text-purple-950"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-black"
          >
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Re-enter your password"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 pr-12 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-purple-950"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-400 transition-colors hover:text-purple-950"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {state.status === "error" && state.message && (
          <p className="text-sm leading-5 text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {pending ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/admin/actions";
import { EyeIcon, EyeOffIcon } from "@/app/admin/AdminIcons";
import {
  initialAdminLoginState,
  type AdminLoginState,
} from "@/app/lib/admin/types";

export function AdminLoginForm({ isConfigured }: { isConfigured: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    initialAdminLoginState
  );

  return (
    <form action={formAction} className="mt-10 flex flex-col gap-6">
      {!isConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Set DATABASE_URL, ADMIN_SESSION_SECRET, and bootstrap admin credentials
          before signing in.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-black">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-purple-950"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-black">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
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

      {state.message && (
        <p className="text-sm leading-5 text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || !isConfigured}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {pending ? "Signing in..." : "Continue with email"}
        {!pending && (
          <span aria-hidden="true" className="text-base leading-none">
            ›
          </span>
        )}
      </button>

      <p className="text-center text-sm text-neutral-500">
        <Link
          href="/admin/forgot-password"
          className="font-medium text-purple-950 transition-colors hover:text-purple-900"
        >
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

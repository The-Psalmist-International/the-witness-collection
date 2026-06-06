"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/AdminLoginForm";
import { AuthSuccessScreen } from "@/app/components/auth/AuthSuccessScreen";

type AdminLoginContentProps = {
  isConfigured: boolean;
  resetSuccess?: boolean;
};

export function AdminLoginContent({
  isConfigured,
  resetSuccess = false,
}: AdminLoginContentProps) {
  const router = useRouter();

  const handleContinueToSignIn = () => {
    router.replace("/admin");
  };

  if (resetSuccess) {
    return (
      <AuthSuccessScreen
        title="Password updated"
        description="Your password has been saved. Sign in with your new password to continue."
        actionLabel="Continue to sign in"
        onAction={handleContinueToSignIn}
      />
    );
  }

  return (
    <>
      <h1 className="mt-8 text-center text-[1.75rem] font-semibold tracking-tight text-black">
        Sign in with email
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-neutral-500">
        Please enter your credentials to access the admin dashboard.
      </p>

      <AdminLoginForm isConfigured={isConfigured} />

      <p className="mt-10 text-center text-xs leading-5 text-neutral-400">
        Authorized admin access only. Manage orders, products, and pre-order
        activity for The Witness Collection.
      </p>

      <p className="mt-6 text-center text-xs text-neutral-400">
        <Link
          href="/"
          className="font-medium text-neutral-600 transition-colors hover:text-purple-950"
        >
          Back to store
        </Link>
      </p>
    </>
  );
}

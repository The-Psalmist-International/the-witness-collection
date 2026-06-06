"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ToastErrorIcon,
  ToastSuccessIcon,
  ToastWarningIcon,
} from "@/app/components/toast/ToastIcons";
import type { ToastVariant } from "@/app/components/toast/types";

type AuthSuccessScreenProps = {
  variant?: ToastVariant;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  children?: ReactNode;
};

const iconWrapperClass: Record<ToastVariant, string> = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-500",
};

function AuthStatusIcon({ variant }: { variant: ToastVariant }) {
  const className = `h-10 w-10 ${iconWrapperClass[variant]}`;

  if (variant === "error") {
    return <ToastErrorIcon className={className} />;
  }

  if (variant === "warning") {
    return <ToastWarningIcon className={className} />;
  }

  return <ToastSuccessIcon className={className} />;
}

export function AuthSuccessScreen({
  variant = "success",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  children,
}: AuthSuccessScreenProps) {
  const actionContent = actionLabel ? (
    actionHref ? (
      <Link
        href={actionHref}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900"
      >
        {actionLabel}
      </Link>
    ) : (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-900"
      >
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
        <AuthStatusIcon variant={variant} />
      </div>

      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral-500">{description}</p>

      {children ? <div className="mt-8">{children}</div> : null}

      {actionContent ? <div className="mt-8">{actionContent}</div> : null}
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ToastErrorIcon,
  ToastSuccessIcon,
  ToastWarningIcon,
} from "@/app/components/toast/ToastIcons";
import { ToastContext } from "@/app/components/toast/toast-context";
import type { ToastInput, ToastItem, ToastVariant } from "@/app/components/toast/types";

const variantIconClass: Record<ToastVariant, string> = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-500",
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = `h-5 w-5 shrink-0 ${variantIconClass[variant]}`;

  if (variant === "error") {
    return <ToastErrorIcon className={className} />;
  }

  if (variant === "warning") {
    return <ToastWarningIcon className={className} />;
  }

  return <ToastSuccessIcon className={className} />;
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      className="font-stack-sans pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-black shadow-lg"
    >
      <ToastIcon variant={toast.variant} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-black">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm leading-5 text-neutral-600">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:text-black"
        aria-label="Dismiss notification"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const nextToast: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "success",
        duration: input.duration ?? 5000,
      };

      setToasts((current) => [...current, nextToast]);

      if (nextToast.duration && nextToast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), nextToast.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6">
              <AnimatePresence mode="popLayout">
                {toasts.map((item) => (
                  <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
                ))}
              </AnimatePresence>
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}
